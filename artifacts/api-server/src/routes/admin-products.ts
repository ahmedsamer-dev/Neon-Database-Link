import { Router, type IRouter } from "express";
import { db, productsTable, variantsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/admin";
import { formatProduct } from "../lib/format";

const router: IRouter = Router();

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

router.post("/admin/products", requireAdmin, async (req, res) => {
  const { name, description, basePrice, images, variants } = req.body;

  if (!name || basePrice == null) {
    res.status(400).json({ error: "name and basePrice are required" });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      name: String(name),
      description: String(description || ""),
      basePrice: String(Number(basePrice)),
      images: Array.isArray(images) ? images.filter((i: unknown) => typeof i === "string" && i.trim()) : [],
      isActive: true,
    })
    .returning();

  if (Array.isArray(variants) && variants.length > 0) {
    await db.insert(variantsTable).values(
      variants.map((v: { size: unknown; color: unknown; price?: unknown; stock?: unknown }) => ({
        productId: product!.id,
        size: String(v.size),
        color: String(v.color),
        price: String(Number(v.price ?? basePrice)),
        stock: Number(v.stock ?? 0),
      }))
    );
  }

  const savedVariants = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, product!.id));

  res.status(201).json(formatProduct(product!, savedVariants));
});

router.put("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { name, description, basePrice } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name);
  if (description !== undefined) updates.description = String(description);
  if (basePrice !== undefined) updates.basePrice = String(Number(basePrice));

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set(updates)
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

  const validImages = images.filter(
    (img): img is string => typeof img === "string" && img.trim() !== ""
  );

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

router.put("/admin/products/:id/toggle", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id));

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

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [deleted] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({ success: true });
});

router.post("/admin/products/:id/variants", requireAdmin, async (req, res) => {
  const productId = Number(req.params.id);
  if (Number.isNaN(productId)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { size, color, price, stock } = req.body;
  if (!size || !color || price == null) {
    res.status(400).json({ error: "size, color and price are required" });
    return;
  }

  const [variant] = await db
    .insert(variantsTable)
    .values({
      productId,
      size: String(size),
      color: String(color),
      price: String(Number(price)),
      stock: Number(stock ?? 0),
    })
    .returning();

  res.status(201).json({
    id: String(variant!.id),
    productId: String(variant!.productId),
    size: variant!.size,
    color: variant!.color,
    price: Number(variant!.price),
    stock: variant!.stock,
  });
});

router.put("/admin/products/:id/variants/:variantId", requireAdmin, async (req, res) => {
  const variantId = Number(req.params.variantId);
  if (Number.isNaN(variantId)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { size, color, price, stock } = req.body;
  const updates: Record<string, unknown> = {};
  if (size !== undefined) updates.size = String(size);
  if (color !== undefined) updates.color = String(color);
  if (price !== undefined) updates.price = String(Number(price));
  if (stock !== undefined) updates.stock = Number(stock);

  const [updated] = await db
    .update(variantsTable)
    .set(updates)
    .where(eq(variantsTable.id, variantId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }

  res.json({
    id: String(updated.id),
    productId: String(updated.productId),
    size: updated.size,
    color: updated.color,
    price: Number(updated.price),
    stock: updated.stock,
  });
});

router.delete("/admin/products/:id/variants/:variantId", requireAdmin, async (req, res) => {
  const variantId = Number(req.params.variantId);
  if (Number.isNaN(variantId)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [deleted] = await db
    .delete(variantsTable)
    .where(eq(variantsTable.id, variantId))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
