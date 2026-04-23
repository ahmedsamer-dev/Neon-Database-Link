import { Router, type IRouter } from "express";
import { db, productsTable, variantsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/admin";
import { formatProduct } from "../lib/format";

const router: IRouter = Router();

// List all products (including inactive) for admin
router.get("/admin/products", requireAdmin, async (_req, res) => {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.id));

  if (products.length === 0) {
    res.json([]);
    return;
  }

  const variants = await db.select().from(variantsTable);
  const byProduct = new Map<number, typeof variants>();
  for (const v of variants) {
    const arr = byProduct.get(v.productId) ?? [];
    arr.push(v);
    byProduct.set(v.productId, arr);
  }

  res.json(products.map((p) => formatProduct(p, byProduct.get(p.id) ?? [])));
});

// Update product images
router.put("/admin/products/:id/images", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { images } = req.body;
  if (!Array.isArray(images)) {
    res.status(400).json({ error: "images must be an array of strings" });
    return;
  }

  const validImages = images.filter((img): img is string => typeof img === "string" && img.trim() !== "");

  const [updated] = await db
    .update(productsTable)
    .set({ images: validImages })
    .where(eq(productsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const variants = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, id));

  res.json(formatProduct(updated, variants));
});

// Update product active status
router.put("/admin/products/:id/toggle", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set({ isActive: !product.isActive })
    .where(eq(productsTable.id, id))
    .returning();

  const variants = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, id));

  res.json(formatProduct(updated!, variants));
});

export default router;
