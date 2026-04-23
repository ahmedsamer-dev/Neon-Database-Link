import { Router, type IRouter } from "express";
import {
  db,
  ordersTable,
  orderItemsTable,
  variantsTable,
  productsTable,
  notificationsTable,
} from "@workspace/db";
import { CreateOrderBody } from "@workspace/api-zod";
import { eq, count } from "drizzle-orm";
import { formatOrder } from "../lib/format";

const router: IRouter = Router();

router.get("/orders/:id", async (req, res) => {
  const idParam = req.params.id;
  const numeric = Number(idParam);

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(isNaN(numeric) ? eq(ordersTable.code, idParam) : eq(ordersTable.id, numeric));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  res.json(formatOrder(order, items));
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
      totalAmount: total.toFixed(2),
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
    message: `New order ${code} from ${input.customerName} — $${total.toFixed(2)}`,
  });

  req.log.info({ orderId: order.id, code }, "Order created");

  res.status(201).json(formatOrder(order, insertedItems));
});

export default router;
