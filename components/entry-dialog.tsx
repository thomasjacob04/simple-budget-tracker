"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBudget } from "@/lib/budget-context"
import type { Entry, EntryKind } from "@/lib/types"
import { currencySymbol, todayISO } from "@/lib/format"

const KIND_META: Record<EntryKind, { title: string; typeLabel: string }> = {
  income: { title: "Add Income", typeLabel: "Source" },
  expense: { title: "Add Expense", typeLabel: "Category" },
  saving: { title: "Add Saving", typeLabel: "Goal" },
}

export function EntryDialog({
  kind,
  open,
  onOpenChange,
  editing,
}: {
  kind: EntryKind
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Entry | null
}) {
  const { preferences, addEntry, updateEntry } = useBudget()
  const [amount, setAmount] = useState("")
  const [type, setType] = useState("")
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState("")

  const options =
    kind === "income"
      ? (preferences?.incomeTypes ?? [])
      : kind === "expense"
        ? (preferences?.expenseCategories ?? [])
        : (preferences?.savingsGoals.map((g) => g.name) ?? [])

  useEffect(() => {
    if (!open) return
    if (editing) {
      setAmount(String(editing.amount))
      setType(editing.type)
      setDate(editing.date)
      setNote(editing.note ?? "")
    } else {
      setAmount("")
      setType(options[0] ?? "")
      setDate(todayISO())
      setNote("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing])

  const meta = KIND_META[kind]
  const symbol = currencySymbol(preferences?.currency ?? "USD")

  function submit() {
    const parsed = Number.parseFloat(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter an amount greater than 0")
      return
    }
    if (!type) {
      toast.error(`Choose a ${meta.typeLabel.toLowerCase()}`)
      return
    }
    const payload = {
      kind,
      type,
      amount: Math.round(parsed * 100) / 100,
      date,
      note: note.trim() || undefined,
    }
    if (editing) {
      updateEntry({ ...payload, id: editing.id })
      toast.success("Entry updated")
    } else {
      addEntry(payload)
      toast.success(`${meta.title.replace("Add ", "")} added`)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit entry" : meta.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="amount"
                inputMode="decimal"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-7 text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{meta.typeLabel}</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${meta.typeLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              rows={2}
              placeholder="Add a note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
