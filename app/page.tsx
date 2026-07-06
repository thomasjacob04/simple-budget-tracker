import { BudgetProvider } from "@/lib/budget-context"
import { BudgetApp } from "@/components/budget-app"
import { Analytics } from "@vercel/analytics/next"

export default function Page() {
  return (
    <BudgetProvider>
      <BudgetApp />
    </BudgetProvider>
  )
}
