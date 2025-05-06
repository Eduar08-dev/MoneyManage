import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add formatCurrency function
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Change currency as needed
  }).format(amount);
}

// Add formatDate function
export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  // Format date as needed, e.g., 'MM/DD/YYYY'
  return new Intl.DateTimeFormat('en-US').format(date);
}
