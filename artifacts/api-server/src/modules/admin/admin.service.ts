import { checkCredentials, getToken } from "../../lib/admin";
import {
  decrementVariantStock,
  findAdminOrderByIdOrCode,
  findAllAdminOrders,
  findItemsForOrder,
  findItemsForOrders,
  findVariantsByIds,
  getOrderStats,
  getUnreadNotificationCount,
  insertPaymentReceivedNotification,
  setOrderPaymentPaid,
  setOrderShipping,
  setOrderStatus,
  type OrderItemRow,
  type OrderRow,
} from "./admin.repository";

export type LoginInput = { username: string; password: string };
export type LoginResult = { kind: "ok"; token: string } | { kind: "invalid" };

export function login(input: LoginInput): LoginResult {
  if (!checkCredentials(input.username, input.password)) {
    return { kind: "invalid" };
  }
  return { kind: "ok", token: getToken() };
}

/**
 * Lists every order in the system together with its items.
 *
 * Items are fetched in a single batched query and grouped in memory to
 * avoid an N+1 problem on the admin orders dashboard.
 */
export async function listAdminOrders(): Promise<
  Array<{ order: OrderRow; items: OrderItemRow[] }>
> {
  const orders = await findAllAdminOrders();
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const items = await findItemsForOrders(orderIds);

  const byOrder = new Map<number, OrderItemRow[]>();
  for (const i of items) {
    const arr = byOrder.get(i.orderId) ?? [];
    arr.push(i);
    byOrder.set(i.orderId, arr);
  }

  return orders.map((o) => ({ order: o, items: byOrder.get(o.id) ?? [] }));
}

export type AdminOrderResult =
  | { kind: "ok"; order: OrderRow; items: OrderItemRow[] }
  | { kind: "not_found" };

export async function getAdminOrder(
  idOrCode: string,
): Promise<AdminOrderResult> {
  const order = await findAdminOrderByIdOrCode(idOrCode);
  if (!order) return { kind: "not_found" };
  const items = await findItemsForOrder(order.id);
  return { kind: "ok", order, items };
}

export type ConfirmPaymentResult =
  | { kind: "ok"; order: OrderRow; items: OrderItemRow[] }
  | { kind: "not_found" }
  | { kind: "insufficient_stock"; itemDescription: string }
  | { kind: "update_failed" };

/**
 * Confirms payment on an order. This is the only place stock gets
 * decremented — orders are created with stock untouched and stock is only
 * reduced once the admin verifies that money has actually arrived.
 *
 * Idempotent: re-confirming an already-Paid order returns the current state
 * without touching stock again.
 *
 * Stock is checked for *all* items first; only if every item has enough
 * stock do we proceed to decrement. This prevents a partial confirmation
 * where some variants are decremented and others are rejected.
 */
export async function confirmPayment(
  idOrCode: string,
): Promise<ConfirmPaymentResult> {
  const order = await findAdminOrderByIdOrCode(idOrCode);
  if (!order) return { kind: "not_found" };

  const items = await findItemsForOrder(order.id);

  if (order.paymentStatus === "Paid") {
    return { kind: "ok", order, items };
  }

  const variantIds = items.map((i) => i.variantId);
  const variants = await findVariantsByIds(variantIds);
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      return {
        kind: "insufficient_stock",
        itemDescription: `${item.productName} (${item.size}/${item.color})`,
      };
    }
  }

  for (const item of items) {
    await decrementVariantStock(item.variantId, item.quantity);
  }

  const updated = await setOrderPaymentPaid(order.id);
  if (!updated) return { kind: "update_failed" };

  await insertPaymentReceivedNotification(order.code);

  return { kind: "ok", order: updated, items };
}

export type UpdateOrderStatusResult =
  | { kind: "ok"; order: OrderRow; items: OrderItemRow[] }
  | { kind: "not_found" }
  | { kind: "update_failed" };

export async function updateOrderStatus(
  idOrCode: string,
  status: string,
): Promise<UpdateOrderStatusResult> {
  const order = await findAdminOrderByIdOrCode(idOrCode);
  if (!order) return { kind: "not_found" };

  const updated = await setOrderStatus(order.id, status);
  const items = await findItemsForOrder(order.id);

  if (!updated) return { kind: "update_failed" };
  return { kind: "ok", order: updated, items };
}

export type UpdateShippingResult =
  | { kind: "ok"; order: OrderRow; items: OrderItemRow[] }
  | { kind: "not_found" }
  | { kind: "invalid_cost" }
  | { kind: "update_failed" };

/**
 * Sets the shipping cost on an order and recomputes the total accordingly.
 * The total is rebuilt from item prices (not from the stored total), so
 * repeated updates don't double-count shipping.
 */
export async function updateShippingCost(
  idOrCode: string,
  rawShippingCost: unknown,
): Promise<UpdateShippingResult> {
  const shippingCost = Number(rawShippingCost);
  if (isNaN(shippingCost) || shippingCost < 0) {
    return { kind: "invalid_cost" };
  }

  const order = await findAdminOrderByIdOrCode(idOrCode);
  if (!order) return { kind: "not_found" };

  const items = await findItemsForOrder(order.id);
  const itemsTotal = items.reduce(
    (s, i) => s + Number(i.price) * i.quantity,
    0,
  );
  const newTotal = (itemsTotal + shippingCost).toFixed(2);

  const updated = await setOrderShipping(order.id, shippingCost, newTotal);
  if (!updated) return { kind: "update_failed" };

  return { kind: "ok", order: updated, items };
}

export type AdminStats = {
  total: number;
  paid: number;
  pending: number;
  shipped: number;
  delivered: number;
  unreadNotifications: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const stats = await getOrderStats();
  const unread = await getUnreadNotificationCount();
  return { ...stats, unreadNotifications: unread };
}
