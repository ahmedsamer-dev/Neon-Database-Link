import { useParams, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetOrder, useConfirmPayment, useUpdateOrderStatus, getGetOrderQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Phone, CreditCard, Package } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UpdateOrderStatusBodyStatus } from "@workspace/api-client-react/src/generated/api.schemas";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: order, isLoading } = useGetOrder(id || "", { token: token || "" }, { query: { enabled: !!id && !!token } });
  const confirmPayment = useConfirmPayment();
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!order) return <div className="p-8">Order not found</div>;

  const handleConfirmPayment = () => {
    if (!token || !id) return;
    
    confirmPayment.mutate(
      { id, data: { token } },
      {
        onSuccess: () => {
          toast.success("Payment confirmed");
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id, { token }) });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ token }) });
        },
        onError: () => toast.error("Failed to confirm payment")
      }
    );
  };

  const handleStatusChange = (status: string) => {
    if (!token || !id) return;
    
    updateStatus.mutate(
      { id, data: { status: status as UpdateOrderStatusBodyStatus, token } },
      {
        onSuccess: () => {
          toast.success(`Order marked as ${status}`);
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id, { token }) });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ token }) });
        },
        onError: () => toast.error("Failed to update status")
      }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Order {order.id}</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), 'MMMM d, yyyy h:mm a')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.color} / {item.size}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between items-center font-medium text-lg">
                <span>Total Amount</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payment Status</span>
                  <Badge variant={order.paymentStatus === "Paid" ? "default" : "secondary"}>
                    {order.paymentStatus}
                  </Badge>
                </div>
                {order.paymentStatus === "Pending" && (
                  <Button 
                    className="w-full mt-2" 
                    onClick={handleConfirmPayment}
                    disabled={confirmPayment.isPending}
                  >
                    Confirm Payment Received
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="text-sm font-medium block">Order Status</span>
                <Select value={order.orderStatus} onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Contact: {order.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Payment: {order.paymentPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{order.address}<br/>{order.city}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
