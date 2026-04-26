import { db, productsTable, variantsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

export type ProductRow = typeof productsTable.$inferSelect;
export type VariantRow = typeof variantsTable.$inferSelect;

export async function findAllProducts(): Promise<ProductRow[]> {
  return db.select().from(productsTable).orderBy(asc(productsTable.id));
}

export async function findAllVariants(): Promise<VariantRow[]> {
  return db.select().from(variantsTable);
}

export async function findVariantsForProduct(
  productId: number,
): Promise<VariantRow[]> {
  return db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, productId));
}

export async function findProductById(
  id: number,
): Promise<ProductRow | undefined> {
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id));
  return product;
}

export type NewProductData = {
  name: string;
  description: string;
  basePrice: string;
  images: string[];
  isActive: boolean;
};

export async function insertProduct(
  data: NewProductData,
): Promise<ProductRow | undefined> {
  const [product] = await db.insert(productsTable).values(data).returning();
  return product;
}

export type NewVariantData = {
  productId: number;
  size: string;
  color: string;
  price: string;
  stock: number;
};

export async function insertVariants(rows: NewVariantData[]): Promise<void> {
  if (rows.length === 0) return;
  await db.insert(variantsTable).values(rows);
}

export async function insertVariant(
  data: NewVariantData,
): Promise<VariantRow | undefined> {
  const [variant] = await db.insert(variantsTable).values(data).returning();
  return variant;
}

export async function updateProductFields(
  id: number,
  updates: Record<string, unknown>,
): Promise<ProductRow | undefined> {
  const [updated] = await db
    .update(productsTable)
    .set(updates)
    .where(eq(productsTable.id, id))
    .returning();
  return updated;
}

export async function setProductImages(
  id: number,
  images: string[],
): Promise<ProductRow | undefined> {
  const [updated] = await db
    .update(productsTable)
    .set({ images })
    .where(eq(productsTable.id, id))
    .returning();
  return updated;
}

export async function setProductActive(
  id: number,
  isActive: boolean,
): Promise<ProductRow | undefined> {
  const [updated] = await db
    .update(productsTable)
    .set({ isActive })
    .where(eq(productsTable.id, id))
    .returning();
  return updated;
}

export async function deleteProductById(
  id: number,
): Promise<ProductRow | undefined> {
  const [deleted] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, id))
    .returning();
  return deleted;
}

export async function updateVariantFields(
  variantId: number,
  updates: Record<string, unknown>,
): Promise<VariantRow | undefined> {
  const [updated] = await db
    .update(variantsTable)
    .set(updates)
    .where(eq(variantsTable.id, variantId))
    .returning();
  return updated;
}

export async function deleteVariantById(
  variantId: number,
): Promise<VariantRow | undefined> {
  const [deleted] = await db
    .delete(variantsTable)
    .where(eq(variantsTable.id, variantId))
    .returning();
  return deleted;
}
