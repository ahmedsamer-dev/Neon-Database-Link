import { useParams, Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, MessageCircle, Phone, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

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
  paymentPhone: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  items: OrderItem[];
}

interface StoreSettings {
  paymentPhone: string;
  whatsappPhone: string;
  storeName: string;
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const search = useSearch();
  const queryPhone = new URLSearchParams(search).get("phone") ?? "";
  const [manualPhone, setManualPhone] = useState("");
  const [submittedManualPhone, setSubmittedManualPhone] = useState("");
  const [copied, setCopied] = useState(false);

  const phone = queryPhone || submittedManualPhone;

  const { data: order, isLoading: orderLoading } = useQuery<Order>({
    queryKey: ["order", id, phone],
    queryFn: async () => {
      const res = await fetch(
        `/api/orders/${id}?phone=${encodeURIComponent(phone)}`,
      );
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },
    enabled: !!id && !!phone,
    retry: false,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<StoreSettings>({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
  });

  const isLoading = (!!phone && orderLoading) || settingsLoading;
  const needsPhonePrompt = !!id && !phone;

  const onSubmitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = manualPhone.replace(/\D/g, "").slice(-4);
    if (digits.length < 4) return;
    setSubmittedManualPhone(digits);
  };

  const copyPhone = () => {
    if (!settings?.paymentPhone) return;
    navigator.clipboard.writeText(settings.paymentPhone);
    setCopied(true);
    toast.success("تم نسخ الرقم!");
    setTimeout(() => setCopied(false), 2000);
  };

  const generateWhatsAppLink = () => {
    if (!order || !settings) return "#";
    const phone = settings.whatsappPhone.replace(/[^0-9]/g, "");
    const itemsList = order.items
      .map((item) => `- ${item.quantity}x ${item.productName} (${item.color}, ${item.size})`)
      .join("%0A");

    const message =
      `مرحباً ${settings.storeName}%0A%0Aلقد أرسلت طلبي.%0Aرقم الطلب: ${order.id}%0Aالاسم: ${order.customerName}%0A%0Aالمنتجات:%0A${itemsList}%0A%0Aالإجمالي: ${Number(order.totalAmount).toFixed(2)} جنيه%0A%0Aسأرسل الدفع من الرقم: ${order.paymentPhone}%0Aيرجى التأكيد!`;

    return `https://wa.me/${phone}?text=${message}`;
  };

  if (needsPhonePrompt) {
    return (
      <div
        className="container mx-auto px-4 py-24 max-w-md text-center"
        dir="rtl"
      >
        <h1 className="text-2xl font-serif font-bold mb-3">تأكيد الهوية</h1>
        <p className="text-sm text-muted-foreground mb-8">
          للوصول إلى تفاصيل الطلب{" "}
          <span className="font-mono" dir="ltr">
            {id}
          </span>
          ، أدخل آخر 4 أرقام من رقم الهاتف الذي تم استخدامه عند الطلب.
        </p>
        <form onSubmit={onSubmitPhone} className="space-y-4 text-right">
          <div>
            <Label htmlFor="confirm-phone" className="text-sm mb-2 block">
              آخر 4 أرقام من الهاتف
            </Label>
            <Input
              id="confirm-phone"
              placeholder="1234"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              inputMode="numeric"
              maxLength={4}
              className="h-12 text-base"
              dir="ltr"
            />
          </div>
          <Button type="submit" className="w-full h-12">
            عرض الطلب
          </Button>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-xl text-center space-y-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-xl text-center" dir="rtl">
        <h1 className="text-2xl font-serif mb-3">الطلب غير موجود</h1>
        <p className="text-sm text-muted-foreground mb-8">
          تأكد من رقم الطلب وآخر 4 أرقام من الهاتف، ثم حاول مرة أخرى.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setSubmittedManualPhone("");
              setManualPhone("");
            }}
          >
            إعادة المحاولة
          </Button>
          <Button asChild>
            <Link href="/">العودة للمتجر</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl text-center" dir="rtl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <CheckCircle2 className="h-10 w-10" />
      </motion.div>

      <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
        تم استلام طلبك!
      </h1>

      <p className="text-muted-foreground text-lg mb-8">
        رقم طلبك:{" "}
        <span className="font-mono text-foreground font-bold">{order.id}</span>
      </p>

      {/* Payment Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-muted/50 p-6 md:p-8 rounded-xl text-right mb-6 border border-border space-y-6"
      >
        <div>
          <h3 className="font-serif font-bold text-xl mb-2">خطوات إتمام الدفع</h3>
          <p className="text-sm text-muted-foreground">
            لإتمام طلبك، يرجى تحويل مبلغ{" "}
            <strong className="text-foreground text-base">
              {Number(order.totalAmount).toFixed(2)} جنيه
            </strong>{" "}
            عبر فودافون كاش على الرقم التالي:
          </p>
        </div>

        {/* Vodafone Cash Number */}
        <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">رقم فودافون كاش</p>
              <p className="font-mono text-2xl font-bold tracking-wider">
                {settings?.paymentPhone ?? "..."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyPhone}
            className="flex-shrink-0 h-10 w-10"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          بعد إرسال التحويل، اضغط على الزر أدناه لإرسالنا رسالة على واتساب بتفاصيل طلبك حتى نتمكن من تأكيد استلام الدفع.
        </p>
      </motion.div>

      {/* WhatsApp Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <Button
          asChild
          size="lg"
          className="w-full h-14 bg-[#25D366] hover:bg-[#1da851] text-white text-base gap-3"
        >
          <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" />
            أرسل تفاصيل الطلب على واتساب
          </a>
        </Button>

        <Button variant="outline" asChild className="w-full">
          <Link href="/">العودة للمتجر</Link>
        </Button>
      </motion.div>
    </div>
  );
}
