import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { useGetProduct } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useGetProduct(id, { query: { enabled: !!id } });
  const { addItem, items } = useCart();
  
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map(v => v.color)));
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants || !selectedColor) return [];
    return product.variants
      .filter(v => v.color === selectedColor)
      .map(v => v.size);
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedColor || !selectedSize) return null;
    return product.variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  // Reset size when color changes
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
    
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const priceToDisplay = selectedVariant?.price || product?.basePrice;
  const isOutOfStock = selectedVariant && selectedVariant.stock <= 0;
  const cartItem = selectedVariant ? items.find(i => i.variantId === selectedVariant.id) : null;
  const alreadyInCart = cartItem?.quantity ?? 0;
  const maxCanAdd = selectedVariant ? Math.max(0, selectedVariant.stock - alreadyInCart) : 0;
  const canAddToCart = selectedVariant && !isOutOfStock && maxCanAdd > 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12">
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
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif mb-4">Product not found</h2>
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        {/* Images */}
        <div className="w-full md:w-1/2 lg:w-[55%] flex gap-4">
          <div className="hidden sm:flex flex-col gap-4 w-20 flex-shrink-0">
            {product.images?.map((img, i) => (
              <button key={i} className="aspect-[3/4] w-full bg-muted overflow-hidden border border-transparent hover:border-border transition-colors">
                <img src={img} alt={`${product.name} view ${i+1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="aspect-[3/4] flex-1 bg-muted relative overflow-hidden">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
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
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-2">{product.name}</h1>
            <p className="text-xl text-muted-foreground mb-6">${priceToDisplay?.toFixed(2)}</p>
            
            <div className="prose prose-sm text-muted-foreground mb-8">
              <p>{product.description}</p>
            </div>

            {/* Selectors */}
            <div className="space-y-6 mb-8">
              {/* Color */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Color</span>
                  <span className="text-sm text-muted-foreground">{selectedColor || "Select a color"}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-4 py-2 text-sm border rounded-sm transition-all
                        ${selectedColor === color 
                          ? 'border-foreground bg-foreground text-background' 
                          : 'border-border hover:border-foreground/50'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              {selectedColor && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Size</span>
                    <span className="text-sm text-muted-foreground">{selectedSize || "Select a size"}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.variants
                      .filter(v => v.color === selectedColor)
                      .map(variant => (
                        <button
                          key={variant.size}
                          onClick={() => setSelectedSize(variant.size)}
                          disabled={variant.stock <= 0}
                          className={`h-12 min-w-12 px-4 border rounded-sm flex items-center justify-center transition-all text-sm
                            ${selectedSize === variant.size 
                              ? 'border-foreground bg-foreground text-background' 
                              : variant.stock <= 0
                                ? 'opacity-30 cursor-not-allowed bg-muted'
                                : 'border-border hover:border-foreground/50'}`}
                        >
                          {variant.size}
                        </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-sm h-12">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!canAddToCart}
                    className="w-12 h-full flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(maxCanAdd, quantity + 1))}
                    disabled={!canAddToCart || quantity >= maxCanAdd}
                    className="w-12 h-full flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="flex-1 h-12 rounded-sm text-base"
                >
                  {isOutOfStock || (!isOutOfStock && selectedVariant && maxCanAdd === 0 && alreadyInCart > 0)
                    ? alreadyInCart > 0 ? "Already in Cart (Max)" : "Out of Stock"
                    : !selectedVariant ? "Select Options" : "Add to Cart"}
                </Button>
              </div>
              
              {selectedVariant && (
                <p className="text-xs text-muted-foreground text-center">
                  {maxCanAdd > 0
                    ? `${maxCanAdd} item${maxCanAdd === 1 ? "" : "s"} available to add`
                    : alreadyInCart > 0
                      ? "You already have all available stock in your cart"
                      : "Out of stock"}
                </p>
              )}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
