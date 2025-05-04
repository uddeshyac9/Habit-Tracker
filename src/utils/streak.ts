import { differenceInCalendarDays } from "date-fns"

export type CheckinsMap = Record<string, boolean> // '2025-05-04': true

export function getCurrentStreak(checkins: CheckinsMap): number {
  let streak = 0
  const date = new Date()
  while (true) {
    const key = date.toISOString().slice(0, 10)
    if (checkins[key]) {
      streak++
      date.setDate(date.getDate() - 1)
    } else break
  }
  return streak
}

export function getLongestStreak(checkins: CheckinsMap): number {
  const dates = Object.keys(checkins)
    .filter((k) => checkins[k])
    .sort()
  let best = 0,
    cur = 0
  for (let i = 0; i < dates.length; i++) {
    if (i === 0 || differenceInCalendarDays(new Date(dates[i]), new Date(dates[i - 1])) === 1) {
      cur++
    } else cur = 1
    best = Math.max(best, cur)
  }
  return best
}
