"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Download, Upload, RotateCcw, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useBudget } from "@/lib/budget-context"
import {
  CURRENCIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_TYPES,
  type BudgetData,
  type Preferences,
} from "@/lib/types"
import { generateId } from "@/lib/storage"
import { ChecklistField, SavingsGoalsField } from "./preference-fields"

export function SettingsView() {
  const { preferences, updatePreferences, exportData, importData, resetAll } =
    useBudget()
  const fileRef = useRef<HTMLInputElement>(null)
  const [resetOpen, setResetOpen] = useState(false)

  const [incomeTypes, setIncomeTypes] = useState<string[]>(
    preferences?.incomeTypes ?? [],
  )
  const [expenseCategories, setExpenseCategories] = useState<string[]>(
    preferences?.expenseCategories ?? [],
  )
  const churchGoal =
    preferences?.savingsGoals.find((g) => g.name === "Church") ?? {
      id: generateId(),
      name: "Church",
    }
  const [goalNames, setGoalNames] = useState<string[]>(
    (preferences?.savingsGoals.filter((g) => g.name !== "Church") ?? []).map(
      (g) => g.name,
    ),
  )
  const [currency, setCurrency] = useState(preferences?.currency ?? "USD")

  function savePreferences() {
    const editableGoals = goalNames.map((name, i) => ({
      id: preferences?.savingsGoals[i]?.id ?? generateId(),
      name: name.trim() || `Goal #${i + 1}`,
    }))
    const next: Preferences = {
      incomeTypes,
      expenseCategories,
      savingsGoals: [...editableGoals, churchGoal],
      currency,
    }
    updatePreferences(next)
    toast.success("Settings saved")
  }

  function handleExport() {
    const data = exportData()
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simple-budget-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Backup downloaded")
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as BudgetData
        if (!parsed.preferences || !Array.isArray(parsed.entries)) {
          throw new Error("Invalid file")
        }
        importData(parsed)
        toast.success("Data restored")
      } catch {
        toast.error("Could not read that backup file")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-28 pt-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Your data stays on this device.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ChecklistField
              options={DEFAULT_INCOME_TYPES}
              selected={incomeTypes}
              onChange={setIncomeTypes}
              addPlaceholder="Add custom income source…"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ChecklistField
              options={DEFAULT_EXPENSE_CATEGORIES}
              selected={expenseCategories}
              onChange={setExpenseCategories}
              addPlaceholder="Add custom category…"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Savings goals</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsGoalsField names={goalNames} onChange={setGoalNames} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="sr-only" htmlFor="currency">
              Currency
            </Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v ?? "USD")}>
              <SelectTrigger id="currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.label} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button size="lg" onClick={savePreferences}>
          <Save className="size-4" />
          Save settings
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Backup &amp; restore</CardTitle>
            <CardDescription>
              Export your data to a file, or restore from a previous backup.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4" />
              Export data (.json)
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" />
              Restore from file
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
            />
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => setResetOpen(true)}
        >
          <RotateCcw className="size-4" />
          Reset all data
        </Button>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset all data?</DialogTitle>
            <DialogDescription>
              This permanently deletes all entries and preferences on this
              device. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetAll()
                setResetOpen(false)
                toast.success("All data cleared")
              }}
            >
              Reset everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
