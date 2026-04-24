import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [location] = useLocation();
  const { items, cartCount, cartTotal, updateQuantity, removeItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md" dir="rtl">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-serif tracking-tight font-bold">
            PEACE.
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href="/"
              className={`hover:text-foreground transition-colors duration-200 ${location === "/" ? "text-foreground" : ""}`}
            >
              المتجر
            </Link>
            <Link
              href="/about"
              className={`hover:text-foreground transition-colors duration-200 ${location === "/about" ? "text-foreground" : ""}`}
            >
              من نحن
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative transition-all duration-200 hover:scale-110"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md flex flex-col" dir="rtl">
              <SheetHeader>
                <SheetTitle className="font-serif tracking-tight">سلة التسوق</SheetTitle>
              </SheetHeader>

              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 opacity-20" />
                  <p>سلتك فارغة</p>
                  <Button variant="outline" onClick={() => setIsOpen(false)} asChild>
                    <Link href="/">تسوق الآن</Link>
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
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-secondary text-secondary-foreground text-xs">
                                لا صورة
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm">{item.productName}</h4>
                                <button
                                  onClick={() => removeItem(item.variantId)}
                                  className="text-muted-foreground hover:text-destructive transition-colors duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.color} / {item.size}
                              </p>
                              <p className="text-sm font-medium mt-1">{item.price.toFixed(2)} ج.م</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border rounded-md">
                                <button
                                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                  className="p-1 hover:bg-muted transition-colors duration-200"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="p-1 hover:bg-muted transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              {item.quantity >= item.stock && (
                                <span className="text-xs text-muted-foreground">الحد الأقصى</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="pt-6 border-t mt-auto space-y-4">
                    <div className="flex justify-between text-base font-medium">
                      <span>الإجمالي</span>
                      <span>{cartTotal.toFixed(2)} ج.م</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      سيتم احتساب الشحن عند إتمام الطلب
                    </p>
                    <Button
                      className="w-full transition-all duration-200 hover:scale-[1.01]"
                      size="lg"
                      onClick={() => setIsOpen(false)}
                      asChild
                    >
                      <Link href="/checkout">إتمام الطلب</Link>
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
