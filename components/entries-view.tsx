"use client"

import { useMemo, useState } from "react"
import { Pencil, Trash2, Inbox } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useBudget } from "@/lib/budget-context"
import type { Entry, EntryKind } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/format"
import { EntryDialog } from "./entry-dialog"

type Filter = EntryKind | "all"

const KIND_COLORS: Record<EntryKind, string> = {
  income: "text-chart-1",
  expense: "text-chart-2",
  saving: "text-chart-3",
}

export function EntriesView() {
  const { entries, preferences, deleteEntry } = useBudget()
  const currency = preferences?.currency ?? "USD"
  const [filter, setFilter] = useState<Filter>("all")
  const [subType, setSubType] = useState<string>("all")
  const [editing, setEditing] = useState<Entry | null>(null)

  const subOptions = useMemo(() => {
    if (filter === "income") return preferences?.incomeTypes ?? []
    if (filter === "expense") return preferences?.expenseCategories ?? []
    if (filter === "saving")
      return preferences?.savingsGoals.map((g) => g.name) ?? []
    return []
  }, [filter, preferences])

  const filtered = useMemo(() => {
    return entries
      .filter((e) => (filter === "all" ? true : e.kind === filter))
      .filter((e) => (subType === "all" ? true : e.type === subType))
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }, [entries, filter, subType])

  const total = filtered.reduce((acc, e) => acc + e.amount, 0)

  function changeFilter(f: Filter) {
    setFilter(f)
    setSubType("all")
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-28 pt-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Entries</h1>
      </header>

      <Tabs value={filter} onValueChange={(v) => changeFilter(v as Filter)}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="income" className="flex-1">
            Income
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex-1">
            Expense
          </TabsTrigger>
          <TabsTrigger value="saving" className="flex-1">
            Saving
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filter !== "all" && subOptions.length > 0 && (
        <div className="mt-3">
          <Select value={subType} onValueChange={(v) => setSubType(v ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {subOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/60 px-4 py-2.5">
        <span className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
        <span className="font-semibold tabular-nums">
          {formatCurrency(total, currency)}
        </span>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {filtered.length === 0 && (
          <li className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="size-5" />
            </div>
            <p className="font-medium">No entries here yet</p>
            <p className="px-6 text-sm text-muted-foreground text-pretty">
              Add entries from the Dashboard to see them listed here.
            </p>
          </li>
        )}
        {filtered.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{entry.type}</span>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wide ${KIND_COLORS[entry.kind]}`}
                >
                  {entry.kind}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(entry.date)}
                {entry.note ? ` · ${entry.note}` : ""}
              </p>
            </div>
            <span
              className={`shrink-0 font-semibold tabular-nums ${
                entry.kind === "expense" ? "text-destructive" : "text-foreground"
              }`}
            >
              {entry.kind === "expense" ? "-" : "+"}
              {formatCurrency(entry.amount, currency)}
            </span>
            <div className="flex shrink-0 items-center">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit entry"
                onClick={() => setEditing(entry)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete entry"
                onClick={() => deleteEntry(entry.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <EntryDialog
          kind={editing.kind}
          editing={editing}
          open={editing !== null}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
    </div>
  )
}
