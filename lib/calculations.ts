interface OrderItem {
  unitPriceCents: number
  turnaroundDaysAtOrder: number
}

export function calcTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPriceCents, 0)
}

export function calcEta(placedAt: Date, items: OrderItem[]): Date {
  const maxTurnaround = Math.max(...items.map((item) => item.turnaroundDaysAtOrder))
  const result = new Date(placedAt)
  result.setDate(result.getDate() + maxTurnaround)
  return result
}
