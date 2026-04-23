import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/lib/cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customerName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  phone: z.string().min(6, "رقم الهاتف يجب أن يكون 6 أرقام على الأقل"),
  paymentPhone: z.string().min(6, "رقم الدفع يجب أن يكون 6 أرقام على الأقل"),
  address: z.string().min(10, "العنوان يجب أن يكون 10 أحرف على الأقل"),
  city: z.string().min(2, "المدينة يجب أن تكون حرفين على الأقل"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, cartTotal, clearCart } = useCart();
  const createOrder = useCreateOrder();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      paymentPhone: "",
      address: "",
      city: "",
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    createOrder.mutate(
      {
        data: {
          ...data,
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/order-confirmation/${order.id}`);
        },
        onError: () => {
          toast.error("حدث خطأ أثناء تقديم الطلب. حاول مجدداً.");
        },
      }
    );
  };

  if (items.length === 0 && !createOrder.isPending) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-xl text-center" dir="rtl">
        <h1 className="text-3xl font-serif font-bold mb-4">إتمام الطلب</h1>
        <p className="text-muted-foreground mb-8">سلتك فارغة. أضف منتجات قبل إتمام الطلب.</p>
        <Button asChild>
          <Link href="/">العودة للمتجر</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-5xl" dir="rtl">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للمتجر
        </Link>
      </div>

      <h1 className="text-3xl font-serif font-bold tracking-tight mb-8">إتمام الطلب</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form */}
        <div className="w-full lg:w-3/5 order-2 lg:order-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-medium">بيانات التواصل</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم بالكامل</FormLabel>
                        <FormControl>
                          <Input placeholder="محمد أحمد" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="01xxxxxxxxx" dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-xl font-serif font-medium">عنوان التوصيل</h2>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان بالتفصيل</FormLabel>
                      <FormControl>
                        <Input placeholder="الشارع، رقم المبنى، الطابق..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المدينة</FormLabel>
                      <FormControl>
                        <Input placeholder="القاهرة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-xl font-serif font-medium">بيانات الدفع</h2>
                <p className="text-sm text-muted-foreground">
                  ندفع عبر فودافون كاش. أدخل رقم الهاتف الذي ستحول منه المبلغ.
                </p>
                <FormField
                  control={form.control}
                  name="paymentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم فودافون كاش للدفع</FormLabel>
                      <FormControl>
                        <Input placeholder="01xxxxxxxxx" dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base transition-all duration-200 hover:scale-[1.01]"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري تقديم الطلب...
                  </>
                ) : (
                  "تأكيد الطلب"
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-2/5 order-1 lg:order-2">
          <div className="bg-muted p-6 md:p-8 rounded-sm sticky top-24">
            <h2 className="text-xl font-serif font-medium mb-6">ملخص الطلب</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-12 bg-background rounded overflow-hidden flex-shrink-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.color} / {item.size}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">الكمية: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium whitespace-nowrap">
                    {(item.price * item.quantity).toFixed(2)} ج.م
                  </p>
                </div>
              ))}
            </div>

            <Separator className="mb-6 bg-border/50" />

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الجزئي</span>
                <span>{cartTotal.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                <span className="text-emerald-600 font-medium">مجاني</span>
              </div>
            </div>

            <Separator className="mb-6 bg-border/50" />

            <div className="flex justify-between font-bold text-lg">
              <span>الإجمالي</span>
              <span>{cartTotal.toFixed(2)} ج.م</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
