"use client"

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatCurrency } from "@/lib/format"

const COLORS = {
  income: "var(--chart-1)",
  expense: "var(--chart-2)",
  saving: "var(--chart-3)",
}

function ChartTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean
  payload?: Array<{ payload: { name: string; value: number } }>
  currency: string
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">
        {formatCurrency(item.value, currency)}
      </p>
    </div>
  )
}

export function SummaryChart({
  income,
  expenses,
  savings,
  currency,
}: {
  income: number
  expenses: number
  savings: number
  currency: string
}) {
  const data = [
    { name: "Income", value: income, fill: COLORS.income },
    { name: "Expenses", value: expenses, fill: COLORS.expense },
    { name: "Savings", value: savings, fill: COLORS.saving },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "var(--accent)", opacity: 0.4 }}
          content={<ChartTooltip currency={currency} />}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CategoryChart({
  data,
  currency,
}: {
  data: Array<{ name: string; value: number }>
  currency: string
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={104}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          cursor={{ fill: "var(--accent)", opacity: 0.4 }}
          content={<ChartTooltip currency={currency} />}
        />
        <Bar
          dataKey="value"
          radius={[0, 6, 6, 0]}
          fill="var(--chart-2)"
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
