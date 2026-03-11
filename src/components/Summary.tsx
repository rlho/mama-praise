import { useMemo } from 'react'
import Lottie from 'lottie-react'
import flowerAnimation from '../assets/flower-bloom.json'
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
  sleep: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  talk: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  bath: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M4 12h16M6 12v4a3 3 0 003 3h6a3 3 0 003-3v-4"/><path d="M10 9c0-2 1-3 2-3"/></svg>,
  breastfeed: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="10" cy="7" r="3"/><path d="M6 13c-1 1-2 2-2 4v2"/><path d="M14 13c1 1 2 2 2 4v2"/><circle cx="15" cy="15" r="2.5"/><path d="M10 11c0 1 1 3 3 4"/></svg>,
  diaper: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M6 8c0 0 1.5-1.5 6-1.5S18 8 18 8"/><path d="M6 8v3c0 4 2.5 8 6 8s6-4 6-8V8"/><path d="M10 8v2a2 2 0 004 0V8"/></svg>,
  hold: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><path d="M5 13c-1 1-1 3-1 4v3"/><path d="M13 13c1 1 1 3 1 4v3"/><ellipse cx="16" cy="13" rx="3" ry="2.5"/><path d="M9 11c0 1 1 2 3 3"/></svg>,
  put_to_sleep: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M6 17c2-2 4-3 6-3s4 1 6 3"/><path d="M15 5h3l-3 3h3"/></svg>,
  baby_bath: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M4 12h16"/><path d="M6 12v4c0 2.5 2.5 5 6 5s6-2.5 6-5v-4"/><circle cx="12" cy="8" r="2.5"/></svg>,
  go_out: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M12 12v4M10 16h4"/></svg>,
  shopping: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6h2l2 11h7l2-7H8"/><circle cx="10" cy="20" r="1" fill="#B07A55"/><circle cx="16" cy="20" r="1" fill="#B07A55"/></svg>,
  walk: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="6" r="2.5"/><path d="M10 10l2 5-2 5M14 10l-2 5 2 5"/></svg>,
  hospital: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M12 9v6M9 12h6"/></svg>,
  housework: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><path d="M4 10l8-6 8 6v10a1 1 0 01-1 1H5a1 1 0 01-1-1V10z"/></svg>,
  laundry: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><rect x="6" y="4" width="12" height="16" rx="2"/><circle cx="12" cy="14" r="4"/><circle cx="9" cy="7.5" r="0.8" fill="#B07A55"/></svg>,
  cook: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="15" r="6"/><path d="M12 9V4M10 6h4"/></svg>,
  dishes: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="14" r="7"/><path d="M12 7V3"/></svg>,
  think_baby: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  milk: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><path d="M8 4h8v3l-1 13H9L8 7V4z"/><path d="M8 9h8"/></svg>,
  baby_food: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="15" r="6"/><path d="M12 5v4M10 7h4"/></svg>,
  burp: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="10" r="4"/><path d="M8 16v4M16 16v4M17 5c1-1.5 1-3 0-4"/></svg>,
  play: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/></svg>,
  read_book: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinejoin="round"><path d="M4 6c2-1.5 5-1.5 8 0v14c-3-1-6-1-8 0V6z"/><path d="M20 6c-2-1.5-5-1.5-8 0v14c3-1 6-1 8 0V6z"/></svg>,
  night_cry: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M7 5l-1-2M17 5l1-2"/></svg>,
  baby_clothes: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinejoin="round"><path d="M9 6h6l2 3-2 1v8H9V10L7 9l2-3z"/></svg>,
  temp_check: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><rect x="10" y="4" width="4" height="12" rx="2"/><circle cx="12" cy="18" r="2.5"/></svg>,
  nail_cut: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M7 15c0-3 2-4 5-4s5 1 5 4M6 10l5-5M18 10l-5-5"/></svg>,
  soothe: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><circle cx="12" cy="9" r="4"/><path d="M8 18c2-2 3-3 4-3s2 1 4 3"/></svg>,
  vaccination: <svg viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4l-6 6M10 9l-4 4 3 3 4-4M14 6l3 3"/></svg>,
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
          <div className="bg-ivory-100 rounded-2xl p-6 text-center border border-ivory-200 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <p className="text-xs font-bold text-gray-400 mb-3">今日のお花畑</p>
            <div className="flex flex-wrap justify-center gap-1 relative z-10">
              {recordedActivities.map((_, i) => (
                <FlowerSvg key={i} index={i} delay={`${i * 0.12}s`} />
              ))}
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <Lottie
                animationData={flowerAnimation}
                loop={true}
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-gray-400 mt-3 relative z-10">{recordedActivities.length}本のお花が咲いたよ</p>
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
