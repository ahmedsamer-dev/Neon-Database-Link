import {
  deleteProductById,
  deleteVariantById,
  findAllProducts,
  findAllVariants,
  findProductById,
  findVariantsForProduct,
  insertProduct,
  insertVariant,
  insertVariants,
  setProductActive,
  setProductImages,
  updateProductFields,
  updateVariantFields,
  type ProductRow,
  type VariantRow,
} from "./admin-products.repository";

/**
 * Lists every product (active and inactive) for the admin dashboard,
 * including its variants. Variants are fetched once and grouped to avoid
 * an N+1 problem.
 *
 * Note: this returns *all* variants in the database, then groups them.
 * This matches the previous behaviour exactly.
 */
export async function listAllProductsWithVariants(): Promise<
  Array<{ product: ProductRow; variants: VariantRow[] }>
> {
  const products = await findAllProducts();
  if (products.length === 0) return [];

  const variants = await findAllVariants();
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

export type CreateProductInput = {
  name?: unknown;
  description?: unknown;
  basePrice?: unknown;
  images?: unknown;
  variants?: unknown;
};

type RawVariantInput = {
  size?: unknown;
  color?: unknown;
  price?: unknown;
  stock?: unknown;
};

export type CreateProductResult =
  | { kind: "ok"; product: ProductRow; variants: VariantRow[] }
  | { kind: "validation_error"; message: string };

export async function createProduct(
  input: CreateProductInput,
): Promise<CreateProductResult> {
  if (!input.name || input.basePrice == null) {
    return {
      kind: "validation_error",
      message: "name and basePrice are required",
    };
  }

  const images = Array.isArray(input.images)
    ? input.images.filter(
        (i: unknown): i is string => typeof i === "string" && i.trim() !== "",
      )
    : [];

  const product = await insertProduct({
    name: String(input.name),
    description: String(input.description ?? ""),
    basePrice: String(Number(input.basePrice)),
    images,
    isActive: true,
  });

  if (!product) {
    return { kind: "validation_error", message: "Failed to create product" };
  }

  if (Array.isArray(input.variants) && input.variants.length > 0) {
    await insertVariants(
      input.variants.map((v: RawVariantInput) => ({
        productId: product.id,
        size: String(v.size),
        color: String(v.color),
        price: String(Number(v.price ?? input.basePrice)),
        stock: Number(v.stock ?? 0),
      })),
    );
  }

  const savedVariants = await findVariantsForProduct(product.id);
  return { kind: "ok", product, variants: savedVariants };
}

export type ProductUpdateInput = {
  name?: unknown;
  description?: unknown;
  basePrice?: unknown;
};

export type UpdateProductResult =
  | { kind: "ok"; product: ProductRow; variants: VariantRow[] }
  | { kind: "invalid_id" }
  | { kind: "no_fields" }
  | { kind: "not_found" };

export async function updateProduct(
  rawId: string,
  input: ProductUpdateInput,
): Promise<UpdateProductResult> {
  const id = Number(rawId);
  if (Number.isNaN(id)) return { kind: "invalid_id" };

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = String(input.name);
  if (input.description !== undefined) {
    updates.description = String(input.description);
  }
  if (input.basePrice !== undefined) {
    updates.basePrice = String(Number(input.basePrice));
  }

  if (Object.keys(updates).length === 0) return { kind: "no_fields" };

  const updated = await updateProductFields(id, updates);
  if (!updated) return { kind: "not_found" };

  const variants = await findVariantsForProduct(id);
  return { kind: "ok", product: updated, variants };
}

export type UpdateImagesResult =
  | { kind: "ok"; product: ProductRow; variants: VariantRow[] }
  | { kind: "invalid_id" }
  | { kind: "invalid_images" }
  | { kind: "not_found" };

export async function updateProductImages(
  rawId: string,
  rawImages: unknown,
): Promise<UpdateImagesResult> {
  const id = Number(rawId);
  if (Number.isNaN(id)) return { kind: "invalid_id" };

  if (!Array.isArray(rawImages)) return { kind: "invalid_images" };

  const validImages = rawImages.filter(
    (img): img is string => typeof img === "string" && img.trim() !== "",
  );

  const updated = await setProductImages(id, validImages);
  if (!updated) return { kind: "not_found" };

  const variants = await findVariantsForProduct(id);
  return { kind: "ok", product: updated, variants };
}

export type ToggleProductResult =
  | { kind: "ok"; product: ProductRow; variants: VariantRow[] }
  | { kind: "invalid_id" }
  | { kind: "not_found" };

export async function toggleProductActive(
  rawId: string,
): Promise<ToggleProductResult> {
  const id = Number(rawId);
  if (Number.isNaN(id)) return { kind: "invalid_id" };

  const product = await findProductById(id);
  if (!product) return { kind: "not_found" };

  const updated = await setProductActive(id, !product.isActive);
  // updated should always exist here because the row existed a moment ago,
  // but we still narrow the type for the caller.
  if (!updated) return { kind: "not_found" };

  const variants = await findVariantsForProduct(id);
  return { kind: "ok", product: updated, variants };
}

export type DeleteProductResult =
  | { kind: "ok" }
  | { kind: "invalid_id" }
  | { kind: "not_found" };

export async function deleteProduct(
  rawId: string,
): Promise<DeleteProductResult> {
  const id = Number(rawId);
  if (Number.isNaN(id)) return { kind: "invalid_id" };

  const deleted = await deleteProductById(id);
  if (!deleted) return { kind: "not_found" };
  return { kind: "ok" };
}

export type CreateVariantInput = {
  size?: unknown;
  color?: unknown;
  price?: unknown;
  stock?: unknown;
};

export type CreateVariantResult =
  | { kind: "ok"; variant: VariantRow }
  | { kind: "invalid_id" }
  | { kind: "validation_error" }
  | { kind: "create_failed" };

export async function createVariant(
  rawProductId: string,
  input: CreateVariantInput,
): Promise<CreateVariantResult> {
  const productId = Number(rawProductId);
  if (Number.isNaN(productId)) return { kind: "invalid_id" };

  if (!input.size || !input.color || input.price == null) {
    return { kind: "validation_error" };
  }

  const variant = await insertVariant({
    productId,
    size: String(input.size),
    color: String(input.color),
    price: String(Number(input.price)),
    stock: Number(input.stock ?? 0),
  });

  if (!variant) return { kind: "create_failed" };
  return { kind: "ok", variant };
}

export type VariantUpdateInput = {
  size?: unknown;
  color?: unknown;
  price?: unknown;
  stock?: unknown;
};

export type UpdateVariantResult =
  | { kind: "ok"; variant: VariantRow }
  | { kind: "invalid_id" }
  | { kind: "not_found" };

export async function updateVariant(
  rawVariantId: string,
  input: VariantUpdateInput,
): Promise<UpdateVariantResult> {
  const variantId = Number(rawVariantId);
  if (Number.isNaN(variantId)) return { kind: "invalid_id" };

  const updates: Record<string, unknown> = {};
  if (input.size !== undefined) updates.size = String(input.size);
  if (input.color !== undefined) updates.color = String(input.color);
  if (input.price !== undefined) updates.price = String(Number(input.price));
  if (input.stock !== undefined) updates.stock = Number(input.stock);

  const updated = await updateVariantFields(variantId, updates);
  if (!updated) return { kind: "not_found" };
  return { kind: "ok", variant: updated };
}

export type DeleteVariantResult =
  | { kind: "ok" }
  | { kind: "invalid_id" }
  | { kind: "not_found" };

export async function deleteVariant(
  rawVariantId: string,
): Promise<DeleteVariantResult> {
  const variantId = Number(rawVariantId);
  if (Number.isNaN(variantId)) return { kind: "invalid_id" };

  const deleted = await deleteVariantById(variantId);
  if (!deleted) return { kind: "not_found" };
  return { kind: "ok" };
}

export function serializeVariant(v: VariantRow) {
  return {
    id: String(v.id),
    productId: String(v.productId),
    size: v.size,
    color: v.color,
    price: Number(v.price),
    stock: v.stock,
  };
}
