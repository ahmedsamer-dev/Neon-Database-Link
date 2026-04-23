import { useAuth } from "@/lib/auth";
import { useListOrders } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";

type FilterType = "all" | "pending" | "processing" | "completed";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "كل الطلبات" },
  { key: "pending", label: "قيد الانتظار" },
  { key: "processing", label: "قيد التنفيذ" },
  { key: "completed", label: "تم التنفيذ" },
];

export default function AdminOrders() {
  const { token } = useAuth();
  const { data: orders, isLoading } = useListOrders(
    { token: token || "" },
    { query: { enabled: !!token } }
  );
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredOrders =
    orders?.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.phone.includes(search);

      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "pending"
          ? order.paymentStatus === "Pending" && order.orderStatus === "Pending"
          : activeFilter === "processing"
          ? order.orderStatus === "Shipped"
          : activeFilter === "completed"
          ? order.orderStatus === "Delivered" || order.paymentStatus === "Paid"
          : true;

      return matchesSearch && matchesFilter;
    }) || [];

  const countByFilter = (f: FilterType) => {
    if (!orders) return 0;
    if (f === "all") return orders.length;
    if (f === "pending")
      return orders.filter((o) => o.paymentStatus === "Pending" && o.orderStatus === "Pending").length;
    if (f === "processing") return orders.filter((o) => o.orderStatus === "Shipped").length;
    if (f === "completed")
      return orders.filter((o) => o.orderStatus === "Delivered" || o.paymentStatus === "Paid").length;
    return 0;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">الطلبات</h1>
          <p className="text-muted-foreground mt-1">إدارة ومتابعة طلبات العملاء</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن طلب..."
            className="pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = countByFilter(f.key);
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.02] flex items-center gap-2 ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {f.label}
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 ${
                  isActive ? "bg-background/20 text-background" : "bg-background text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">رقم الطلب</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">الإجمالي</th>
                <th className="px-6 py-4 font-medium">الدفع</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    لا توجد طلبات.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-primary">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(order.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{order.totalAmount.toFixed(2)} ج.م</td>
                    <td className="px-6 py-4">
                      <Badge variant={order.paymentStatus === "Paid" ? "default" : "secondary"}>
                        {order.paymentStatus === "Paid" ? "مدفوع" : "معلق"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          order.orderStatus === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                            : order.orderStatus === "Shipped"
                            ? "bg-blue-500/10 text-blue-600 border-blue-200"
                            : order.orderStatus === "Cancelled"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : ""
                        }
                      >
                        {order.orderStatus === "Delivered"
                          ? "تم التسليم"
                          : order.orderStatus === "Shipped"
                          ? "قيد التنفيذ"
                          : order.orderStatus === "Cancelled"
                          ? "ملغي"
                          : "معلق"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
