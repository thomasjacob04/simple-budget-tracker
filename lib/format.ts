// The app uses Australian Dollars (AUD) everywhere.
export const APP_CURRENCY = "AUD"

export function currencySymbol(): string {
  return "$"
}

export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: APP_CURRENCY,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

export function isSameMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso + "T00:00:00")
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

export function todayISO(): string {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function monthLabel(ref: Date): string {
  return ref.toLocaleDateString(undefined, { month: "long", year: "numeric" })
}
