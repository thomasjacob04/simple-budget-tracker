"use client"

import { useMemo, useState } from "react"
import { Minus, PiggyBank, Plus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBudget } from "@/lib/budget-context"
import type { EntryKind } from "@/lib/types"
import { formatCurrency, isSameMonth, monthLabel } from "@/lib/format"
import { EntryDialog } from "./entry-dialog"
import { CategoryChart, SummaryChart } from "./budget-charts"

export function DashboardView() {
  const { entries, preferences } = useBudget()
  const [dialogKind, setDialogKind] = useState<EntryKind | null>(null)
  const currency = preferences?.currency ?? "USD"
  const now = useMemo(() => new Date(), [])

  const stats = useMemo(() => {
    const monthEntries = entries.filter((e) => isSameMonth(e.date, now))
    const sum = (kind: EntryKind) =>
      monthEntries
        .filter((e) => e.kind === kind)
        .reduce((acc, e) => acc + e.amount, 0)

    const income = sum("income")
    const expenses = sum("expense")
    const savings = sum("saving")

    const byCategory = new Map<string, number>()
    for (const e of monthEntries) {
      if (e.kind !== "expense") continue
      byCategory.set(e.type, (byCategory.get(e.type) ?? 0) + e.amount)
    }
    const categoryData = Array.from(byCategory.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return { income, expenses, savings, categoryData, count: monthEntries.length }
  }, [entries, now])

  const available = stats.income - stats.expenses

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-28 pt-8">
      <header className="mb-5">
        <p className="text-sm text-muted-foreground">{monthLabel(now)}</p>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Button
          size="lg"
          className="h-14 justify-start gap-2 text-base"
          onClick={() => setDialogKind("income")}
        >
          <Plus className="size-5" />
          Add Income
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-14 justify-start gap-2 text-base"
          onClick={() => setDialogKind("expense")}
        >
          <Minus className="size-5" />
          Add Expense
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="col-span-2 h-12 justify-center gap-2 text-base"
          onClick={() => setDialogKind("saving")}
        >
          <PiggyBank className="size-5" />
          Add Saving
        </Button>
      </div>

      <Card className="mb-4 border-primary/20 bg-accent/40">
        <CardContent className="flex items-center gap-3 py-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <TrendingUp className="size-5" />
          </div>
          <div>
            {available > 0 ? (
              <p className="text-pretty leading-snug">
                You have{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(available, currency)}
                </span>{" "}
                available to put into savings this month.
              </p>
            ) : available === 0 ? (
              <p className="text-pretty leading-snug text-muted-foreground">
                Income and expenses are even this month. Nothing extra to save
                yet.
              </p>
            ) : (
              <p className="text-pretty leading-snug text-muted-foreground">
                Your expenses exceed income by{" "}
                <span className="font-semibold text-destructive">
                  {formatCurrency(Math.abs(available), currency)}
                </span>{" "}
                this month. Consider trimming spending.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">This month</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.count === 0 ? (
            <EmptyState />
          ) : (
            <>
              <SummaryChart
                income={stats.income}
                expenses={stats.expenses}
                savings={stats.savings}
                currency={currency}
              />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Income" value={formatCurrency(stats.income, currency)} tone="income" />
                <Stat label="Expenses" value={formatCurrency(stats.expenses, currency)} tone="expense" />
                <Stat label="Savings" value={formatCurrency(stats.savings, currency)} tone="saving" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {stats.categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={stats.categoryData} currency={currency} />
          </CardContent>
        </Card>
      )}

      <EntryDialog
        kind={dialogKind ?? "income"}
        open={dialogKind !== null}
        onOpenChange={(open) => !open && setDialogKind(null)}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "income" | "expense" | "saving"
}) {
  const dot =
    tone === "income"
      ? "bg-chart-1"
      : tone === "expense"
        ? "bg-chart-2"
        : "bg-chart-3"
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-2">
      <div className="flex items-center justify-center gap-1.5">
        <span className={`size-2 rounded-full ${dot}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <PiggyBank className="size-6" />
      </div>
      <p className="font-medium">No entries yet this month</p>
      <p className="text-sm text-muted-foreground text-pretty">
        Add your first income or expense using the buttons above to see your
        summary.
      </p>
    </div>
  )
}
