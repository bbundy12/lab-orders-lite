interface OrderItem {
  unitPriceCents: number;
  turnaroundDaysAtOrder: number;
}

export function calcTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPriceCents, 0);
}

export function calcEta(placedAt: Date, items: OrderItem[]): Date {
  if (items.length === 0) {
    return new Date(placedAt); // Return original date if no items
  }

  const maxTurnaround = Math.max(...items.map((item) => item.turnaroundDaysAtOrder));
  const result = new Date(placedAt);
  result.setDate(result.getDate() + maxTurnaround);
  return result;
}

/**
 * Formats price in cents as a currency string
 * @param cents - Price in cents (e.g., 1250 for $12.50)
 * @returns Formatted currency string (e.g., "$12.50")
 */
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
