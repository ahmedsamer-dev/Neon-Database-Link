import {
  findActiveProducts,
  findProductById,
  findVariantsForProduct,
  findVariantsForProductIds,
  type ProductRow,
  type VariantRow,
} from "./products.repository";

/**
 * Lists all active products together with their variants.
 *
 * Variants are fetched in a single batched query (one round-trip for all
 * products) and grouped in memory to avoid an N+1 problem.
 */
export async function listActiveProductsWithVariants(): Promise<
  Array<{ product: ProductRow; variants: VariantRow[] }>
> {
  const products = await findActiveProducts();
  if (products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const variants = await findVariantsForProductIds(productIds);

  const byProduct = new Map<number, VariantRow[]>();
  for (const v of variants) {
    const arr = byProduct.get(v.productId) ?? [];
    arr.push(v);
    byProduct.set(v.productId, arr);
  }

  return products.map((p) => ({
    product: p,
    variants: byProduct.get(p.id) ?? [],
  }));
}

export type GetProductResult =
  | { kind: "ok"; product: ProductRow; variants: VariantRow[] }
  | { kind: "not_found" };

/**
 * Fetches a single product (active or not) along with its variants.
 *
 * Note: this endpoint intentionally does NOT filter by isActive — the
 * storefront uses it for direct links / order confirmation pages where the
 * product may have since been deactivated but still needs to display.
 */
export async function getProductWithVariants(
  rawId: string,
): Promise<GetProductResult> {
  const id = Number(rawId);
  if (Number.isNaN(id)) {
    return { kind: "not_found" };
  }

  const product = await findProductById(id);
  if (!product) {
    return { kind: "not_found" };
  }

  const variants = await findVariantsForProduct(id);
  return { kind: "ok", product, variants };
}
