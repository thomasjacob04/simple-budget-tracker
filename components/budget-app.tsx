"use client"

import { useState } from "react"
import { useBudget } from "@/lib/budget-context"
import { OnboardingWizard } from "./onboarding-wizard"
import { DashboardView } from "./dashboard-view"
import { EntriesView } from "./entries-view"
import { SettingsView } from "./settings-view"
import { BottomNav, type TabId } from "./bottom-nav"

export function BudgetApp() {
  const { hydrated, onboarded } = useBudget()
  const [tab, setTab] = useState<TabId>("dashboard")

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (!onboarded) {
    return <OnboardingWizard />
  }

  return (
    <div className="min-h-dvh">
      <main>
        {tab === "dashboard" && <DashboardView />}
        {tab === "entries" && <EntriesView />}
        {tab === "settings" && <SettingsView />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
