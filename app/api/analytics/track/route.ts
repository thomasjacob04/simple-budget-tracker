import { NextResponse } from "next/server"
import { ANALYTICS_KEYS, redis } from "@/lib/kv"
import { CURRENCIES } from "@/lib/types"

const VALID_CURRENCIES = new Set(CURRENCIES.map((c) => c.code))

export async function POST(request: Request) {
  if (!redis) {
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 501 })
  }

  const body = await request.json().catch(() => null)
  const currency = typeof body?.currency === "string" ? body.currency : null
  const incomeTypes = Array.isArray(body?.incomeTypes)
    ? body.incomeTypes.filter((t: unknown): t is string => typeof t === "string").slice(0, 20)
    : []
  const goalNames = Array.isArray(body?.goalNames)
    ? body.goalNames.filter((t: unknown): t is string => typeof t === "string").slice(0, 20)
    : []

  if (!currency || !VALID_CURRENCIES.has(currency)) {
    return NextResponse.json({ ok: false, error: "invalid currency" }, { status: 400 })
  }

  const ops: Promise<unknown>[] = [
    redis.incr(ANALYTICS_KEYS.sessions),
    redis.hincrby(ANALYTICS_KEYS.currency, currency, 1),
  ]
  for (const type of incomeTypes) {
    const trimmed = type.trim().slice(0, 60)
    if (trimmed) ops.push(redis.hincrby(ANALYTICS_KEYS.income, trimmed, 1))
  }
  for (const name of goalNames) {
    const trimmed = name.trim().slice(0, 60)
    if (trimmed) ops.push(redis.hincrby(ANALYTICS_KEYS.goals, trimmed, 1))
  }
  await Promise.all(ops)

  return NextResponse.json({ ok: true })
}
