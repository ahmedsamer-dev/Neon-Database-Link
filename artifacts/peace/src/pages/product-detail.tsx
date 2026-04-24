import { useState, useMemo, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetProduct, useListProducts } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { WishlistButton } from "@/components/wishlist-button";
import { SizeGuide } from "@/components/size-guide";
import { trackView } from "@/lib/recently-viewed";
import { useStoreSettings, buildWhatsAppUrl } from "@/lib/store-settings";

function isValidColor(str: string): boolean {
  const s = new Option().style;
  s.color = str;
  return s.color !== "";
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useGetProduct(id, { query: { enabled: !!id } });
  const { data: allProducts } = useListProducts();
  const { data: settings } = useStoreSettings();
  const { addItem, items } = useCart();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (product?.id) trackView(product.id);
  }, [product?.id]);

  const totalProductStock = useMemo(
    () => product?.variants.reduce((sum, v) => sum + v.stock, 0) ?? 0,
    [product],
  );
  const isLowStockProduct =
    product && totalProductStock > 0 && totalProductStock <= 5;

  const relatedProducts = useMemo(
    () =>
      (allProducts || [])
        .filter((p) => p.isActive && p.id !== product?.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4),
    [allProducts, product?.id],
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.color)));
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants || !selectedColor) return [];
    return product.variants.filter((v) => v.color === selectedColor).map((v) => v.size);
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedColor || !selectedSize) return null;
    return product.variants.find((v) => v.color === selectedColor && v.size === selectedSize);
  }, [product, selectedColor, selectedSize]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      quantity,
      productName: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: selectedVariant.price,
      image: product.images?.[0] || "",
      stock: selectedVariant.stock,
    });
    setConfirmOpen(true);
  };

  const handleAddMore = () => {
    setConfirmOpen(false);
    setQuantity(1);
  };

  const handleGoToCheckout = () => {
    setConfirmOpen(false);
    navigate("/checkout");
  };

  const priceToDisplay = selectedVariant?.price || product?.basePrice;
  const isOutOfStock = selectedVariant && selectedVariant.stock <= 0;
  const cartItem = selectedVariant ? items.find((i) => i.variantId === selectedVariant.id) : null;
  const alreadyInCart = cartItem?.quantity ?? 0;
  const maxCanAdd = selectedVariant ? Math.max(0, selectedVariant.stock - alreadyInCart) : 0;
  const canAddToCart = selectedVariant && !isOutOfStock && maxCanAdd > 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12" dir="rtl">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 flex gap-4">
            <div className="flex flex-col gap-4 w-20">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="aspect-square w-full" />
            </div>
            <Skeleton className="aspect-[3/4] flex-1" />
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center" dir="rtl">
        <h2 className="text-2xl font-serif mb-4">المنتج غير موجود</h2>
        <Button asChild variant="outline">
          <Link href="/">العودة للمتجر</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12" dir="rtl">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للمتجر
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        {/* Images */}
        <div className="w-full md:w-1/2 lg:w-[55%] flex gap-4">
          <div className="hidden sm:flex flex-col gap-4 w-20 flex-shrink-0">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImageIndex(i)}
                className={`aspect-[3/4] w-full bg-muted overflow-hidden border transition-all duration-200 ${
                  mainImageIndex === i ? "border-foreground" : "border-transparent hover:border-border"
                }`}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="aspect-[3/4] flex-1 bg-muted relative overflow-hidden">
            {product.images?.[mainImageIndex] ? (
              <img
                src={product.images[mainImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                لا توجد صورة
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
                {product.name}
              </h1>
              <div className="flex-shrink-0">
                <WishlistButton
                  productId={product.id}
                  productName={product.name}
                  variant="inline"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-xl text-muted-foreground">
                {priceToDisplay?.toFixed(2)} ج.م
              </p>
              {isLowStockProduct && (
                <span className="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                  آخر {totalProductStock} قطع متاحة
                </span>
              )}
            </div>

            <div className="prose prose-sm text-muted-foreground mb-8">
              <p>{product.description}</p>
            </div>

            {/* Selectors */}
            <div className="space-y-6 mb-8">
              {/* Color */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">اللون</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedColor || "اختر لوناً"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => {
                    const valid = isValidColor(color);
                    return valid ? (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        title={color}
                        className={`w-9 h-9 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          selectedColor === color
                            ? "border-foreground ring-2 ring-foreground ring-offset-2"
                            : "border-transparent hover:border-border"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ) : (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`px-4 py-2 text-sm border rounded-sm transition-all duration-200 hover:scale-[1.02] ${
                          selectedColor === color
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground/50"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size */}
              {selectedColor && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">المقاس</span>
                      <SizeGuide />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedSize || "اختر مقاساً"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.variants
                      .filter((v) => v.color === selectedColor)
                      .map((variant) => (
                        <button
                          key={variant.size}
                          onClick={() => setSelectedSize(variant.size)}
                          disabled={variant.stock <= 0}
                          className={`h-12 min-w-12 px-4 border rounded-sm flex items-center justify-center transition-all duration-200 text-sm
                            ${
                              selectedSize === variant.size
                                ? "border-foreground bg-foreground text-background"
                                : variant.stock <= 0
                                ? "opacity-30 cursor-not-allowed bg-muted"
                                : "border-border hover:border-foreground/50 hover:scale-[1.02]"
                            }`}
                        >
                          {variant.size}
                        </button>
                      ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Out of Stock Banner */}
            {isOutOfStock && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-center">
                <p className="text-rose-600 font-semibold text-sm">نفذت الكمية</p>
                <p className="text-rose-400 text-xs mt-0.5">هذا المنتج غير متاح حالياً</p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-sm h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!canAddToCart}
                    className="w-12 h-full flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxCanAdd, quantity + 1))}
                    disabled={!canAddToCart || quantity >= maxCanAdd}
                    className="w-12 h-full flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="flex-1 h-12 rounded-sm text-base transition-all duration-200 hover:scale-[1.01]"
                >
                  <ShoppingBag className="ml-2 h-4 w-4" />
                  {isOutOfStock
                    ? "نفذت الكمية"
                    : !selectedVariant
                    ? "اختر الخيارات"
                    : alreadyInCart > 0 && maxCanAdd === 0
                    ? "في السلة (الحد الأقصى)"
                    : "أضف إلى السلة"}
                </Button>
              </div>

              {selectedVariant && (
                <p className="text-xs text-muted-foreground text-center">
                  {maxCanAdd > 0
                    ? `${maxCanAdd} قطعة متاحة للإضافة`
                    : alreadyInCart > 0
                    ? "لديك الحد الأقصى المتاح في السلة"
                    : "نفذت الكمية"}
                </p>
              )}

              {settings?.whatsappPhone && (
                <a
                  href={buildWhatsAppUrl(
                    settings.whatsappPhone,
                    `مرحباً ${settings.storeName}، أريد الاستفسار عن "${product.name}"${
                      selectedColor ? ` — اللون: ${selectedColor}` : ""
                    }${selectedSize ? ` — المقاس: ${selectedSize}` : ""}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-sm text-sm font-medium transition-colors duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                  </svg>
                  استفسر عبر واتساب
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-16 border-t border-border">
          <div className="mb-10">
            <span className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              You may also like
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
              قد يعجبك أيضاً
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => (
              <div key={rp.id} className="group flex flex-col card-premium">
                <Link
                  href={`/products/${rp.id}`}
                  className="block aspect-[3/4] relative overflow-hidden bg-muted rounded-sm mb-3"
                >
                  {rp.images?.[0] ? (
                    <img
                      src={rp.images[0]}
                      alt={rp.name}
                      className="w-full h-full object-cover image-premium"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground font-serif">
                      Peace.
                    </div>
                  )}
                </Link>
                <div className="flex justify-between items-start gap-2 px-1 text-sm">
                  <Link
                    href={`/products/${rp.id}`}
                    className="font-medium link-premium inline-block truncate"
                  >
                    {rp.name}
                  </Link>
                  <span className="font-medium whitespace-nowrap">
                    {rp.basePrice.toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تم إضافة المنتج إلى السلة</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد إضافة المزيد من المنتجات؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAddMore}>
              نعم، إضافة المزيد
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToCheckout}>
              لا، إتمام الطلب
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
