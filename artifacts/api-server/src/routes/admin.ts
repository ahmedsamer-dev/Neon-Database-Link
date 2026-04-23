import { Router, type IRouter } from "express";
import {
  db,
  ordersTable,
  orderItemsTable,
  variantsTable,
  notificationsTable,
} from "@workspace/db";
import { AdminLoginBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { eq, desc, sql, count, sum, inArray } from "drizzle-orm";
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
    res.setHeader("Cache-Control", "private, no-store");
    res.json([]);
    return;
  }

  const orderIds = orders.map((o) => o.id);
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));

  const byOrder = new Map<number, typeof items>();
  for (const i of items) {
    const arr = byOrder.get(i.orderId) ?? [];
    arr.push(i);
    byOrder.set(i.orderId, arr);
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.json(orders.map((o) => formatOrder(o, byOrder.get(o.id) ?? [])));
});

async function findOrderByIdOrCode(idParam: string) {
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

  const variantIds = items.map((i) => i.variantId);
  const variants = await db
    .select()
    .from(variantsTable)
    .where(inArray(variantsTable.id, variantIds));
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      res.status(400).json({
        error: `Insufficient stock for ${item.productName} (${item.size}/${item.color})`,
      });
      return;
    }
  }

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
  const [statsRow] = await db
    .select({
      total: count(),
      paid: sql<number>`count(*) filter (where ${ordersTable.paymentStatus} = 'Paid')`,
      pending: sql<number>`count(*) filter (where ${ordersTable.paymentStatus} = 'Pending')`,
      shipped: sql<number>`count(*) filter (where ${ordersTable.orderStatus} = 'Shipped')`,
      delivered: sql<number>`count(*) filter (where ${ordersTable.orderStatus} = 'Delivered')`,
    })
    .from(ordersTable);

  const [notifRow] = await db
    .select({ unread: count() })
    .from(notificationsTable)
    .where(eq(notificationsTable.isRead, false));

  res.setHeader("Cache-Control", "private, max-age=10");
  res.json({
    total: Number(statsRow?.total ?? 0),
    paid: Number(statsRow?.paid ?? 0),
    pending: Number(statsRow?.pending ?? 0),
    shipped: Number(statsRow?.shipped ?? 0),
    delivered: Number(statsRow?.delivered ?? 0),
    unreadNotifications: Number(notifRow?.unread ?? 0),
  });
});

export default router;
