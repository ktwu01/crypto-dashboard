import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, decimals = 2): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(decimals)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(decimals)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(decimals)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(decimals)}K`;
  }
  return `$${value.toFixed(decimals)}`;
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}