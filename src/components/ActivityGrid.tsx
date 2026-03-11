import { useState, useCallback } from 'react'
import { activities, categories } from '../data/messages'
import { DayRecord } from '../hooks/useStore'
import { pickRandom } from '../utils/date'
import PraisePopup from './PraisePopup'

interface ActivityGridProps {
  todayRecord: DayRecord
  toggleActivity: (id: string) => void
  incrementPraise: () => void
  showBabyCategory: boolean
}

// SVGアイコン（テラコッタ色のラインアイコン）
const activityIcons: Record<string, (color: string) => JSX.Element> = {
  wakeup: (c) => <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="9" stroke={c} strokeWidth="2"/><path d="M16 7v2M16 23v2M7 16h2M23 16h2M9.5 9.5l1.4 1.4M21.1 21.1l1.4 1.4M9.5 22.5l1.4-1.4M21.1 10.9l1.4-1.4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  change: (c) => <svg viewBox="0 0 32 32" fill="none"><path d="M10 8h12v2l-1 14H11L10 10V8z" stroke={c} strokeWidth="2" strokeLinejoin="round"/><path d="M13 8V6h6v2" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  wash_face: (c) => <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="14" r="8" stroke={c} strokeWidth="2"/><path d="M12.5 12.5a1 1 0 011-1 1 1 0 011 1M17.5 12.5a1 1 0 011-1 1 1 0 011 1M13 17c1.5 1.5 4.5 1.5 6 0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><path d="M10 24c2-1 4-2 6-2s4 1 6 2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  brush_teeth: (c) => <svg viewBox="0 0 32 32" fill="none"><rect x="14" y="6" width="4" height="18" rx="2" stroke={c} strokeWidth="2"/><path d="M12 24h8" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  eat: (c) => <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="18" r="8" stroke={c} strokeWidth="2"/><path d="M16 10V6M13 8h6" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  drink: (c) => <svg viewBox="0 0 32 32" fill="none"><path d="M10 8h12l-2 18H12L10 8z" stroke={c} strokeWidth="2" strokeLinejoin="round"/><path d="M10 14h12" stroke={c} strokeWidth="1.5"/></svg>,
  bath: (c) => <svg viewBox="0 0 32 32" fill="none"><path d="M6 16h20M8 16v6a4 4 0 004 4h8a4 4 0 004-4v-6" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M12 12c0-2 1-4 4-4" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  breastfeed: (c) => <svg viewBox="0 0 32 32" fill="none"><circle cx="14" cy="10" r="4" stroke={c} strokeWidth="2"/><path d="M8 26c0-4 2-7 6-7M18 18a5 5 0 110 10 5 5 0 010-10z" stroke={c} strokeWidth="2"/></svg>,
  diaper: (c) => <svg viewBox="0 0 32 32" fill="none"><path d="M8 12h16v4c0 4-3 8-8 8s-8-4-8-8v-4z" stroke={c} strokeWidth="2"/><path d="M8 12c2-4 6-4 8-4s6 0 8 4" stroke={c} strokeWidth="2"/></svg>,
  hold: (c) => <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="10" r="4" stroke={c} strokeWidth="2"/><path d="M10 26v-6c0-3 2.5-5 6-5s6 2 6 5v6" stroke={c} strokeWidth="2"/><path d="M7 19c-1 1-1 3-1 5" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M25 19c1 1 1 3 1 5" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  put_to_sleep: (c) => <svg viewBox="0 0 32 32" fill="none"><path d="M8 22c2-2 5-3 8-3s6 1 8 3" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M20 8h4l-4 4h4M24 4h3l-3 3h3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  baby_bath: (c) => <svg viewBox="0 0 32 32" fill="none"><path d="M6 16h20M8 16v5a4 4 0 004 4h8a4 4 0 004-4v-5" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="16" cy="11" r="3" stroke={c} strokeWidth="2"/></svg>,
  go_out: (c) => <svg viewBox="0 0 32 32" fill="none"><rect x="8" y="6" width="16" height="20" rx="2" stroke={c} strokeWidth="2"/><path d="M16 16v4M14 20h4" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  shopping: (c) => <svg viewBox="0 0 32 32" fill="none"><path d="M6 8h3l3 14h10l3-10H10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="13" cy="26" r="1.5" fill={c}/><circle cx="21" cy="26" r="1.5" fill={c}/></svg>,
  walk: (c) => <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="8" r="3" stroke={c} strokeWidth="2"/><path d="M13 14l3 6-3 6M19 14l-3 6 3 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  hospital: (c) => <svg viewBox="0 0 32 32" fill="none"><rect x="8" y="6" width="16" height="20" rx="2" stroke={c} strokeWidth="2"/><path d="M16 12v8M12 16h8" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  housework: (c) => <svg viewBox="0 0 32 32" fill="none"><path d="M6 14l10-8 10 8v12a2 2 0 01-2 2H8a2 2 0 01-2-2V14z" stroke={c} strokeWidth="2"/></svg>,
  laundry: (c) => <svg viewBox="0 0 32 32" fill="none"><rect x="8" y="6" width="16" height="20" rx="2" stroke={c} strokeWidth="2"/><circle cx="16" cy="18" r="5" stroke={c} strokeWidth="2"/><circle cx="12" cy="10" r="1" fill={c}/></svg>,
  cook: (c) => <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="20" r="8" stroke={c} strokeWidth="2"/><path d="M16 12V6M13 8h6" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  clean: (c) => <svg viewBox="0 0 32 32" fill="none"><path d="M14 6h4v10l4 10H10l4-10V6z" stroke={c} strokeWidth="2" strokeLinejoin="round"/><path d="M10 26h12" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
}

export default function ActivityGrid({ todayRecord, toggleActivity, incrementPraise, showBabyCategory }: ActivityGridProps) {
  const [popup, setPopup] = useState<string | null>(null)

  const visibleCategories = categories.filter(c => showBabyCategory || c.id !== 'baby')

  const handleTap = useCallback((activityId: string) => {
    const isActive = todayRecord.activities.includes(activityId)
    if (isActive) { toggleActivity(activityId); return }
    const activity = activities.find(a => a.id === activityId)
    if (!activity) return
    toggleActivity(activityId)
    incrementPraise()
    setPopup(pickRandom(activity.praiseMessages))
  }, [todayRecord, toggleActivity, incrementPraise])

  const recordedCount = todayRecord.activities.length

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-b from-ivory-200 to-ivory-50 px-6 pt-8 pb-5">
        <h2 className="text-center text-lg font-bold text-gray-700">今日やったこと</h2>
        <p className="text-center text-xs text-gray-400 mt-1">タップで記録すると褒めるよ</p>
        {recordedCount > 0 && (
          <div className="flex justify-center mt-3">
            <span className="bg-accent-400 text-white text-xs font-bold px-3 py-1 rounded-full">
              {recordedCount}こ 記録中
            </span>
          </div>
        )}
      </div>

      <div className="px-5 pb-8">
        {visibleCategories.map(category => {
          const catActivities = activities.filter(a => a.category === category.id)
          return (
            <div key={category.id} className="mb-5 animate-fade-in-up">
              <div className="flex items-center gap-1.5 mb-3 px-1">
                <span className="text-xs font-bold text-accent-300">{category.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {catActivities.map(activity => {
                  const isActive = todayRecord.activities.includes(activity.id)
                  const iconFn = activityIcons[activity.id]
                  return (
                    <button
                      key={activity.id}
                      onClick={() => handleTap(activity.id)}
                      className={`
                        relative flex flex-col items-center justify-center
                        py-3 px-1.5 rounded-2xl min-h-[76px]
                        transition-all duration-200 active:scale-90
                        ${isActive
                          ? 'bg-accent-400 shadow-card'
                          : 'bg-white shadow-soft border border-ivory-200'
                        }
                      `}
                    >
                      <div className="w-7 h-7 mb-1">
                        {iconFn(isActive ? '#FFFFFF' : '#B07A55')}
                      </div>
                      <span className={`text-[11px] leading-tight text-center font-medium ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`}>
                        {activity.label}
                      </span>
                      {isActive && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#B07A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {popup && (
        <PraisePopup message={popup} onClose={() => setPopup(null)} />
      )}
    </div>
  )
}
