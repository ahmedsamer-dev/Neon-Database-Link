import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Package, CheckCircle2, Clock, Truck, XCircle, Search } from "lucide-react";
import { Link } from "wouter";

interface OrderItem {
  id: number;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}
interface Order {
  id: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const STAGES = [
  { key: "Pending", label: "تم استلام الطلب", icon: Clock },
  { key: "Confirmed", label: "تم تأكيد الدفع", icon: CheckCircle2 },
  { key: "Shipped", label: "تم الشحن", icon: Truck },
  { key: "Delivered", label: "تم التسليم", icon: Package },
];

function StatusTimeline({ status }: { status: string }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-md">
        <XCircle className="h-5 w-5" />
        <span className="font-medium">تم إلغاء هذا الطلب</span>
      </div>
    );
  }

  const currentIndex = Math.max(
    0,
    STAGES.findIndex((s) => s.key === status),
  );
  const activeIndex = currentIndex < 0 ? 0 : currentIndex;

  return (
    <div className="relative" dir="rtl">
      <div className="absolute top-5 right-5 left-5 h-px bg-border" aria-hidden />
      <div
        className="absolute top-5 right-5 h-px bg-foreground transition-all duration-700"
        style={{
          width:
            activeIndex === 0
              ? "0%"
              : `calc((100% - 2.5rem) * ${activeIndex / (STAGES.length - 1)})`,
        }}
        aria-hidden
      />
      <div className="relative grid grid-cols-4 gap-2">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const reached = i <= activeIndex;
          return (
            <div key={stage.key} className="flex flex-col items-center text-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                  reached
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`text-xs leading-tight ${
                  reached ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const [codeInput, setCodeInput] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["track-order", submittedCode],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${encodeURIComponent(submittedCode!)}`);
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },
    enabled: !!submittedCode,
    retry: false,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = codeInput.trim();
    if (!trimmed) return;
    setSubmittedCode(trimmed);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-16 max-w-3xl" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-10">
          <span className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Order Tracking
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-3">
            تتبع طلبك
          </h1>
          <p className="text-muted-foreground">
            ادخل رقم الطلب الذي وصلك بعد إتمام الشراء (مثال: ORD-0001)
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex gap-3 mb-10">
          <div className="flex-1">
            <Label htmlFor="order-code" className="sr-only">
              رقم الطلب
            </Label>
            <Input
              id="order-code"
              placeholder="ORD-0001"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="h-12 text-base"
              dir="ltr"
            />
          </div>
          <Button type="submit" className="h-12 px-6 hover-elevate active-elevate-2">
            <Search className="ml-2 h-4 w-4" />
            تتبع
          </Button>
        </form>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {error && submittedCode && !isLoading && (
          <div className="text-center py-12 border border-dashed border-border rounded-md">
            <XCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">لم يتم العثور على هذا الطلب</p>
            <p className="text-sm text-muted-foreground">
              تأكد من رقم الطلب وحاول مرة أخرى
            </p>
          </div>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="border border-border rounded-md p-6 bg-card">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">رقم الطلب</p>
                  <p className="font-mono text-lg font-medium" dir="ltr">
                    {order.id}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground mb-1">الإجمالي</p>
                  <p className="text-lg font-medium">
                    {Number(order.totalAmount).toFixed(2)} ج.م
                  </p>
                </div>
              </div>

              <StatusTimeline status={order.orderStatus} />

              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">حالة الدفع</p>
                  <p className="font-medium">
                    {order.paymentStatus === "Confirmed"
                      ? "مؤكد"
                      : order.paymentStatus === "Rejected"
                      ? "مرفوض"
                      : "قيد المراجعة"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">تاريخ الطلب</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-md p-6 bg-card">
              <h3 className="font-medium mb-4">منتجات الطلب</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.color} / {item.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {(Number(item.price) * item.quantity).toFixed(2)} ج.م
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button asChild variant="outline" className="hover-elevate active-elevate-2">
                <Link href="/">العودة للمتجر</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
