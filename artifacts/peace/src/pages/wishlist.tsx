import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { useWishlist } from "@/lib/wishlist";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { WishlistButton } from "@/components/wishlist-button";

export default function Wishlist() {
  const { data: products, isLoading } = useListProducts();
  const { items } = useWishlist();

  const wished = (products || []).filter((p) => items.includes(p.id));

  return (
    <div className="container mx-auto px-4 md:px-8 py-16" dir="rtl">
      <div className="mb-10">
        <span className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Wishlist
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
          المفضلة
        </h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : wished.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-md">
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-2">لا توجد منتجات في المفضلة</p>
          <p className="text-sm text-muted-foreground mb-6">
            تصفح المتجر وأضف ما يعجبك من الأيقونة بجانب كل منتج
          </p>
          <Button asChild className="hover-elevate active-elevate-2">
            <Link href="/">تصفح المنتجات</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wished.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group flex flex-col card-premium"
            >
              <div className="relative">
                <Link
                  href={`/products/${product.id}`}
                  className="block aspect-[3/4] relative overflow-hidden bg-muted rounded-sm mb-4"
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover image-premium"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-foreground font-serif text-2xl bg-secondary">
                      Peace.
                    </div>
                  )}
                </Link>
                <WishlistButton productId={product.id} productName={product.name} />
              </div>
              <div className="flex justify-between items-start gap-3 px-1">
                <h3 className="font-medium text-base">
                  <Link href={`/products/${product.id}`} className="link-premium inline-block">
                    {product.name}
                  </Link>
                </h3>
                <span className="font-medium whitespace-nowrap">
                  {product.basePrice.toFixed(2)} ج.م
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
