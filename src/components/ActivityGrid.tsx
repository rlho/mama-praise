import { useCallback, useMemo } from 'react'
import { activities, categories } from '../data/messages'
import { DayRecord } from '../hooks/useStore'

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

// 記録数に応じた総合メッセージ
function getSummaryMessage(recorded: string[]): string | null {
  const count = recorded.length
  if (count === 0) return null

  const hasBasic = recorded.some(id => ['wakeup', 'eat', 'drink', 'sleep', 'bath'].includes(id))
  const hasBaby = recorded.some(id => ['breastfeed', 'diaper', 'hold', 'put_to_sleep', 'baby_bath', 'milk', 'baby_food', 'night_cry', 'soothe', 'play', 'read_book'].includes(id))
  const hasHousework = recorded.some(id => ['housework', 'laundry', 'cook', 'dishes', 'clean'].includes(id))

  if (count >= 8) return 'こんなにたくさん…！今日のあなた、本当にすごいよ。ちゃんと休んでね'
  if (hasBaby && hasHousework) return '赤ちゃんのお世話もおうちのことも。全部やってるの、すごすぎるよ'
  if (hasBaby && hasBasic) return '赤ちゃんのことも自分のことも気にかけられてる。えらいよ'
  if (hasBaby && count >= 3) return '赤ちゃんのお世話おつかれさま。あなたがいるから赤ちゃんは安心だよ'
  if (hasHousework && count >= 3) return 'おうちのことまでやってるの、頑張りすぎてない？十分すごいよ'
  if (count >= 5) return '今日はたくさんできたね。自分のこと、ちゃんと褒めてあげて'
  if (count >= 3) return 'ひとつひとつ、ちゃんとやったんだね。おつかれさま'
  if (count === 2) return 'ふたつもできたね。それだけで十分だよ'
  return 'ひとつ記録できたね。それだけで今日は花マルだよ'
}

export default function ActivityGrid({ todayRecord, toggleActivity, incrementPraise, showBabyCategory }: ActivityGridProps) {
  const visibleCategories = categories.filter(c => showBabyCategory || c.id !== 'baby')

  const summaryMessage = useMemo(
    () => getSummaryMessage(todayRecord.activities),
    [todayRecord.activities]
  )

  const handleTap = useCallback((activityId: string) => {
    const isActive = todayRecord.activities.includes(activityId)
    if (isActive) { toggleActivity(activityId); return }
    toggleActivity(activityId)
    incrementPraise()
  }, [todayRecord, toggleActivity, incrementPraise])

  return (
    <div className="animate-fade-in">
      <div className="px-5 pb-8 pt-2">
        {/* 総合褒めメッセージ */}
        {summaryMessage && (
          <div className="mb-5 bg-accent-50 rounded-2xl px-5 py-4 border border-accent-100 animate-fade-in-up">
            <p className="text-sm text-gray-700 leading-relaxed text-center">{summaryMessage}</p>
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
