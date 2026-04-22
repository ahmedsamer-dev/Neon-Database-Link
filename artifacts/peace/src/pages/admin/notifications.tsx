import { useAuth } from "@/lib/auth";
import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, ShoppingBag, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminNotifications() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useListNotifications({ token: token || "" }, { query: { enabled: !!token } });
  const markRead = useMarkNotificationRead();

  const handleMarkRead = (id: string) => {
    if (!token) return;
    markRead.mutate(
      { id, data: { token } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey({ token }) });
          queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey({ token }) });
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">Alerts for new orders and payments.</p>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : notifications?.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            notifications?.map((notif) => (
              <div key={notif.id} className={`p-6 flex items-start gap-4 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${notif.type === 'NewOrder' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {notif.type === 'NewOrder' ? <ShoppingBag className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-base ${!notif.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {notif.message}
                    </p>
                    {!notif.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 -mt-1 ml-4 flex-shrink-0"
                        onClick={() => handleMarkRead(notif.id)}
                        disabled={markRead.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Mark read
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notif.createdAt), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
