import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- DB helpers ---

import type { UserProfile } from '../hooks/useStore'
import type { DayRecord } from '../hooks/useStore'

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return {
    status: data.status,
    dueDate: data.due_date || undefined,
    birthDate: data.birth_date || undefined,
    onboardingDone: data.onboarding_done,
  }
}

export async function upsertProfile(userId: string, profile: UserProfile) {
  await supabase.from('profiles').upsert({
    id: userId,
    status: profile.status,
    due_date: profile.dueDate || null,
    birth_date: profile.birthDate || null,
    onboarding_done: profile.onboardingDone,
    updated_at: new Date().toISOString(),
  })
}

export async function fetchAllRecords(userId: string): Promise<Record<string, DayRecord>> {
  const { data, error } = await supabase
    .from('day_records')
    .select('*')
    .eq('user_id', userId)

  if (error || !data) return {}
  const records: Record<string, DayRecord> = {}
  for (const row of data) {
    records[row.date_key] = {
      activities: row.activities || [],
      praiseCount: row.praise_count || 0,
    }
  }
  return records
}

export async function upsertDayRecord(userId: string, dateKey: string, record: DayRecord) {
  await supabase.from('day_records').upsert({
    user_id: userId,
    date_key: dateKey,
    activities: record.activities,
    praise_count: record.praiseCount,
    updated_at: new Date().toISOString(),
  })
}
