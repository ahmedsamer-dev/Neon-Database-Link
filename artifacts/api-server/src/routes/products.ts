import { Router, type IRouter } from "express";
import { db, productsTable, variantsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { formatProduct } from "../lib/format";

const router: IRouter = Router();

router.get("/products", async (_req, res) => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isActive, true))
    .orderBy(asc(productsTable.id));

  if (products.length === 0) {
    res.json([]);
    return;
  }

  const productIds = products.map((p) => p.id);
  const variants = await db.select().from(variantsTable);
  const byProduct = new Map<number, typeof variants>();
  for (const v of variants) {
    if (!productIds.includes(v.productId)) continue;
    const arr = byProduct.get(v.productId) ?? [];
    arr.push(v);
    byProduct.set(v.productId, arr);
  }

  res.json(products.map((p) => formatProduct(p, byProduct.get(p.id) ?? [])));
});

router.get("/products/:id", async (req, res) => {
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
    res.status(404).json({ error: "Not found" });
    return;
  }
  const variants = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, id));
  res.json(formatProduct(product, variants));
});

export default router;
