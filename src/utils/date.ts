export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

export function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface PregnancyInfo {
  weeks: number
  days: number
  totalDays: number
  trimester: 1 | 2 | 3
  period: string
}

export function getPregnancyInfo(dueDate: string): PregnancyInfo {
  const due = new Date(dueDate)
  const now = new Date()
  // 出産予定日は妊娠40週0日 = 280日目
  const diffMs = due.getTime() - now.getTime()
  const daysUntilDue = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
  const totalDays = Math.max(0, 280 - daysUntilDue)
  const weeks = Math.floor(totalDays / 7)
  const days = totalDays % 7

  let trimester: 1 | 2 | 3 = 1
  if (weeks >= 28) trimester = 3
  else if (weeks >= 16) trimester = 2

  let period = 'early'
  if (weeks <= 15) period = 'early'
  else if (weeks <= 27) period = 'mid'
  else if (weeks <= 36) period = 'late'
  else period = 'final'

  return { weeks, days, totalDays, trimester, period }
}

export interface PostpartumInfo {
  months: number
  days: number
  totalDays: number
  period: string
}

export function getPostpartumInfo(birthDate: string): PostpartumInfo {
  const birth = new Date(birthDate)
  const now = new Date()
  const diffMs = now.getTime() - birth.getTime()
  const totalDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)))
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  const adjustedMonths = Math.max(0, now.getDate() < birth.getDate() ? months - 1 : months)
  const days = totalDays - Math.floor(adjustedMonths * 30.44)

  let period = 'newborn'
  if (adjustedMonths <= 2) period = 'newborn'
  else if (adjustedMonths <= 5) period = 'early'
  else if (adjustedMonths <= 8) period = 'mid'
  else if (adjustedMonths <= 12) period = 'late'
  else period = 'toddler'

  return { months: adjustedMonths, days: Math.max(0, Math.round(days)), totalDays, period }
}

// Legacy compatibility
export function getPregnancyWeeks(dueDate: string): number {
  return getPregnancyInfo(dueDate).weeks
}

export function getPregnancyPeriod(weeks: number): string {
  if (weeks <= 15) return 'early'
  if (weeks <= 27) return 'mid'
  if (weeks <= 36) return 'late'
  return 'final'
}

export function getPostpartumMonths(birthDate: string): number {
  return getPostpartumInfo(birthDate).months
}

export function getPostpartumPeriod(months: number): string {
  if (months <= 2) return 'newborn'
  if (months <= 5) return 'early'
  if (months <= 8) return 'mid'
  if (months <= 12) return 'late'
  return 'toddler'
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Deterministic daily pick based on date
export function pickDaily<T>(arr: T[], dateKey?: string): T {
  const key = dateKey || getTodayKey()
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i)
    hash |= 0
  }
  return arr[Math.abs(hash) % arr.length]
}
