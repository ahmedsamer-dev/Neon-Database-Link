import { Router, type IRouter } from "express";
import {
  db,
  ordersTable,
  orderItemsTable,
  variantsTable,
  notificationsTable,
} from "@workspace/db";
import { AdminLoginBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { eq, desc, sql } from "drizzle-orm";
import { checkCredentials, getToken, requireAdmin } from "../lib/admin";
import { formatOrder } from "../lib/format";

const router: IRouter = Router();

router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const { username, password } = parsed.data;
  if (!checkCredentials(username, password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  res.json({ token: getToken() });
});

router.get("/admin/orders", requireAdmin, async (_req, res) => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));

  if (orders.length === 0) {
    res.json([]);
    return;
  }
  const items = await db.select().from(orderItemsTable);
  const byOrder = new Map<number, typeof items>();
  for (const i of items) {
    const arr = byOrder.get(i.orderId) ?? [];
    arr.push(i);
    byOrder.set(i.orderId, arr);
  }
  res.json(orders.map((o) => formatOrder(o, byOrder.get(o.id) ?? [])));
});

async function findOrderByIdOrCode(idParam: string) {
  // Accept either numeric DB id or order code (ORD-0001)
  const numeric = Number(idParam);
  if (!Number.isNaN(numeric)) {
    const [o] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, numeric));
    if (o) return o;
  }
  const [o] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.code, idParam));
  return o ?? null;
}

router.get("/admin/orders/:id", requireAdmin, async (req, res) => {
  const order = await findOrderByIdOrCode(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));
  res.json(formatOrder(order, items));
});

router.post("/admin/orders/:id/confirm-payment", requireAdmin, async (req, res) => {
  const order = await findOrderByIdOrCode(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (order.paymentStatus === "Paid") {
    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id));
    res.json(formatOrder(order, items));
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  // Check stock
  for (const item of items) {
    const [variant] = await db
      .select()
      .from(variantsTable)
      .where(eq(variantsTable.id, item.variantId));
    if (!variant || variant.stock < item.quantity) {
      res.status(400).json({
        error: `Insufficient stock for ${item.productName} (${item.size}/${item.color})`,
      });
      return;
    }
  }

  // Reduce stock
  for (const item of items) {
    await db
      .update(variantsTable)
      .set({ stock: sql`${variantsTable.stock} - ${item.quantity}` })
      .where(eq(variantsTable.id, item.variantId));
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ paymentStatus: "Paid" })
    .where(eq(ordersTable.id, order.id))
    .returning();

  await db.insert(notificationsTable).values({
    type: "PaymentReceived",
    message: `Payment confirmed for ${order.code}`,
  });

  if (!updated) {
    res.status(500).json({ error: "Update failed" });
    return;
  }
  res.json(formatOrder(updated, items));
});

router.put("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const order = await findOrderByIdOrCode(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db
    .update(ordersTable)
    .set({ orderStatus: parsed.data.status })
    .where(eq(ordersTable.id, order.id))
    .returning();
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));
  if (!updated) {
    res.status(500).json({ error: "Update failed" });
    return;
  }
  res.json(formatOrder(updated, items));
});

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const orders = await db.select().from(ordersTable);
  const notifications = await db.select().from(notificationsTable);
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.paymentStatus === "Pending").length,
    paid: orders.filter((o) => o.paymentStatus === "Paid").length,
    shipped: orders.filter((o) => o.orderStatus === "Shipped").length,
    delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
    unreadNotifications: notifications.filter((n) => !n.isRead).length,
  };
  res.json(stats);
});

export default router;
