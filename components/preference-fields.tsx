"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

/**
 * A checklist of options with the ability to add custom values.
 * `selected` is the source of truth. Predefined options render as toggleable
 * checkboxes; custom additions render as removable chips-in-list.
 */
export function ChecklistField({
  options,
  selected,
  onChange,
  addPlaceholder = "Add custom…",
}: {
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
  addPlaceholder?: string
}) {
  const [custom, setCustom] = useState("")

  const allOptions = Array.from(new Set([...options, ...selected]))

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  function addCustom() {
    const value = custom.trim()
    if (!value) return
    if (!selected.includes(value)) onChange([...selected, value])
    setCustom("")
  }

  const isPredefined = (v: string) => options.includes(v)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {allOptions.map((option) => {
          const checked = selected.includes(option)
          return (
            <label
              key={option}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/60 transition-colors"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(option)}
              />
              <span className="flex-1 text-sm font-medium">{option}</span>
              {!isPredefined(option) && (
                <button
                  type="button"
                  aria-label={`Remove ${option}`}
                  onClick={(e) => {
                    e.preventDefault()
                    onChange(selected.filter((v) => v !== option))
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={custom}
          placeholder={addPlaceholder}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault()
              addCustom()
            }
          }}
        />
        <Button type="button" variant="secondary" size="icon" onClick={addCustom}>
          <Plus className="size-4" />
          <span className="sr-only">Add</span>
        </Button>
      </div>
    </div>
  )
}

/**
 * Editor for the two renameable savings goals. The fixed "Church" goal is
 * managed by the caller and not shown here.
 */
export function SavingsGoalsField({
  names,
  onChange,
}: {
  names: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {names.map((name, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Label htmlFor={`goal-${i}`}>Goal #{i + 1}</Label>
          <Input
            id={`goal-${i}`}
            value={name}
            onChange={(e) => {
              const next = [...names]
              next[i] = e.target.value
              onChange(next)
            }}
          />
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3">
        <span className="text-sm font-medium">Church</span>
        <span className="ml-auto text-xs text-muted-foreground">
          Fixed savings category
        </span>
      </div>
    </div>
  )
}
