const STORAGE_KEY = "peace_recently_viewed_v1";
const MAX_ITEMS = 8;

function read(): number[] {
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

function write(ids: number[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function trackView(productId: number): void {
  const current = read().filter((id) => id !== productId);
  current.unshift(productId);
  write(current.slice(0, MAX_ITEMS));
}

export function getRecentlyViewed(excludeId?: number): number[] {
  const list = read();
  return excludeId ? list.filter((id) => id !== excludeId) : list;
}
