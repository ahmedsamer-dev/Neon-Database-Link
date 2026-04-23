import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, Menu, X, Plus, Minus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Navbar() {
  const [location] = useLocation();
  const { items, cartCount, cartTotal, updateQuantity, removeItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-serif tracking-tight font-bold">
            PEACE.
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Shop</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-serif tracking-tight">Your Cart</SheetTitle>
              </SheetHeader>
              
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 opacity-20" />
                  <p>Your cart is empty</p>
                  <Button variant="outline" onClick={() => setIsOpen(false)} asChild>
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-6 py-4">
                      {items.map((item) => (
                        <div key={item.variantId} className="flex gap-4">
                          <div className="h-24 w-20 bg-muted rounded overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-secondary text-secondary-foreground text-xs">No image</div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm">{item.productName}</h4>
                                <button onClick={() => removeItem(item.variantId)} className="text-muted-foreground hover:text-destructive transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.color} / {item.size}
                              </p>
                              <p className="text-sm font-medium mt-1">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border rounded-md">
                                <button
                                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                  className="p-1 hover:bg-muted transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="p-1 hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              {item.quantity >= item.stock && (
                                <span className="text-xs text-muted-foreground">Max stock</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="pt-6 border-t mt-auto space-y-4">
                    <div className="flex justify-between text-base font-medium">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                    <Button className="w-full" size="lg" onClick={() => setIsOpen(false)} asChild>
                      <Link href="/checkout">Checkout</Link>
                    </Button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
