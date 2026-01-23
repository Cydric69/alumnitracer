import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cache helper
export async function cache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  if (typeof window === "undefined") {
    // Server-side: Simple cache
    const cacheData = (global as any).__cache?.[key];
    if (cacheData && Date.now() - cacheData.timestamp < ttl * 1000) {
      return cacheData.data;
    }
    const data = await fetcher();
    if (!(global as any).__cache) (global as any).__cache = {};
    (global as any).__cache[key] = { data, timestamp: Date.now() };
    return data;
  }

  // Client-side: Use localStorage
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttl * 1000) {
      return data;
    }
  }

  const data = await fetcher();
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}
