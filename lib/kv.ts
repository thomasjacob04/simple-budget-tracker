import Redis from "ioredis"

export const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null

export const ANALYTICS_KEYS = {
  sessions: "analytics:sessions",
  currency: "analytics:currency",
  income: "analytics:income",
  goals: "analytics:goals",
}
