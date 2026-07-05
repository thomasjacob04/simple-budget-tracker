export type EntryKind = "income" | "expense" | "saving"

export type SavingsGoal = {
  id: string
  name: string
}

export type Preferences = {
  incomeTypes: string[]
  expenseCategories: string[]
  savingsGoals: SavingsGoal[] // includes fixed "Church"
  currency: string
}

export type Entry = {
  id: string
  kind: EntryKind
  type: string // income source, expense category, or goal name
  amount: number
  date: string // ISO date (yyyy-mm-dd)
  note?: string
}

export type BudgetData = {
  preferences: Preferences
  entries: Entry[]
  onboarded: boolean
}

export const DEFAULT_INCOME_TYPES = [
  "Salary",
  "Casual",
  "Business",
  "Investment",
  "Other",
]

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Rent/Mortgage",
  "Groceries",
  "Restaurant",
  "Cafe",
  "Fuel",
  "Vehicle Insurance",
  "Personal Insurance",
  "Energy Bill",
  "Internet Bill",
  "Phone Bill",
  "Haircut",
  "Church",
  "Other",
]

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "CAD", symbol: "$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "$", label: "Australian Dollar" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
]
