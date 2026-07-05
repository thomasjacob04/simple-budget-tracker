import { BudgetProvider } from "@/lib/budget-context"
import { BudgetApp } from "@/components/budget-app"

export default function Page() {
  return (
    <BudgetProvider>
      <BudgetApp />
    </BudgetProvider>
  )
}
