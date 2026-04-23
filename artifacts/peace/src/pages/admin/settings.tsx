import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Phone, MessageCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface StoreSettings {
  payment_phone: string;
  whatsapp_phone: string;
  store_name: string;
}

export default function AdminSettings() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [paymentPhone, setPaymentPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [storeName, setStoreName] = useState("");

  const { data: settings, isLoading } = useQuery<StoreSettings>({
    queryKey: ["admin-settings", token],
    queryFn: async () => {
      const res = await fetch(`/api/admin/settings?token=${token}`);
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (settings) {
      setPaymentPhone(settings.payment_phone || "");
      setWhatsappPhone(settings.whatsapp_phone || "");
      setStoreName(settings.store_name || "");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/settings?token=${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_phone: paymentPhone,
          whatsapp_phone: whatsappPhone,
          store_name: storeName,
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: () => toast.error("Failed to save settings"),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">Store Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure payment and contact information shown to customers</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                This number will be shown to customers on the order confirmation page as the Vodafone Cash transfer number.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment_phone">Vodafone Cash Number</Label>
                <Input
                  id="payment_phone"
                  placeholder="e.g. 01012345678"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Customers will transfer their order payment to this number via Vodafone Cash.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                WhatsApp Contact
              </CardTitle>
              <CardDescription>
                Customers will be directed to message this number on WhatsApp after placing an order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_phone">WhatsApp Number (international format)</Label>
                <Input
                  id="whatsapp_phone"
                  placeholder="e.g. 201012345678"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code without + sign. Egypt: 20, e.g. 201012345678
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Store Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Store Name</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="store_name">Display Name</Label>
                <Input
                  id="store_name"
                  placeholder="PEACE."
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full h-12"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
}
