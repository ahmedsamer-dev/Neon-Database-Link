import { useParams, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  useGetOrder,
  useConfirmPayment,
  useUpdateOrderStatus,
  getGetOrderQueryKey,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, MapPin, Phone, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UpdateOrderStatusBodyStatus } from "@workspace/api-client-react/src/generated/api.schemas";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrder(id || "", { token: token || "" }, {
    query: { enabled: !!id && !!token },
  });
  const confirmPayment = useConfirmPayment();
  const updateStatus = useUpdateOrderStatus();

  const handleConfirmPayment = () => {
    if (!token || !id) return;
    confirmPayment.mutate(
      { id, data: { token } },
      {
        onSuccess: () => {
          toast.success("تم تأكيد استلام الدفع");
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id, { token }) });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ token }) });
        },
        onError: () => toast.error("فشل تأكيد الدفع"),
      }
    );
  };

  const handleStatusChange = (status: string) => {
    if (!token || !id) return;
    updateStatus.mutate(
      { id, data: { status: status as UpdateOrderStatusBodyStatus, token } },
      {
        onSuccess: () => {
          toast.success("تم تحديث الحالة");
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id, { token }) });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ token }) });
        },
        onError: () => toast.error("فشل تحديث الحالة"),
      }
    );
  };

  if (isLoading)
    return (
      <div className="p-8 text-muted-foreground text-center" dir="rtl">
        جاري التحميل...
      </div>
    );
  if (!order)
    return (
      <div className="p-8 text-center" dir="rtl">
        الطلب غير موجود
      </div>
    );

  return (
    <div className="space-y-6 max-w-5xl" dir="rtl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">طلب {order.id}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.createdAt), "d MMMM yyyy، h:mm a", { locale: arEG })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المنتجات المطلوبة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.color} / {item.size}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{item.price.toFixed(2)} ج.م</p>
                      <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>الإجمالي</span>
                <span>{order.totalAmount.toFixed(2)} ج.م</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الحالة والإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">حالة الدفع</span>
                  <Badge variant={order.paymentStatus === "Paid" ? "default" : "secondary"}>
                    {order.paymentStatus === "Paid" ? "مدفوع" : "معلق"}
                  </Badge>
                </div>
                {order.paymentStatus === "Pending" && (
                  <Button
                    className="w-full mt-2 transition-all duration-200"
                    onClick={handleConfirmPayment}
                    disabled={confirmPayment.isPending}
                  >
                    {confirmPayment.isPending ? "جاري التأكيد..." : "تأكيد استلام الدفع"}
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="text-sm font-medium block">حالة الطلب</span>
                <Select
                  value={order.orderStatus}
                  onValueChange={handleStatusChange}
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">معلق</SelectItem>
                    <SelectItem value="Shipped">قيد التنفيذ</SelectItem>
                    <SelectItem value="Delivered">تم التسليم</SelectItem>
                    <SelectItem value="Cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">بيانات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="font-medium text-base">{order.customerName}</p>
              <div className="flex items-start gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span dir="ltr">{order.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-foreground text-xs block mb-0.5">رقم فودافون كاش</span>
                  <span dir="ltr">{order.paymentPhone}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {order.address}
                  <br />
                  {order.city}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
