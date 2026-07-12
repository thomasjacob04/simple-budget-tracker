"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { track } from "@vercel/analytics"
import type { BudgetData, Entry, Preferences } from "./types"
import { clearData, generateId, loadData, saveData } from "./storage"

type BudgetContextValue = {
  hydrated: boolean
  onboarded: boolean
  preferences: Preferences | null
  entries: Entry[]
  completeOnboarding: (prefs: Preferences) => void
  updatePreferences: (prefs: Preferences) => void
  addEntry: (entry: Omit<Entry, "id">) => void
  updateEntry: (entry: Entry) => void
  deleteEntry: (id: string) => void
  importData: (data: BudgetData) => void
  exportData: () => BudgetData | null
  resetAll: () => void
}

const BudgetContext = createContext<BudgetContextValue | null>(null)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [data, setData] = useState<BudgetData | null>(null)

  useEffect(() => {
    setData(loadData())
    setHydrated(true)
  }, [])

  const persist = useCallback((next: BudgetData) => {
    setData(next)
    saveData(next)
  }, [])

  const completeOnboarding = useCallback(
    (preferences: Preferences) => {
      persist({ preferences, entries: data?.entries ?? [], onboarded: true })
      track("currency_selected", { currency: preferences.currency, source: "onboarding" })
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: preferences.currency,
          incomeTypes: preferences.incomeTypes,
        }),
      }).catch(() => {})
    },
    [data, persist],
  )

  const updatePreferences = useCallback(
    (preferences: Preferences) => {
      if (!data) return
      if (preferences.currency !== data.preferences.currency) {
        track("currency_selected", { currency: preferences.currency, source: "settings" })
      }
      persist({ ...data, preferences })
    },
    [data, persist],
  )

  const addEntry = useCallback(
    (entry: Omit<Entry, "id">) => {
      if (!data) return
      const next: Entry = { ...entry, id: generateId() }
      persist({ ...data, entries: [next, ...data.entries] })
    },
    [data, persist],
  )

  const updateEntry = useCallback(
    (entry: Entry) => {
      if (!data) return
      persist({
        ...data,
        entries: data.entries.map((e) => (e.id === entry.id ? entry : e)),
      })
    },
    [data, persist],
  )

  const deleteEntry = useCallback(
    (id: string) => {
      if (!data) return
      persist({ ...data, entries: data.entries.filter((e) => e.id !== id) })
    },
    [data, persist],
  )

  const importData = useCallback(
    (incoming: BudgetData) => {
      persist({ ...incoming, onboarded: true })
    },
    [persist],
  )

  const exportData = useCallback(() => data, [data])

  const resetAll = useCallback(() => {
    clearData()
    setData(null)
  }, [])

  const value: BudgetContextValue = {
    hydrated,
    onboarded: Boolean(data?.onboarded),
    preferences: data?.preferences ?? null,
    entries: data?.entries ?? [],
    completeOnboarding,
    updatePreferences,
    addEntry,
    updateEntry,
    deleteEntry,
    importData,
    exportData,
    resetAll,
  }

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider")
  return ctx
}
