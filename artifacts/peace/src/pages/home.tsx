import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { WishlistButton } from "@/components/wishlist-button";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { useMemo } from "react";

export default function Home() {
  const { data: products, isLoading } = useListProducts();
  const recentlyViewedIds = useMemo(() => getRecentlyViewed(), []);
  const recentlyViewed = useMemo(
    () =>
      recentlyViewedIds
        .map((id) => products?.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p && p.isActive)
        .slice(0, 4),
    [products, recentlyViewedIds],
  );

  return (
    <div className="flex flex-col w-full" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[560px] w-full flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero.jpg"
            alt="Peace fashion"
            className="w-full h-full object-cover opacity-70 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-background/30" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs md:text-sm uppercase tracking-[0.3em] text-foreground/70 mb-6 font-medium"
          >
            New Collection · 2026
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-foreground mb-6 leading-[1.05]"
          >
            Wear the calm.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-foreground/80 font-medium max-w-xl"
          >
            أزياء مقصودة للحياة الهادئة. صُممت لتعيش اللحظة.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-10"
          >
            <a
              href="#products"
              className="inline-flex items-center gap-3 px-8 py-3 bg-foreground text-background text-sm font-medium tracking-wide hover-elevate active-elevate-2 rounded-sm"
            >
              تصفح المجموعة
              <span aria-hidden>←</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="products" className="py-24 container mx-auto px-4 md:px-8 scroll-mt-20">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <span className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              Collection
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              أحدث المنتجات
            </h2>
          </div>
          <div className="hidden md:block h-px flex-1 bg-border ml-8" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-md" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products?.filter((p) => p.isActive).length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p>لا توجد منتجات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products
              ?.filter((p) => p.isActive)
              .map((product, index) => {
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                const isOutOfStock = totalStock === 0;

                const isLowStock = !isOutOfStock && totalStock > 0 && totalStock <= 5;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="group flex flex-col card-premium relative"
                  >
                    <WishlistButton productId={product.id} productName={product.name} />
                    <Link
                      href={`/products/${product.id}`}
                      className="block aspect-[3/4] relative overflow-hidden bg-muted rounded-sm mb-4"
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover image-premium"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground font-serif text-2xl">
                          Peace.
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {isLowStock && (
                        <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide uppercase shadow">
                          آخر {totalStock} قطع
                        </span>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="bg-white text-black text-xs font-semibold px-4 py-2 rounded-full tracking-wide uppercase">
                            نفذت الكمية
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex justify-between items-start gap-3 px-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base tracking-tight">
                          <Link
                            href={`/products/${product.id}`}
                            className="link-premium inline-block"
                          >
                            {product.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                      <span className="font-medium tracking-tight whitespace-nowrap">
                        {product.basePrice.toFixed(2)} ج.م
                      </span>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </section>

      {recentlyViewed.length > 0 && (
        <section className="pb-24 container mx-auto px-4 md:px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <span className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
                Recently Viewed
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
                شاهدت مؤخراً
              </h2>
            </div>
            <div className="hidden md:block h-px flex-1 bg-border ml-8" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentlyViewed.map((product) => (
              <div key={product.id} className="group flex flex-col">
                <Link
                  href={`/products/${product.id}`}
                  className="block aspect-[3/4] relative overflow-hidden bg-muted rounded-sm mb-3"
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
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
                    href={`/products/${product.id}`}
                    className="font-medium link-premium inline-block truncate"
                  >
                    {product.name}
                  </Link>
                  <span className="font-medium whitespace-nowrap">
                    {product.basePrice.toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
