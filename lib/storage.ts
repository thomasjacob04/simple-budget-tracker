import type { BudgetData } from "./types"

const STORAGE_KEY = "simple-budget-data-v1"

export function loadData(): BudgetData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BudgetData
    if (!parsed || typeof parsed !== "object") return null
    return parsed
  } catch (err) {
    console.log("[v0] Failed to load data:", (err as Error).message)
    return null
  }
}

export function saveData(data: BudgetData) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.log("[v0] Failed to save data:", (err as Error).message)
  }
}

export function clearData() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
