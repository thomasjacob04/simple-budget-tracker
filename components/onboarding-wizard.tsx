"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  PiggyBank,
  Wallet,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBudget } from "@/lib/budget-context"
import {
  CURRENCIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_TYPES,
  type Preferences,
} from "@/lib/types"
import { generateId } from "@/lib/storage"
import { ChecklistField, SavingsGoalsField } from "./preference-fields"

const STEPS = [
  { title: "Income sources", icon: TrendingUp, hint: "How does money come in?" },
  { title: "Expense categories", icon: Wallet, hint: "Where does money go?" },
  { title: "Savings goals", icon: PiggyBank, hint: "What are you saving for?" },
  { title: "Currency", icon: Banknote, hint: "What currency do you budget in?" },
]

export function OnboardingWizard() {
  const { completeOnboarding } = useBudget()
  const [step, setStep] = useState(0)

  const [incomeTypes, setIncomeTypes] = useState<string[]>([
    "Salary",
    "Casual",
  ])
  const [expenseCategories, setExpenseCategories] = useState<string[]>([
    ...DEFAULT_EXPENSE_CATEGORIES,
  ])
  const [goalNames, setGoalNames] = useState<string[]>(["Goal #1", "Goal #2"])
  const [currency, setCurrency] = useState("AUD")

  const canContinue =
    (step === 0 && incomeTypes.length > 0) ||
    (step === 1 && expenseCategories.length > 0) ||
    step === 2 ||
    step === 3

  function finish() {
    const savingsGoals = [
      ...goalNames.map((name) => ({
        id: generateId(),
        name: name.trim() || `Goal`,
      })),
      { id: generateId(), name: "Church" },
    ]
    const prefs: Preferences = {
      incomeTypes,
      expenseCategories,
      savingsGoals,
      currency,
    }
    completeOnboarding(prefs)
  }

  const CurrentIcon = STEPS[step].icon

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8 pt-10">
      <header className="mb-6">
        <p className="text-sm font-semibold text-primary">Welcome to Simple Budget</p>
        <h1 className="text-2xl font-bold text-balance">
          Let&apos;s set up your budget
        </h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Everything is stored privately on this device. No account needed.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-2" aria-hidden>
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div className="flex-1">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
            <CurrentIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">{STEPS[step].title}</h2>
            <p className="text-sm text-muted-foreground">{STEPS[step].hint}</p>
          </div>
        </div>

        {step === 0 && (
          <ChecklistField
            options={DEFAULT_INCOME_TYPES}
            selected={incomeTypes}
            onChange={setIncomeTypes}
            addPlaceholder="Add custom income source…"
          />
        )}
        {step === 1 && (
          <ChecklistField
            options={DEFAULT_EXPENSE_CATEGORIES}
            selected={expenseCategories}
            onChange={setExpenseCategories}
            addPlaceholder="Add custom category…"
          />
        )}
        {step === 2 && (
          <SavingsGoalsField names={goalNames} onChange={setGoalNames} />
        )}
        {step === 3 && (
          <div className="flex flex-col gap-1.5">
            <Label className="sr-only" htmlFor="onboarding-currency">
              Currency
            </Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v ?? "AUD")}>
              <SelectTrigger id="onboarding-currency" className="w-full">
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
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            size="lg"
            className="flex-1"
            disabled={!canContinue}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={finish}>
            <Check className="size-4" />
            Start budgeting
          </Button>
        )}
      </div>
    </div>
  )
}
