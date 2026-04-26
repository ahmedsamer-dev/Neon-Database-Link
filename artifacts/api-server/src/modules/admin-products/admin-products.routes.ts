import { Router, type IRouter } from "express";
import { requireAdmin } from "../../lib/admin";
import { formatProduct } from "../../lib/format";
import {
  createProduct,
  createVariant,
  deleteProduct,
  deleteVariant,
  listAllProductsWithVariants,
  serializeVariant,
  toggleProductActive,
  updateProduct,
  updateProductImages,
  updateVariant,
} from "./admin-products.service";

const router: IRouter = Router();

router.get("/admin/products", requireAdmin, async (_req, res) => {
  const items = await listAllProductsWithVariants();
  res.json(items.map(({ product, variants }) => formatProduct(product, variants)));
});

router.post("/admin/products", requireAdmin, async (req, res) => {
  const result = await createProduct(req.body ?? {});
  if (result.kind === "validation_error") {
    res.status(400).json({ error: result.message });
    return;
  }
  res.status(201).json(formatProduct(result.product, result.variants));
});

router.put("/admin/products/:id", requireAdmin, async (req, res) => {
  const result = await updateProduct(String(req.params.id), req.body ?? {});
  switch (result.kind) {
    case "invalid_id":
      res.status(404).json({ error: "Not found" });
      return;
    case "no_fields":
      res.status(400).json({ error: "No fields to update" });
      return;
    case "not_found":
      res.status(404).json({ error: "Product not found" });
      return;
    case "ok":
      res.json(formatProduct(result.product, result.variants));
      return;
  }
});

router.put("/admin/products/:id/images", requireAdmin, async (req, res) => {
  const result = await updateProductImages(
    String(req.params.id),
    req.body?.images,
  );
  switch (result.kind) {
    case "invalid_id":
      res.status(404).json({ error: "Not found" });
      return;
    case "invalid_images":
      res.status(400).json({ error: "images must be an array of strings" });
      return;
    case "not_found":
      res.status(404).json({ error: "Product not found" });
      return;
    case "ok":
      res.json(formatProduct(result.product, result.variants));
      return;
  }
});

router.put("/admin/products/:id/toggle", requireAdmin, async (req, res) => {
  const result = await toggleProductActive(String(req.params.id));
  switch (result.kind) {
    case "invalid_id":
      res.status(404).json({ error: "Not found" });
      return;
    case "not_found":
      res.status(404).json({ error: "Product not found" });
      return;
    case "ok":
      res.json(formatProduct(result.product, result.variants));
      return;
  }
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  const result = await deleteProduct(String(req.params.id));
  switch (result.kind) {
    case "invalid_id":
      res.status(404).json({ error: "Not found" });
      return;
    case "not_found":
      res.status(404).json({ error: "Product not found" });
      return;
    case "ok":
      res.json({ success: true });
      return;
  }
});

router.post("/admin/products/:id/variants", requireAdmin, async (req, res) => {
  const result = await createVariant(String(req.params.id), req.body ?? {});
  switch (result.kind) {
    case "invalid_id":
      res.status(404).json({ error: "Not found" });
      return;
    case "validation_error":
      res.status(400).json({ error: "size, color and price are required" });
      return;
    case "create_failed":
      res.status(500).json({ error: "Failed to create variant" });
      return;
    case "ok":
      res.status(201).json(serializeVariant(result.variant));
      return;
  }
});

router.put(
  "/admin/products/:id/variants/:variantId",
  requireAdmin,
  async (req, res) => {
    const result = await updateVariant(
      String(req.params.variantId),
      req.body ?? {},
    );
    switch (result.kind) {
      case "invalid_id":
        res.status(404).json({ error: "Not found" });
        return;
      case "not_found":
        res.status(404).json({ error: "Variant not found" });
        return;
      case "ok":
        res.json(serializeVariant(result.variant));
        return;
    }
  },
);

router.delete(
  "/admin/products/:id/variants/:variantId",
  requireAdmin,
  async (req, res) => {
    const result = await deleteVariant(String(req.params.variantId));
    switch (result.kind) {
      case "invalid_id":
        res.status(404).json({ error: "Not found" });
        return;
      case "not_found":
        res.status(404).json({ error: "Variant not found" });
        return;
      case "ok":
        res.json({ success: true });
        return;
    }
  },
);

export default router;
