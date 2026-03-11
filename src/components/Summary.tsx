import { useMemo } from 'react'
import { DayRecord } from '../hooks/useStore'
import { activities, noRecordSummaryMessages, recordSummaryMessages } from '../data/messages'
import { pickDaily } from '../utils/date'

interface SummaryProps {
  todayRecord: DayRecord
}

// 花のSVGイラスト（お花畑用）
function FlowerSvg({ index, delay }: { index: number; delay: string }) {
  const colors = ['#D4A882', '#EACDB8', '#C8D5B9', '#B07A55', '#E8DECE', '#A8C090', '#C4906A']
  const color = colors[index % colors.length]
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="animate-bloom" style={{ animationDelay: delay }}>
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const px = 18 + Math.cos(rad) * 8
        const py = 18 + Math.sin(rad) * 8
        return <circle key={i} cx={px} cy={py} r="6" fill={color} opacity="0.5" />
      })}
      <circle cx="18" cy="18" r="5" fill={color} opacity="0.8" />
    </svg>
  )
}

// アクティビティアイコン（小さめSVG）
const miniIcons: Record<string, JSX.Element> = {
  wakeup: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>,
  change: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h8v1l-1 11H9L8 7V6z"/><path d="M10 6V4h4v2"/></svg>,
  wash_face: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="10" r="6"/><path d="M9.5 9a.5.5 0 011 0M13.5 9a.5.5 0 011 0M10 13c1 1 3 1 4 0"/></svg>,
  brush_teeth: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><rect x="10" y="4" width="4" height="14" rx="2"/><path d="M8 18h8"/></svg>,
  eat: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="14" r="6"/><path d="M12 8V4M10 6h4"/></svg>,
  drink: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinejoin="round"><path d="M8 6h8l-1.5 14h-5L8 6z"/><path d="M8 10h8"/></svg>,
  bath: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M4 12h16M6 12v4a3 3 0 003 3h6a3 3 0 003-3v-4"/><path d="M10 9c0-2 1-3 2-3"/></svg>,
  breastfeed: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><circle cx="10" cy="8" r="3"/><path d="M6 20c0-3 2-5 4-5"/><circle cx="16" cy="16" r="4"/></svg>,
  diaper: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><path d="M6 9h12v3c0 3-2 6-6 6s-6-3-6-6V9z"/><path d="M6 9c1.5-3 4.5-3 6-3s4.5 0 6 3"/></svg>,
  hold: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><circle cx="12" cy="7" r="3"/><path d="M8 20v-5c0-2 2-4 4-4s4 2 4 4v5"/></svg>,
  put_to_sleep: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M6 17c2-2 4-3 6-3s4 1 6 3"/><path d="M15 5h3l-3 3h3"/></svg>,
  baby_bath: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M4 12h16M6 12v4a3 3 0 003 3h6a3 3 0 003-3v-4"/><circle cx="12" cy="8" r="2.5"/></svg>,
  go_out: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M12 12v4M10 16h4"/></svg>,
  shopping: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6h2l2 11h7l2-7H8"/><circle cx="10" cy="20" r="1" fill="#B07A55"/><circle cx="16" cy="20" r="1" fill="#B07A55"/></svg>,
  walk: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="6" r="2.5"/><path d="M10 10l2 5-2 5M14 10l-2 5 2 5"/></svg>,
  hospital: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M12 9v6M9 12h6"/></svg>,
  housework: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><path d="M4 10l8-6 8 6v10a1 1 0 01-1 1H5a1 1 0 01-1-1V10z"/></svg>,
  laundry: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><rect x="6" y="4" width="12" height="16" rx="2"/><circle cx="12" cy="14" r="4"/><circle cx="9" cy="7.5" r="0.8" fill="#B07A55"/></svg>,
  cook: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="15" r="6"/><path d="M12 9V4M10 6h4"/></svg>,
  clean: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4h4v8l3 8H7l3-8V4z"/></svg>,
}

export default function Summary({ todayRecord }: SummaryProps) {
  const recordedActivities = useMemo(() =>
    todayRecord.activities.map(id => activities.find(a => a.id === id)).filter(Boolean),
    [todayRecord.activities]
  )
  const hasRecords = recordedActivities.length > 0
  const summaryMessage = useMemo(() => {
    if (!hasRecords) return pickDaily(noRecordSummaryMessages)
    const fn = pickDaily(recordSummaryMessages)
    return fn(recordedActivities.length)
  }, [hasRecords, recordedActivities.length])

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-b from-ivory-200 to-ivory-50 px-6 pt-8 pb-5">
        <h2 className="text-center text-lg font-bold text-gray-700">今日のふりかえり</h2>
      </div>

      <div className="px-5 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-card border border-ivory-200 text-center animate-fade-in-up">
          <p className="text-base text-gray-700 leading-relaxed font-bold">{summaryMessage}</p>
        </div>

        {hasRecords && (
          <div className="space-y-2">
            {recordedActivities.map((activity, index) => (
              <div
                key={activity!.id}
                className="bg-white rounded-xl p-3.5 shadow-soft border border-ivory-200 flex items-center gap-3 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="w-9 h-9 rounded-full bg-ivory-100 flex items-center justify-center p-1.5">
                  {miniIcons[activity!.id] || <div className="w-full h-full rounded-full bg-accent-200" />}
                </div>
                <span className="font-medium text-sm text-gray-700 flex-1">{activity!.label}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-6" stroke="#D4A882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>
        )}

        {hasRecords && (
          <div className="bg-ivory-100 rounded-2xl p-6 text-center border border-ivory-200 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-xs font-bold text-gray-400 mb-3">今日のお花畑</p>
            <div className="flex flex-wrap justify-center gap-1">
              {recordedActivities.map((_, i) => (
                <FlowerSvg key={i} index={i} delay={`${i * 0.12}s`} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">{recordedActivities.length}本のお花が咲いたよ</p>
          </div>
        )}

        {!hasRecords && (
          <div className="bg-ivory-100 rounded-2xl p-6 text-center border border-ivory-200 animate-fade-in-up">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-3 animate-float">
              <circle cx="24" cy="24" r="18" stroke="#E8DECE" strokeWidth="2"/>
              <path d="M24 10c-1 4-4 8-4 14" stroke="#D4A882" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="24" cy="10" r="3" fill="#F3ECDE" stroke="#D4A882" strokeWidth="1.5"/>
            </svg>
            <p className="text-sm text-gray-500 leading-loose">
              記録がなくても大丈夫。<br />
              あなたは今日も息をして、<br />
              心臓を動かして、<br />
              それだけで十分がんばってるよ。
            </p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
