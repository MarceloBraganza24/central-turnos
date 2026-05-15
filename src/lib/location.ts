import { createSlug } from "@/lib/slug";

export function createLocationSlug(city: string, province: string) {
  return `${createSlug(province)}-${createSlug(city)}`;
}

export function normalizeLocationText(value: string) {
  return value.trim().toLowerCase();
}