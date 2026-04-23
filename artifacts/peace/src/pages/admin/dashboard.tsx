import { useAuth } from "@/lib/auth";
import { useGetAdminStats, useListOrders, useListNotifications } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle2, Truck, Check, Bell } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { token } = useAuth();

  const { data: stats } = useGetAdminStats(
    { token: token || "" },
    { query: { enabled: !!token } }
  );
  const { data: orders } = useListOrders(
    { token: token || "" },
    { query: { enabled: !!token } }
  );
  const { data: notifications } = useListNotifications(
    { token: token || "" },
    { query: { enabled: !!token } }
  );

  const statCards = [
    { title: "إجمالي الطلبات", value: stats?.total || 0, icon: Package, color: "text-foreground" },
    { title: "قيد الانتظار", value: stats?.pending || 0, icon: Clock, color: "text-amber-500" },
    { title: "مدفوعة", value: stats?.paid || 0, icon: CheckCircle2, color: "text-emerald-500" },
    { title: "قيد التنفيذ", value: stats?.shipped || 0, icon: Truck, color: "text-blue-500" },
    { title: "تم التسليم", value: stats?.delivered || 0, icon: Check, color: "text-indigo-500" },
    { title: "تنبيهات غير مقروءة", value: stats?.unreadNotifications || 0, icon: Bell, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على أداء المتجر</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">آخر الطلبات</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 font-medium">رقم الطلب</th>
                    <th className="px-6 py-3 font-medium">العميل</th>
                    <th className="px-6 py-3 font-medium">الإجمالي</th>
                    <th className="px-6 py-3 font-medium">الدفع</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.slice(0, 5).map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-primary">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{order.customerName}</td>
                      <td className="px-6 py-4 font-medium">
                        {order.totalAmount.toFixed(2)} ج.م
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={order.paymentStatus === "Paid" ? "default" : "outline"}
                          className="text-[10px]"
                        >
                          {order.paymentStatus === "Paid" ? "مدفوع" : "معلق"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {(!orders || orders.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        لا توجد طلبات بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">التنبيهات</h2>
            <Link href="/admin/notifications" className="text-sm text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <Card>
            <div className="divide-y divide-border">
              {notifications?.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex gap-4 ${!notif.isRead ? "bg-primary/5" : ""}`}
                >
                  <div
                    className={`mt-0.5 flex-shrink-0 ${
                      !notif.isRead ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notif.createdAt), "d MMM، h:mm a", { locale: arEG })}
                    </p>
                  </div>
                </div>
              ))}
              {(!notifications || notifications.length === 0) && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  لا توجد تنبيهات جديدة.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
