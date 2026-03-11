import { useState, useCallback, useEffect, useRef } from 'react'
import { getTodayKey } from '../utils/date'
import { fetchProfile, upsertProfile, fetchAllRecords, upsertDayRecord } from '../lib/supabase'

export interface UserProfile {
  status: 'pregnant' | 'postpartum' | 'skipped'
  dueDate?: string      // for pregnant
  birthDate?: string    // for postpartum
  onboardingDone: boolean
}

export interface DayRecord {
  activities: string[]   // activity IDs
  praiseCount: number
}

export type Records = Record<string, DayRecord>

const PROFILE_KEY = 'mama-praise-profile'
const RECORDS_KEY = 'mama-praise-records'

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

const defaultProfile: UserProfile = {
  status: 'skipped',
  onboardingDone: false,
}

export function useStore(userId?: string | null) {
  const [profile, setProfileState] = useState<UserProfile>(() =>
    loadJSON(PROFILE_KEY, defaultProfile)
  )
  const [records, setRecordsState] = useState<Records>(() =>
    loadJSON(RECORDS_KEY, {} as Records)
  )
  const syncedRef = useRef(false)

  // Supabase初回同期: ログイン済みなら読み込み
  useEffect(() => {
    if (!userId || syncedRef.current) return
    syncedRef.current = true

    fetchProfile(userId).then(remote => {
      if (remote) {
        setProfileState(remote)
        saveJSON(PROFILE_KEY, remote)
      } else {
        // ローカルのプロフィールをSupabaseに保存
        const local = loadJSON(PROFILE_KEY, defaultProfile)
        if (local.onboardingDone) {
          upsertProfile(userId, local)
        }
      }
    })

    fetchAllRecords(userId).then(remote => {
      if (Object.keys(remote).length > 0) {
        setRecordsState(prev => {
          const merged = { ...prev, ...remote }
          saveJSON(RECORDS_KEY, merged)
          return merged
        })
      } else {
        // ローカルのレコードをSupabaseに保存
        const local = loadJSON(RECORDS_KEY, {} as Records)
        for (const [key, rec] of Object.entries(local)) {
          upsertDayRecord(userId, key, rec)
        }
      }
    })
  }, [userId])

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p)
    saveJSON(PROFILE_KEY, p)
    if (userId) upsertProfile(userId, p)
  }, [userId])

  const setRecords = useCallback((r: Records) => {
    setRecordsState(r)
    saveJSON(RECORDS_KEY, r)
  }, [userId])

  const todayKey = getTodayKey()

  const todayRecord: DayRecord = records[todayKey] || { activities: [], praiseCount: 0 }

  const toggleActivity = useCallback((activityId: string) => {
    setRecordsState(prev => {
      const key = getTodayKey()
      const current = prev[key] || { activities: [], praiseCount: 0 }
      const has = current.activities.includes(activityId)
      const newActivities = has
        ? current.activities.filter(a => a !== activityId)
        : [...current.activities, activityId]
      const newRecord: DayRecord = {
        activities: newActivities,
        praiseCount: has ? current.praiseCount : current.praiseCount + 1,
      }
      const newRecords = { ...prev, [key]: newRecord }
      saveJSON(RECORDS_KEY, newRecords)
      if (userId) upsertDayRecord(userId, key, newRecord)
      return newRecords
    })
  }, [userId])

  const incrementPraise = useCallback(() => {
    setRecordsState(prev => {
      const key = getTodayKey()
      const current = prev[key] || { activities: [], praiseCount: 0 }
      const newRecord = { ...current, praiseCount: current.praiseCount + 1 }
      const newRecords = { ...prev, [key]: newRecord }
      saveJSON(RECORDS_KEY, newRecords)
      if (userId) upsertDayRecord(userId, key, newRecord)
      return newRecords
    })
  }, [userId])

  const getRecordForDay = useCallback((dateKey: string): DayRecord | null => {
    return records[dateKey] || null
  }, [records])

  // Increment praise on first visit of the day (for the greeting)
  useEffect(() => {
    const visitedKey = `mama-praise-visited-${todayKey}`
    if (!localStorage.getItem(visitedKey)) {
      localStorage.setItem(visitedKey, '1')
      incrementPraise()
    }
  }, [todayKey, incrementPraise])

  return {
    profile,
    setProfile,
    records,
    todayRecord,
    toggleActivity,
    incrementPraise,
    getRecordForDay,
  }
}
