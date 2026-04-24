import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { WishlistButton } from "@/components/wishlist-button";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { useMemo, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

type SortOption = "newest" | "price-asc" | "price-desc" | "name";

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

  const [search, setSearch] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeProducts = useMemo(
    () => products?.filter((p) => p.isActive) ?? [],
    [products],
  );

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    activeProducts.forEach((p) =>
      p.variants.forEach((v) => v.color && set.add(v.color)),
    );
    return Array.from(set).sort();
  }, [activeProducts]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    activeProducts.forEach((p) =>
      p.variants.forEach((v) => v.size && set.add(v.size)),
    );
    return Array.from(set).sort(
      (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
    );
  }, [activeProducts]);

  const priceBounds = useMemo(() => {
    if (activeProducts.length === 0) return { min: 0, max: 0 };
    const prices = activeProducts.map((p) => p.basePrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const minP = minPrice ? Number(minPrice) : null;
    const maxP = maxPrice ? Number(maxPrice) : null;

    const list = activeProducts.filter((p) => {
      if (q) {
        const haystack = `${p.name} ${p.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedColors.length > 0) {
        const has = p.variants.some((v) => selectedColors.includes(v.color));
        if (!has) return false;
      }
      if (selectedSizes.length > 0) {
        const has = p.variants.some((v) => selectedSizes.includes(v.size));
        if (!has) return false;
      }
      if (minP !== null && !Number.isNaN(minP) && p.basePrice < minP) return false;
      if (maxP !== null && !Number.isNaN(maxP) && p.basePrice > maxP) return false;
      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        break;
      default:
        break;
    }
    return sorted;
  }, [activeProducts, search, selectedColors, selectedSizes, minPrice, maxPrice, sortBy]);

  const hasActiveFilters =
    !!search ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    !!minPrice ||
    !!maxPrice ||
    sortBy !== "newest";

  const toggleColor = (c: string) =>
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  const toggleSize = (s: string) =>
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  const resetFilters = () => {
    setSearch("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  const isValidColor = (c: string) => /^#|^rgb|^[a-zA-Z]+$/.test(c);

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
        <div className="mb-10 flex items-end justify-between gap-6">
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

        {/* Search + Sort Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pr-10"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="h-11 md:w-[180px]">
              <SelectValue placeholder="الترتيب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="price-asc">السعر: الأقل أولاً</SelectItem>
              <SelectItem value="price-desc">السعر: الأعلى أولاً</SelectItem>
              <SelectItem value="name">الاسم: أ - ي</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFiltersOpen((o) => !o)}
            className="h-11 gap-2 md:w-auto"
          >
            <SlidersHorizontal className="h-4 w-4" />
            فلترة
            {(selectedColors.length + selectedSizes.length > 0 ||
              minPrice ||
              maxPrice) && (
              <span className="bg-foreground text-background text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {selectedColors.length +
                  selectedSizes.length +
                  (minPrice ? 1 : 0) +
                  (maxPrice ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-8 p-5 md:p-6 border border-border rounded-md bg-card space-y-6"
          >
            {availableColors.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  الألوان
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((c) => {
                    const selected = selectedColors.includes(c);
                    const swatch = isValidColor(c) ? c : undefined;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleColor(c)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          selected
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background text-foreground border-border hover-elevate active-elevate-2"
                        }`}
                      >
                        {swatch && (
                          <span
                            aria-hidden
                            className="inline-block w-3 h-3 rounded-full border border-border/40"
                            style={{ backgroundColor: swatch }}
                          />
                        )}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  المقاسات
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((s) => {
                    const selected = selectedSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`min-w-10 h-9 px-3 rounded-md text-xs font-medium border transition-colors ${
                          selected
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background text-foreground border-border hover-elevate active-elevate-2"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                نطاق السعر (ج.م)
              </p>
              <div className="flex items-center gap-3 max-w-md">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder={`من ${priceBounds.min.toFixed(0)}`}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-10"
                  min={0}
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder={`إلى ${priceBounds.max.toFixed(0)}`}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-10"
                  min={0}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  مسح كل الفلاتر
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Result count */}
        {!isLoading && hasActiveFilters && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredProducts.length === 0
              ? "لا توجد نتائج"
              : `${filteredProducts.length} ${
                  filteredProducts.length === 1 ? "منتج" : "منتجات"
                }`}
          </p>
        )}

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
        ) : activeProducts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p>لا توجد منتجات متاحة حالياً.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-md">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">لم نجد منتجات تطابق بحثك</p>
            <p className="text-sm text-muted-foreground mb-5">
              جرّب تغيير الفلاتر أو كلمات البحث
            </p>
            <Button variant="outline" onClick={resetFilters}>
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => {
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
