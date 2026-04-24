import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { toast } from "sonner";

interface Props {
  productId: number;
  productName?: string;
  variant?: "icon" | "inline";
  className?: string;
}

export function WishlistButton({ productId, productName, variant = "icon", className = "" }: Props) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
    if (!active) {
      toast.success(productName ? `تمت إضافة ${productName} إلى المفضلة` : "تمت الإضافة للمفضلة");
    } else {
      toast(productName ? `تمت إزالة ${productName} من المفضلة` : "تمت الإزالة");
    }
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={active ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        className={`inline-flex items-center gap-2 px-4 py-2 border border-border rounded-sm text-sm hover-elevate active-elevate-2 ${className}`}
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            active ? "fill-rose-500 text-rose-500" : ""
          }`}
        />
        {active ? "في المفضلة" : "أضف للمفضلة"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      className={`absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          active ? "fill-rose-500 text-rose-500" : "text-foreground"
        }`}
      />
    </button>
  );
}
