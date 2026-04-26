import { Router, type IRouter } from "express";
import { formatProduct } from "../../lib/format";
import {
  getProductWithVariants,
  listActiveProductsWithVariants,
} from "./products.service";

const PRODUCT_CACHE_HEADER = "public, max-age=30, stale-while-revalidate=60";

const router: IRouter = Router();

router.get("/products", async (_req, res) => {
  const items = await listActiveProductsWithVariants();
  res.setHeader("Cache-Control", PRODUCT_CACHE_HEADER);
  res.json(items.map(({ product, variants }) => formatProduct(product, variants)));
});

router.get("/products/:id", async (req, res) => {
  const result = await getProductWithVariants(req.params.id);
  if (result.kind === "not_found") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.setHeader("Cache-Control", PRODUCT_CACHE_HEADER);
  res.json(formatProduct(result.product, result.variants));
});

export default router;
