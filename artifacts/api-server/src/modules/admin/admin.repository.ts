import {
  db,
  ordersTable,
  orderItemsTable,
  variantsTable,
  notificationsTable,
} from "@workspace/db";
import { eq, desc, sql, count, inArray } from "drizzle-orm";

export type OrderRow = typeof ordersTable.$inferSelect;
export type OrderItemRow = typeof orderItemsTable.$inferSelect;
export type VariantRow = typeof variantsTable.$inferSelect;

/**
 * Looks up an order by either its numeric primary key or its public code
 * (e.g. "ORD-0011"). The admin UI accepts both interchangeably.
 */
export async function findAdminOrderByIdOrCode(
  idParam: string,
): Promise<OrderRow | null> {
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

export async function findAllAdminOrders(): Promise<OrderRow[]> {
  return db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
}

export async function findItemsForOrders(
  orderIds: number[],
): Promise<OrderItemRow[]> {
  if (orderIds.length === 0) return [];
  return db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));
}

export async function findItemsForOrder(
  orderId: number,
): Promise<OrderItemRow[]> {
  return db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));
}

export async function findVariantsByIds(
  variantIds: number[],
): Promise<VariantRow[]> {
  if (variantIds.length === 0) return [];
  return db
    .select()
    .from(variantsTable)
    .where(inArray(variantsTable.id, variantIds));
}

/**
 * Decrements stock for a variant. Uses an inline SQL expression so the new
 * value is computed by the database (avoids a stale-read race).
 */
export async function decrementVariantStock(
  variantId: number,
  quantity: number,
): Promise<void> {
  await db
    .update(variantsTable)
    .set({ stock: sql`${variantsTable.stock} - ${quantity}` })
    .where(eq(variantsTable.id, variantId));
}

export async function setOrderPaymentPaid(
  orderId: number,
): Promise<OrderRow | undefined> {
  const [updated] = await db
    .update(ordersTable)
    .set({ paymentStatus: "Paid" })
    .where(eq(ordersTable.id, orderId))
    .returning();
  return updated;
}

export async function setOrderStatus(
  orderId: number,
  status: string,
): Promise<OrderRow | undefined> {
  const [updated] = await db
    .update(ordersTable)
    .set({ orderStatus: status })
    .where(eq(ordersTable.id, orderId))
    .returning();
  return updated;
}

export async function setOrderShipping(
  orderId: number,
  shippingCost: number,
  newTotal: string,
): Promise<OrderRow | undefined> {
  const [updated] = await db
    .update(ordersTable)
    .set({
      shippingCost: shippingCost.toFixed(2),
      totalAmount: newTotal,
    })
    .where(eq(ordersTable.id, orderId))
    .returning();
  return updated;
}

export async function insertPaymentReceivedNotification(
  orderCode: string,
): Promise<void> {
  await db.insert(notificationsTable).values({
    type: "PaymentReceived",
    message: `Payment confirmed for ${orderCode}`,
  });
}

export type OrderStatsRow = {
  total: number;
  paid: number;
  pending: number;
  shipped: number;
  delivered: number;
};

export async function getOrderStats(): Promise<OrderStatsRow> {
  const [statsRow] = await db
    .select({
      total: count(),
      paid: sql<number>`count(*) filter (where ${ordersTable.paymentStatus} = 'Paid')`,
      pending: sql<number>`count(*) filter (where ${ordersTable.paymentStatus} = 'Pending')`,
      shipped: sql<number>`count(*) filter (where ${ordersTable.orderStatus} = 'Shipped')`,
      delivered: sql<number>`count(*) filter (where ${ordersTable.orderStatus} = 'Delivered')`,
    })
    .from(ordersTable);

  return {
    total: Number(statsRow?.total ?? 0),
    paid: Number(statsRow?.paid ?? 0),
    pending: Number(statsRow?.pending ?? 0),
    shipped: Number(statsRow?.shipped ?? 0),
    delivered: Number(statsRow?.delivered ?? 0),
  };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const [row] = await db
    .select({ unread: count() })
    .from(notificationsTable)
    .where(eq(notificationsTable.isRead, false));
  return Number(row?.unread ?? 0);
}
