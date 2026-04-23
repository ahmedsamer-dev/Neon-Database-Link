import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products, isLoading } = useListProducts();

  return (
    <div className="flex flex-col w-full" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero.jpg"
            alt="Peace fashion"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground mb-6"
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
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24 container mx-auto px-4 md:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold tracking-tight">أحدث المنتجات</h2>
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

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group flex flex-col"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="block aspect-[3/4] relative overflow-hidden bg-muted rounded-sm mb-4"
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                          Peace.
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white text-black text-sm font-semibold px-3 py-1.5 rounded-full">
                            نفذت الكمية
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base">
                          <Link href={`/products/${product.id}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {product.description}
                        </p>
                        {isOutOfStock && (
                          <p className="text-xs text-rose-500 font-medium mt-1">نفذت الكمية</p>
                        )}
                      </div>
                      <span className="font-medium mr-2">{product.basePrice.toFixed(2)} ج.م</span>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
}
