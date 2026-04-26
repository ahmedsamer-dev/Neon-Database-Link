import {
  db,
  ordersTable,
  orderItemsTable,
  variantsTable,
  productsTable,
  notificationsTable,
  storeSettingsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

export type OrderRow = typeof ordersTable.$inferSelect;
export type OrderItemRow = typeof orderItemsTable.$inferSelect;
export type VariantRow = typeof variantsTable.$inferSelect;
export type ProductRow = typeof productsTable.$inferSelect;

export type NewOrderItem = {
  variantId: number;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: string;
};

export type CreateOrderData = {
  code: string;
  customerName: string;
  phone: string;
  paymentPhone: string;
  address: string;
  city: string;
  totalAmount: string;
  shippingCost: string | null;
  paymentStatus: "Pending";
  orderStatus: "Pending";
};

export async function findOrderByIdOrCode(
  idOrCode: string,
): Promise<OrderRow | undefined> {
  const numeric = Number(idOrCode);
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(
      isNaN(numeric)
        ? eq(ordersTable.code, idOrCode)
        : eq(ordersTable.id, numeric),
    );
  return order;
}

export async function findOrderItems(orderId: number): Promise<OrderItemRow[]> {
  return db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));
}

export async function findAllVariants(): Promise<VariantRow[]> {
  return db.select().from(variantsTable);
}

export async function findAllProducts(): Promise<ProductRow[]> {
  return db.select().from(productsTable);
}

export async function getShippingCostSetting(): Promise<number> {
  try {
    const [shippingRow] = await db
      .select()
      .from(storeSettingsTable)
      .where(eq(storeSettingsTable.key, "shipping_cost"));
    return Number(shippingRow?.value ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Creates an order, its items, and a NewOrder notification atomically.
 *
 * The order code is derived from the row's auto-generated id (not from
 * count(*)), so deletions of older/cancelled orders can never produce a
 * duplicate code.
 */
export async function createOrderTransaction(params: {
  data: Omit<CreateOrderData, "code">;
  items: NewOrderItem[];
  buildNotificationMessage: (code: string) => string;
}): Promise<{ order: OrderRow; insertedItems: OrderItemRow[]; code: string }> {
  return db.transaction(async (tx) => {
    const placeholderCode = `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const [inserted] = await tx
      .insert(ordersTable)
      .values({ ...params.data, code: placeholderCode })
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
      .values(params.items.map((i) => ({ ...i, orderId: updated.id })))
      .returning();

    await tx.insert(notificationsTable).values({
      type: "NewOrder",
      message: params.buildNotificationMessage(finalCode),
    });

    return { order: updated, insertedItems: items, code: finalCode };
  });
}
