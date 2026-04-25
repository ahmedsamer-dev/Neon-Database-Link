import type {
  Product,
  Variant,
  Order,
  OrderItem,
  Notification,
} from "@workspace/db";

export function formatVariant(v: Variant) {
  return {
    id: String(v.id),
    productId: String(v.productId),
    size: v.size,
    color: v.color,
    price: Number(v.price),
    stock: v.stock,
  };
}

export function formatProduct(p: Product, variants: Variant[]) {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    basePrice: Number(p.basePrice),
    isActive: p.isActive,
    images: p.images,
    variants: variants.map(formatVariant),
  };
}

export function formatOrderItem(i: OrderItem) {
  return {
    id: String(i.id),
    orderId: String(i.orderId),
    productName: i.productName,
    size: i.size,
    color: i.color,
    quantity: i.quantity,
    price: Number(i.price),
  };
}

export function formatOrder(o: Order, items: OrderItem[]) {
  return {
    id: o.code,
    customerName: o.customerName,
    phone: o.phone,
    paymentPhone: o.paymentPhone,
    address: o.address,
    city: o.city,
    totalAmount: Number(o.totalAmount),
    shippingCost: o.shippingCost != null ? Number(o.shippingCost) : null,
    paymentStatus: o.paymentStatus as "Pending" | "Paid",
    orderStatus: o.orderStatus as "Pending" | "Shipped" | "Delivered" | "Cancelled",
    createdAt: o.createdAt.toISOString(),
    items: items.map(formatOrderItem),
  };
}

/**
 * Limited order shape returned to the customer-facing tracking endpoint
 * after they prove ownership (matching last 4 digits of their phone).
 * Excludes address, city, and full contact phone to avoid PII leakage.
 * Keeps customerName + paymentPhone since the requester proved phone
 * ownership and these are needed for the post-checkout WhatsApp message.
 */
export function formatOrderTracking(o: Order, items: OrderItem[]) {
  return {
    id: o.code,
    customerName: o.customerName,
    paymentPhone: o.paymentPhone,
    totalAmount: Number(o.totalAmount),
    paymentStatus: o.paymentStatus as "Pending" | "Paid",
    orderStatus: o.orderStatus as "Pending" | "Shipped" | "Delivered" | "Cancelled",
    createdAt: o.createdAt.toISOString(),
    items: items.map(formatOrderItem),
  };
}

export function formatNotification(n: Notification) {
  return {
    id: String(n.id),
    type: n.type as "NewOrder" | "PaymentReceived",
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  };
}
