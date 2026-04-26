import { Router, type IRouter } from "express";
import { AdminLoginBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { requireAdmin } from "../../lib/admin";
import { formatOrder } from "../../lib/format";
import {
  confirmPayment,
  getAdminOrder,
  getAdminStats,
  listAdminOrders,
  login,
  updateOrderStatus,
  updateShippingCost,
} from "./admin.service";

const router: IRouter = Router();

router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const result = login(parsed.data);
  if (result.kind === "invalid") {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  res.json({ token: result.token });
});

router.get("/admin/orders", requireAdmin, async (_req, res) => {
  const items = await listAdminOrders();
  res.setHeader("Cache-Control", "private, no-store");
  res.json(items.map(({ order, items: orderItems }) => formatOrder(order, orderItems)));
});

router.get("/admin/orders/:id", requireAdmin, async (req, res) => {
  const result = await getAdminOrder(String(req.params.id));
  if (result.kind === "not_found") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatOrder(result.order, result.items));
});

router.post("/admin/orders/:id/confirm-payment", requireAdmin, async (req, res) => {
  const result = await confirmPayment(String(req.params.id));
  switch (result.kind) {
    case "not_found":
      res.status(404).json({ error: "Not found" });
      return;
    case "insufficient_stock":
      res.status(400).json({
        error: `Insufficient stock for ${result.itemDescription}`,
      });
      return;
    case "update_failed":
      res.status(500).json({ error: "Update failed" });
      return;
    case "ok":
      res.json(formatOrder(result.order, result.items));
      return;
  }
});

router.put("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const result = await updateOrderStatus(String(req.params.id), parsed.data.status);
  switch (result.kind) {
    case "not_found":
      res.status(404).json({ error: "Not found" });
      return;
    case "update_failed":
      res.status(500).json({ error: "Update failed" });
      return;
    case "ok":
      res.json(formatOrder(result.order, result.items));
      return;
  }
});

router.patch("/admin/orders/:id/shipping", requireAdmin, async (req, res) => {
  const result = await updateShippingCost(String(req.params.id), req.body?.shippingCost);
  switch (result.kind) {
    case "invalid_cost":
      res.status(400).json({ error: "Invalid shippingCost" });
      return;
    case "not_found":
      res.status(404).json({ error: "Not found" });
      return;
    case "update_failed":
      res.status(500).json({ error: "Update failed" });
      return;
    case "ok":
      res.json(formatOrder(result.order, result.items));
      return;
  }
});

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const stats = await getAdminStats();
  res.setHeader("Cache-Control", "private, max-age=10");
  res.json(stats);
});

export default router;
