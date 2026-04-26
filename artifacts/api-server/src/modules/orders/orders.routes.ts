import { Router, type IRouter } from "express";
import { CreateOrderBody } from "@workspace/api-zod";
import { formatOrder, formatOrderTracking } from "../../lib/format";
import { createOrder, getOrderForTracking } from "./orders.service";

const router: IRouter = Router();

router.get("/orders/:id", async (req, res) => {
  const phoneParam =
    typeof req.query.phone === "string" ? req.query.phone : "";

  const result = await getOrderForTracking(req.params.id, phoneParam);

  // We deliberately collapse "invalid_phone" and "not_found" into the same
  // 404 response so callers can't probe order existence by varying the
  // phone parameter.
  if (result.kind !== "ok") {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(formatOrderTracking(result.order, result.items));
});

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Validation error", details: parsed.error.issues });
    return;
  }

  const result = await createOrder(parsed.data);

  switch (result.kind) {
    case "invalid_variant_id":
      res.status(400).json({ error: "Invalid variantId" });
      return;
    case "variant_not_found":
      res
        .status(400)
        .json({ error: `Variant ${result.variantId} not found` });
      return;
    case "product_not_found":
      res
        .status(400)
        .json({ error: `Product not found for variant ${result.variantId}` });
      return;
    case "ok":
      req.log.info({ orderId: result.order.id, code: result.code }, "Order created");
      res.status(201).json(formatOrder(result.order, result.items));
      return;
  }
});

export default router;
