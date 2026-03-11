import { useState, useCallback, useMemo } from 'react'
import { activities, categories } from '../data/messages'
import { DayRecord } from '../hooks/useStore'
import { pickRandom } from '../utils/date'

interface ActivityGridProps {
  todayRecord: DayRecord
  toggleActivity: (id: string) => void
  incrementPraise: () => void
  showBabyCategory: boolean
}

// 共通のかわいい花アイコン
function FlowerIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none">
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const cx = 16 + Math.cos(rad) * 6
        const cy = 16 + Math.sin(rad) * 6
        return <circle key={i} cx={cx} cy={cy} r="5" fill={color} opacity="0.35" />
      })}
      <circle cx="16" cy="16" r="4" fill={color} opacity="0.7" />
    </svg>
  )
}

export default function ActivityGrid({ todayRecord, toggleActivity, incrementPraise, showBabyCategory }: ActivityGridProps) {
  const [praiseMessages, setPraiseMessages] = useState<Record<string, string>>({})

  const visibleCategories = categories.filter(c => showBabyCategory || c.id !== 'baby')

  // 記録済みアクティビティの褒めメッセージ（初回ロード用）
  const initialMessages = useMemo(() => {
    const msgs: Record<string, string> = {}
    for (const id of todayRecord.activities) {
      if (!praiseMessages[id]) {
        const activity = activities.find(a => a.id === id)
        if (activity) msgs[id] = pickRandom(activity.praiseMessages)
      }
    }
    return msgs
  }, [todayRecord.activities])

  const allMessages = { ...initialMessages, ...praiseMessages }

  // 記録済みのアクティビティ（メッセージ付き）を順番に
  const recordedWithMessages = todayRecord.activities
    .map(id => {
      const activity = activities.find(a => a.id === id)
      return activity ? { activity, message: allMessages[id] || '' } : null
    })
    .filter(Boolean) as { activity: typeof activities[0]; message: string }[]

  const handleTap = useCallback((activityId: string) => {
    const isActive = todayRecord.activities.includes(activityId)
    if (isActive) {
      toggleActivity(activityId)
      setPraiseMessages(prev => {
        const next = { ...prev }
        delete next[activityId]
        return next
      })
      return
    }
    const activity = activities.find(a => a.id === activityId)
    if (!activity) return
    toggleActivity(activityId)
    incrementPraise()
    setPraiseMessages(prev => ({
      ...prev,
      [activityId]: pickRandom(activity.praiseMessages),
    }))
  }, [todayRecord, toggleActivity, incrementPraise])

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-b from-ivory-200 to-ivory-50 px-6 pt-8 pb-5">
        <h2 className="text-center text-lg font-bold text-gray-700">今日やったこと</h2>
      </div>

      <div className="px-5 pb-8">
        {/* 褒めメッセージをトップに表示 */}
        {recordedWithMessages.length > 0 && (
          <div className="mb-5 space-y-2 animate-fade-in-up">
            {recordedWithMessages.map(({ activity, message }) => (
              <div
                key={`msg-${activity.id}`}
                className="bg-accent-50 rounded-xl px-4 py-3 border border-accent-100 animate-fade-in-up"
              >
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                    <FlowerIcon color="#B07A55" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-accent-400">{activity.label}</span>
                    <p className="text-sm text-gray-600 leading-relaxed mt-0.5">{message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {visibleCategories.map(category => {
          const catActivities = activities.filter(a => a.category === category.id)
          return (
            <div key={category.id} className="mb-5 animate-fade-in-up">
              {category.label && (
                <div className="flex items-center gap-1.5 mb-3 px-1">
                  <span className="text-xs font-bold text-accent-300">{category.label}</span>
                </div>
              )}
              <div className="grid grid-cols-4 gap-2.5">
                {catActivities.map(activity => {
                  const isActive = todayRecord.activities.includes(activity.id)
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
                        <FlowerIcon color={isActive ? '#FFFFFF' : '#B07A55'} />
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
    </div>
  )
}
