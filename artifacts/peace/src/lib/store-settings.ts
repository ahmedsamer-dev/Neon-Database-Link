import { useQuery } from "@tanstack/react-query";

export interface StoreSettings {
  paymentPhone: string;
  whatsappPhone: string;
  storeName: string;
}

export function useStoreSettings() {
  return useQuery<StoreSettings>({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
    staleTime: 5 * 60_000,
  });
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
