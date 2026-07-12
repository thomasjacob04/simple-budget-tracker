import type { Metadata } from "next"
import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ANALYTICS_KEYS, redis } from "@/lib/kv"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

function BarList({ data }: { data: Array<[string, number]> }) {
  const max = Math.max(1, ...data.map(([, count]) => count))
  return (
    <div className="flex flex-col gap-2.5">
      {data.map(([label, count]) => (
        <div key={label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">{count}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function AnalyticsPage() {
  if (!redis) {
    return (
      <div className="mx-auto w-full max-w-md px-5 pb-28 pt-8">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Analytics</h1>
        </header>
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No Redis store is configured. Add a Redis integration (e.g. Upstash)
            from the Vercel Marketplace to your project, then redeploy.
          </CardContent>
        </Card>
      </div>
    )
  }

  const [sessionsRaw, currencyCounts, incomeCounts, goalCounts] = await Promise.all([
    redis.get(ANALYTICS_KEYS.sessions),
    redis.hgetall(ANALYTICS_KEYS.currency),
    redis.hgetall(ANALYTICS_KEYS.income),
    redis.hgetall(ANALYTICS_KEYS.goals),
  ])
  const sessions = sessionsRaw ? Number(sessionsRaw) : 0

  const toSortedEntries = (counts: Record<string, string>) =>
    Object.entries(counts)
      .map(([label, count]): [string, number] => [label, Number(count)])
      .sort((a, b) => b[1] - a[1])

  const currencyData = toSortedEntries(currencyCounts)
  const incomeData = toSortedEntries(incomeCounts)
  const goalData = toSortedEntries(goalCounts)

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-28 pt-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Aggregate usage across everyone who has set up the app.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" />
              People set up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sessions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currency preferences</CardTitle>
          </CardHeader>
          <CardContent>
            {currencyData.length > 0 ? (
              <BarList data={currencyData} />
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income sources selected</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeData.length > 0 ? (
              <BarList data={incomeData} />
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Savings goal names</CardTitle>
          </CardHeader>
          <CardContent>
            {goalData.length > 0 ? (
              <BarList data={goalData} />
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
