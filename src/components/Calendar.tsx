import { useState, useMemo } from 'react'
import { Records, DayRecord } from '../hooks/useStore'
import { getDaysInMonth, getFirstDayOfMonth, getTodayKey } from '../utils/date'
import { activities } from '../data/messages'

interface CalendarProps {
  records: Records
  getRecordForDay: (key: string) => DayRecord | null
}

const dayLabels = ['日', '月', '火', '水', '木', '金', '土']

// ミニアイコン（カレンダー詳細用）
function ActivityIcon({ id }: { id: string }) {
  return (
    <div className="w-7 h-7 rounded-full bg-ivory-100 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round">
        <path d="M3 8l4 4 6-6" />
      </svg>
    </div>
  )
}

export default function Calendar({ records, getRecordForDay }: CalendarProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const todayKey = getTodayKey()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const days = useMemo(() => {
    const result: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    return result
  }, [daysInMonth, firstDay])

  const getDayKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const selectedRecord = selectedDay ? getRecordForDay(selectedDay) : null
  const selectedActivities = selectedRecord
    ? selectedRecord.activities.map(id => activities.find(a => a.id === id)).filter(Boolean) : []

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-b from-ivory-200 to-ivory-50 px-6 pt-8 pb-5">
        <h2 className="text-center text-lg font-bold text-gray-700">カレンダー</h2>
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-white shadow-soft border border-ivory-200 flex items-center justify-center active:scale-90 transition-transform">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M10 4l-4 4 4 4" /></svg>
          </button>
          <span className="text-base font-bold text-gray-700">{year}年{month + 1}月</span>
          <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-white shadow-soft border border-ivory-200 flex items-center justify-center active:scale-90 transition-transform">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M6 4l4 4-4 4" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {dayLabels.map((label, i) => (
            <div key={label} className={`text-center text-[11px] py-1 font-medium ${
              i === 0 ? 'text-accent-300' : i === 6 ? 'text-accent-200' : 'text-gray-400'
            }`}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {days.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />
            const key = getDayKey(day)
            const record = getRecordForDay(key)
            const isToday = key === todayKey
            const isSelected = key === selectedDay
            const hasActivity = record && record.activities.length > 0

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(isSelected ? null : key)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all active:scale-90 ${
                  isSelected ? 'bg-accent-400 text-white'
                  : isToday ? 'bg-accent-100 ring-2 ring-accent-300'
                  : 'bg-white'
                }`}
              >
                <span className={`text-xs font-medium ${
                  isSelected ? 'text-white' : isToday ? 'font-bold text-accent-500' : 'text-gray-600'
                }`}>{day}</span>
                {hasActivity && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-accent-300'}`} />
                )}
              </button>
            )
          })}
        </div>

        {selectedDay && (
          <div className="bg-white rounded-2xl p-5 shadow-card border border-ivory-200 animate-slide-up">
            <h3 className="text-xs font-bold text-gray-400 mb-3">{selectedDay.replace(/-/g, '/')}の記録</h3>
            {selectedActivities.length > 0 ? (
              <div className="space-y-2">
                {selectedActivities.map(a => (
                  <div key={a!.id} className="flex items-center gap-2.5">
                    <ActivityIcon id={a!.id} />
                    <span className="text-sm text-gray-700 font-medium">{a!.label}</span>
                  </div>
                ))}
                <p className="text-xs text-accent-400 mt-3 font-medium">{selectedActivities.length}こもやったんだね！</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 leading-relaxed">この日は記録がないけど、<br />きっと頑張ってた日だよ</p>
            )}
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
