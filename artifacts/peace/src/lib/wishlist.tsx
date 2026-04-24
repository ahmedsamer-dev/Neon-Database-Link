import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "peace_wishlist_v1";

interface WishlistContextValue {
  items: number[];
  has: (productId: number) => boolean;
  toggle: (productId: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStorage(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<number[]>(() => readStorage());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const has = (id: number) => items.includes(id);
  const toggle = (id: number) =>
    setItems((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));
  const remove = (id: number) => setItems((prev) => prev.filter((n) => n !== id));
  const clear = () => setItems([]);

  return (
    <WishlistContext.Provider
      value={{ items, has, toggle, remove, clear, count: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
