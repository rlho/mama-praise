import { useCallback, useMemo, useState } from 'react'
import { activities, categories } from '../data/messages'
import { DayRecord, CustomActivity } from '../hooks/useStore'

interface ActivityGridProps {
  todayRecord: DayRecord
  toggleActivity: (id: string) => void
  incrementPraise: () => void
  showBabyCategory: boolean
  customActivities: CustomActivity[]
  addCustomActivity: (label: string) => string
  removeCustomActivity: (id: string) => void
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

  const hasBasic = recorded.some(id => ['wakeup', 'breakfast', 'lunch', 'dinner', 'drink', 'sleep', 'bath'].includes(id))
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

function ActivityButton({ id, label, isActive, onTap, onLongPress }: {
  id: string; label: string; isActive: boolean; onTap: () => void; onLongPress?: () => void
}) {
  const longPressRef = useState<ReturnType<typeof setTimeout> | null>(null)

  return (
    <button
      onClick={onTap}
      onTouchStart={onLongPress ? () => {
        const timer = setTimeout(onLongPress, 600)
        longPressRef[1](timer)
      } : undefined}
      onTouchEnd={() => { if (longPressRef[0]) clearTimeout(longPressRef[0]) }}
      onTouchCancel={() => { if (longPressRef[0]) clearTimeout(longPressRef[0]) }}
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
        {label}
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
}

export default function ActivityGrid({ todayRecord, toggleActivity, incrementPraise, showBabyCategory, customActivities, addCustomActivity, removeCustomActivity }: ActivityGridProps) {
  const visibleCategories = categories.filter(c => showBabyCategory || c.id !== 'baby')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')

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

  const handleAdd = () => {
    const label = newLabel.trim()
    if (!label) return
    addCustomActivity(label)
    setNewLabel('')
    setShowAddForm(false)
  }

  const handleRemove = (id: string, label: string) => {
    if (confirm(`「${label}」を削除する？`)) {
      removeCustomActivity(id)
    }
  }

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
                {catActivities.map(activity => (
                  <ActivityButton
                    key={activity.id}
                    id={activity.id}
                    label={activity.label}
                    isActive={todayRecord.activities.includes(activity.id)}
                    onTap={() => handleTap(activity.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* カスタム項目 */}
        {customActivities.length > 0 && (
          <div className="mb-5 animate-fade-in-up">
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <span className="text-xs font-bold text-accent-300">じぶんの項目</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {customActivities.map(ca => (
                <ActivityButton
                  key={ca.id}
                  id={ca.id}
                  label={ca.label}
                  isActive={todayRecord.activities.includes(ca.id)}
                  onTap={() => handleTap(ca.id)}
                  onLongPress={() => handleRemove(ca.id, ca.label)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 追加ボタン / フォーム */}
        {showAddForm ? (
          <div className="bg-white rounded-2xl p-4 shadow-card border border-ivory-200 animate-fade-in-up">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="例: ストレッチした"
              maxLength={15}
              className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-sm focus:outline-none focus:border-accent-300 bg-white mb-3"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newLabel.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-accent-400 text-white active:scale-95 transition-all disabled:opacity-50"
              >
                追加
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewLabel('') }}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-ivory-100 text-gray-500 active:scale-95 transition-all"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-ivory-300 text-sm text-gray-400 font-medium active:scale-95 transition-all"
          >
            + 項目を追加する
          </button>
        )}
      </div>
    </div>
  )
}
