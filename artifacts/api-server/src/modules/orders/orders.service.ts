import { CreateOrderBody } from "@workspace/api-zod";
import {
  createOrderTransaction,
  findAllProducts,
  findAllVariants,
  findOrderByIdOrCode,
  findOrderItems,
  getShippingCostSetting,
  type NewOrderItem,
  type OrderItemRow,
  type OrderRow,
} from "./orders.repository";

export type CreateOrderInput = ReturnType<typeof CreateOrderBody.parse>;

/**
 * Result of an attempt to look up an order for the public tracking flow.
 *
 * - "not_found":   no order matched, OR the supplied phone last-4 didn't match.
 *                  Caller should respond 404 in both cases to avoid leaking
 *                  whether an order with that id/code exists.
 * - "invalid_phone": the supplied phone parameter wasn't long enough to be
 *                    a meaningful ownership proof.
 * - "ok":          order matched and ownership was verified.
 */
export type OrderTrackingResult =
  | { kind: "ok"; order: OrderRow; items: OrderItemRow[] }
  | { kind: "not_found" }
  | { kind: "invalid_phone" };

/**
 * Public order lookup used by the post-checkout confirmation page and the
 * /track-order page. Requires the last 4 digits of the customer's stored
 * phone as a lightweight ownership proof — without a match we return a
 * "not_found" verdict to avoid leaking order existence or PII (address,
 * city, full phone) via guessable codes like ORD-0001.
 */
export async function getOrderForTracking(
  idOrCode: string,
  phoneParam: string,
): Promise<OrderTrackingResult> {
  const cleanedPhone = phoneParam.replace(/\D/g, "");
  if (cleanedPhone.length < 4) {
    return { kind: "invalid_phone" };
  }

  const order = await findOrderByIdOrCode(idOrCode);
  if (!order) {
    return { kind: "not_found" };
  }

  const storedDigits = (order.phone ?? "").replace(/\D/g, "");
  const last4 = storedDigits.slice(-4);
  const supplied = cleanedPhone.slice(-4);
  if (!last4 || last4 !== supplied) {
    return { kind: "not_found" };
  }

  const items = await findOrderItems(order.id);
  return { kind: "ok", order, items };
}

export type CreateOrderResult =
  | { kind: "ok"; order: OrderRow; items: OrderItemRow[]; code: string }
  | { kind: "invalid_variant_id" }
  | { kind: "variant_not_found"; variantId: string }
  | { kind: "product_not_found"; variantId: string };

/**
 * Creates a new pending order. Stock is intentionally NOT decremented here —
 * stock is only reduced when the admin confirms payment via the admin route.
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const variantIds = input.items.map((i) => Number(i.variantId));
  if (variantIds.some((v) => Number.isNaN(v))) {
    return { kind: "invalid_variant_id" };
  }

  const variants = await findAllVariants();
  const variantMap = new Map(variants.map((v) => [v.id, v]));
  const products = await findAllProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));

  let total = 0;
  const itemsToInsert: NewOrderItem[] = [];

  for (const item of input.items) {
    const v = variantMap.get(Number(item.variantId));
    if (!v) {
      return { kind: "variant_not_found", variantId: String(item.variantId) };
    }
    const product = productMap.get(v.productId);
    if (!product) {
      return { kind: "product_not_found", variantId: String(item.variantId) };
    }
    const price = Number(v.price);
    total += price * item.quantity;
    itemsToInsert.push({
      variantId: v.id,
      productName: product.name,
      size: v.size,
      color: v.color,
      quantity: item.quantity,
      price: v.price,
    });
  }

  const shippingCost = await getShippingCostSetting();
  const grandTotal = total + shippingCost;

  const { order, insertedItems, code } = await createOrderTransaction({
    data: {
      customerName: input.customerName,
      phone: input.phone,
      paymentPhone: input.paymentPhone,
      address: input.address,
      city: input.city,
      totalAmount: grandTotal.toFixed(2),
      shippingCost: shippingCost > 0 ? shippingCost.toFixed(2) : null,
      paymentStatus: "Pending",
      orderStatus: "Pending",
    },
    items: itemsToInsert,
    buildNotificationMessage: (finalCode) =>
      `طلب جديد ${finalCode} من ${input.customerName} — ${grandTotal.toFixed(2)} ج.م`,
  });

  return { kind: "ok", order, items: insertedItems, code };
}
