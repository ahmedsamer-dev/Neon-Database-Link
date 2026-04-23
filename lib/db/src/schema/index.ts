import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    images: text("images").array().notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("products_is_active_idx").on(table.isActive),
    index("products_created_at_idx").on(table.createdAt),
  ],
);

export const variantsTable = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    color: text("color").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").notNull().default(0),
  },
  (table) => [
    index("variants_product_id_idx").on(table.productId),
  ],
);

export const ordersTable = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    paymentPhone: text("payment_phone").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: text("payment_status").notNull().default("Pending"),
    orderStatus: text("order_status").notNull().default("Pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("orders_payment_status_idx").on(table.paymentStatus),
    index("orders_order_status_idx").on(table.orderStatus),
    index("orders_created_at_idx").on(table.createdAt),
  ],
);

export const orderItemsTable = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    variantId: integer("variant_id").notNull(),
    productName: text("product_name").notNull(),
    size: text("size").notNull(),
    color: text("color").notNull(),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
  ],
);

export const notificationsTable = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notifications_is_read_idx").on(table.isRead),
    index("notifications_created_at_idx").on(table.createdAt),
  ],
);

export const storeSettingsTable = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Product = typeof productsTable.$inferSelect;
export type Variant = typeof variantsTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
export type StoreSetting = typeof storeSettingsTable.$inferSelect;
