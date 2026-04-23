import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, MessageCircle, Phone, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface StoreSettings {
  paymentPhone: string;
  whatsappPhone: string;
  storeName: string;
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading: orderLoading } = useGetOrder(
    id || "",
    { token: "" },
    { query: { enabled: !!id } }
  );

  const { data: settings, isLoading: settingsLoading } = useQuery<StoreSettings>({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
  });

  const isLoading = orderLoading || settingsLoading;

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
      `مرحباً ${settings.storeName}%0A%0Aلقد أرسلت طلبي.%0Aرقم الطلب: ${order.id}%0Aالاسم: ${order.customerName}%0A%0Aالمنتجات:%0A${itemsList}%0A%0Aالإجمالي: ${order.totalAmount.toFixed(2)} جنيه%0A%0Aسأرسل الدفع من الرقم: ${order.paymentPhone}%0Aيرجى التأكيد!`;

    return `https://wa.me/${phone}?text=${message}`;
  };

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
      <div className="container mx-auto px-4 py-24 max-w-xl text-center">
        <h1 className="text-2xl font-serif mb-4">Order not found</h1>
        <Button asChild>
          <Link href="/">Return to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
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
              {order.totalAmount.toFixed(2)} جنيه
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
                {settings?.paymentPhone}
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={copyPhone} className="flex-shrink-0 h-10 w-10">
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-right">
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
