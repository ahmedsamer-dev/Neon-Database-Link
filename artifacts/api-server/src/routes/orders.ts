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
import { eq } from "drizzle-orm";
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

  // Fetch shipping cost from store settings (fail-safe)
  let shippingCost = 0;
  try {
    const [shippingRow] = await db
      .select()
      .from(storeSettingsTable)
      .where(eq(storeSettingsTable.key, "shipping_cost"));
    shippingCost = Number(shippingRow?.value ?? 0);
  } catch {
    shippingCost = 0;
  }
  const grandTotal = total + shippingCost;

  // Create order + items + notification atomically. The order code is derived
  // from the row's auto-generated id (not from count(*)), so deletions of
  // older/cancelled orders can never produce a duplicate code.
  const { order, insertedItems, code } = await db.transaction(async (tx) => {
    const placeholderCode = `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const [inserted] = await tx
      .insert(ordersTable)
      .values({
        code: placeholderCode,
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

    if (!inserted) {
      throw new Error("Failed to create order");
    }

    const finalCode = `ORD-${String(inserted.id).padStart(4, "0")}`;

    const [updated] = await tx
      .update(ordersTable)
      .set({ code: finalCode })
      .where(eq(ordersTable.id, inserted.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to finalize order code");
    }

    const items = await tx
      .insert(orderItemsTable)
      .values(itemsToInsert.map((i) => ({ ...i, orderId: updated.id })))
      .returning();

    await tx.insert(notificationsTable).values({
      type: "NewOrder",
      message: `طلب جديد ${finalCode} من ${input.customerName} — ${grandTotal.toFixed(2)} ج.م`,
    });

    return { order: updated, insertedItems: items, code: finalCode };
  });

  req.log.info({ orderId: order.id, code }, "Order created");

  res.status(201).json(formatOrder(order, insertedItems));
});

export default router;
