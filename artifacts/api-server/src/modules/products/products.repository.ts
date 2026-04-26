import { db, productsTable, variantsTable } from "@workspace/db";
import { eq, asc, inArray } from "drizzle-orm";

export type ProductRow = typeof productsTable.$inferSelect;
export type VariantRow = typeof variantsTable.$inferSelect;

export async function findActiveProducts(): Promise<ProductRow[]> {
  return db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isActive, true))
    .orderBy(asc(productsTable.id));
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

export async function findVariantsForProductIds(
  productIds: number[],
): Promise<VariantRow[]> {
  if (productIds.length === 0) return [];
  return db
    .select()
    .from(variantsTable)
    .where(inArray(variantsTable.productId, productIds));
}

export async function findVariantsForProduct(
  productId: number,
): Promise<VariantRow[]> {
  return db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, productId));
}
