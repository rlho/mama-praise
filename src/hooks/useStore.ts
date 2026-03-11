import { useState, useCallback, useEffect } from 'react'
import { getTodayKey } from '../utils/date'

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

export function useStore() {
  const [profile, setProfileState] = useState<UserProfile>(() =>
    loadJSON(PROFILE_KEY, defaultProfile)
  )
  const [records, setRecordsState] = useState<Records>(() =>
    loadJSON(RECORDS_KEY, {} as Records)
  )

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p)
    saveJSON(PROFILE_KEY, p)
  }, [])

  const setRecords = useCallback((r: Records) => {
    setRecordsState(r)
    saveJSON(RECORDS_KEY, r)
  }, [])

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
      return newRecords
    })
  }, [])

  const incrementPraise = useCallback(() => {
    setRecordsState(prev => {
      const key = getTodayKey()
      const current = prev[key] || { activities: [], praiseCount: 0 }
      const newRecord = { ...current, praiseCount: current.praiseCount + 1 }
      const newRecords = { ...prev, [key]: newRecord }
      saveJSON(RECORDS_KEY, newRecords)
      return newRecords
    })
  }, [])

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
