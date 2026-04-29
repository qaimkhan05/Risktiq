import { format } from "date-fns";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: Date | string, pattern = "dd MMM yyyy") {
  return format(new Date(value), pattern);
}
