import { Router, type IRouter } from "express";
import {
  db,
  ordersTable,
  orderItemsTable,
  variantsTable,
  productsTable,
  notificationsTable,
  storeSettingsTable,
} from "@workspace/db";
import { CreateOrderBody } from "@workspace/api-zod";
import { eq, count } from "drizzle-orm";
import { formatOrder, formatOrderTracking } from "../lib/format";

const router: IRouter = Router();

/**
 * Public order lookup used by the post-checkout confirmation page and
 * the /track-order page. Requires `?phone=XXXX` (last 4 digits of the
 * customer's stored phone) as a lightweight ownership proof — without
 * it (or on mismatch) we return 404 to avoid leaking order existence
 * or PII (address, city, full phone) via guessable codes like ORD-0001.
 * The response is intentionally minimal (formatOrderTracking).
 */
router.get("/orders/:id", async (req, res) => {
  const idParam = req.params.id;
  const phoneParam =
    typeof req.query.phone === "string" ? req.query.phone.replace(/\D/g, "") : "";

  if (phoneParam.length < 4) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const numeric = Number(idParam);

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(isNaN(numeric) ? eq(ordersTable.code, idParam) : eq(ordersTable.id, numeric));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const storedDigits = (order.phone ?? "").replace(/\D/g, "");
  const last4 = storedDigits.slice(-4);
  const supplied = phoneParam.slice(-4);
  if (!last4 || last4 !== supplied) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  res.json(formatOrderTracking(order, items));
});

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", details: parsed.error.issues });
    return;
  }
  const input = parsed.data;

  // Resolve variants
  const variantIds = input.items.map((i) => Number(i.variantId));
  if (variantIds.some((v) => Number.isNaN(v))) {
    res.status(400).json({ error: "Invalid variantId" });
    return;
  }

  const variants = await db.select().from(variantsTable);
  const variantMap = new Map(variants.map((v) => [v.id, v]));
  const products = await db.select().from(productsTable);
  const productMap = new Map(products.map((p) => [p.id, p]));

  let total = 0;
  const itemsToInsert: Array<{
    variantId: number;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    price: string;
  }> = [];

  for (const item of input.items) {
    const v = variantMap.get(Number(item.variantId));
    if (!v) {
      res.status(400).json({ error: `Variant ${item.variantId} not found` });
      return;
    }
    const product = productMap.get(v.productId);
    if (!product) {
      res.status(400).json({ error: `Product not found for variant ${item.variantId}` });
      return;
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

  // Fetch shipping cost from store settings
  const [shippingRow] = await db
    .select()
    .from(storeSettingsTable)
    .where(eq(storeSettingsTable.key, "shipping_cost"));
  const shippingCost = Number(shippingRow?.value ?? 0);
  const grandTotal = total + shippingCost;

  // Generate order code
  const [{ value: orderCount }] = await db
    .select({ value: count() })
    .from(ordersTable);
  const code = `ORD-${String((orderCount ?? 0) + 1).padStart(4, "0")}`;

  const [order] = await db
    .insert(ordersTable)
    .values({
      code,
      customerName: input.customerName,
      phone: input.phone,
      paymentPhone: input.paymentPhone,
      address: input.address,
      city: input.city,
      totalAmount: grandTotal.toFixed(2),
      shippingCost: shippingCost > 0 ? shippingCost.toFixed(2) : null,
      paymentStatus: "Pending",
      orderStatus: "Pending",
    })
    .returning();

  if (!order) {
    res.status(500).json({ error: "Failed to create order" });
    return;
  }

  const insertedItems = await db
    .insert(orderItemsTable)
    .values(itemsToInsert.map((i) => ({ ...i, orderId: order.id })))
    .returning();

  await db.insert(notificationsTable).values({
    type: "NewOrder",
    message: `طلب جديد ${code} من ${input.customerName} — ${grandTotal.toFixed(2)} ج.م`,
  });

  req.log.info({ orderId: order.id, code }, "Order created");

  res.status(201).json(formatOrder(order, insertedItems));
});

export default router;
