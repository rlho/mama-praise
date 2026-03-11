import { useState } from 'react'
import { UserProfile } from '../hooks/useStore'
import { useNotification } from '../hooks/useNotification'
import { useAuth } from '../hooks/useAuth'
import { getPregnancyInfo, getPostpartumInfo } from '../utils/date'

interface SettingsProps {
  profile: UserProfile
  setProfile: (p: UserProfile) => void
}

export default function Settings({ profile, setProfile }: SettingsProps) {
  const [status, setStatus] = useState<'pregnant' | 'postpartum' | 'skipped'>(profile.status)
  const [date, setDate] = useState(profile.dueDate || profile.birthDate || '')
  const [saved, setSaved] = useState(false)
  const { permission, enabled: notifEnabled, requestAndEnable, disable: disableNotif } = useNotification()
  const { user, signOut } = useAuth()

  const handleSave = () => {
    const newProfile: UserProfile = {
      status, onboardingDone: true,
      ...(status === 'pregnant' && date ? { dueDate: date } : {}),
      ...(status === 'postpartum' && date ? { birthDate: date } : {}),
    }
    setProfile(newProfile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const currentInfo = (() => {
    if (profile.status === 'pregnant' && profile.dueDate) {
      const info = getPregnancyInfo(profile.dueDate)
      return `妊娠${info.weeks}週${info.days}日`
    }
    if (profile.status === 'postpartum' && profile.birthDate) {
      const info = getPostpartumInfo(profile.birthDate)
      if (info.totalDays <= 28) return `生後${info.totalDays}日`
      return info.months === 0 ? '生後まもなく' : `生後${info.months}ヶ月`
    }
    return null
  })()

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-b from-ivory-200 to-ivory-50 px-6 pt-8 pb-5">
        <h2 className="text-center text-lg font-bold text-gray-700">設定</h2>
      </div>

      <div className="px-5 space-y-4">
        {currentInfo && (
          <div className="bg-accent-100 rounded-2xl p-4 text-center border border-accent-200">
            <span className="text-xs text-gray-400">現在の状態</span>
            <p className="text-base font-bold text-accent-500 mt-1">{currentInfo}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-card border border-ivory-200">
          <label className="text-xs font-bold text-gray-400 mb-3 block">ステータス</label>
          <div className="space-y-2">
            {([
              { key: 'pregnant' as const, label: '妊娠中', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M8 14c0 5 1 7 4 7s4-2 4-7"/></svg> },
              { key: 'postpartum' as const, label: '産後', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3-7 7-7s7 3 7 7"/></svg> },
              { key: 'skipped' as const, label: '設定しない', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B07A55" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5v14"/></svg> },
            ]).map(opt => (
              <button
                key={opt.key}
                onClick={() => { setStatus(opt.key); if (opt.key === 'skipped') setDate('') }}
                className={`w-full py-3 rounded-xl text-left px-4 transition-all flex items-center gap-3 ${
                  status === opt.key ? 'bg-accent-100 ring-2 ring-accent-200' : 'bg-ivory-100'
                }`}
              >
                {opt.icon}
                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {status === 'pregnant' && (
          <div className="bg-white rounded-2xl p-5 shadow-card border border-ivory-200 animate-fade-in-up">
            <label className="text-xs font-bold text-gray-400 mb-3 block">出産予定日</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-center text-base focus:outline-none focus:border-accent-300 bg-white" />
          </div>
        )}
        {status === 'postpartum' && (
          <div className="bg-white rounded-2xl p-5 shadow-card border border-ivory-200 animate-fade-in-up">
            <label className="text-xs font-bold text-gray-400 mb-3 block">赤ちゃんのお誕生日</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-center text-base focus:outline-none focus:border-accent-300 bg-white" />
          </div>
        )}

        <button onClick={handleSave}
          className={`w-full py-4 rounded-full text-base font-bold active:scale-95 transition-all ${
            saved ? 'bg-ivory-200 text-accent-400' : 'bg-accent-400 text-white shadow-card'
          }`}>
          {saved ? '保存しました' : '保存する'}
        </button>

        {/* 通知設定 */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-ivory-200">
          <label className="text-xs font-bold text-gray-400 mb-3 block">夜の通知</label>
          <p className="text-xs text-gray-400 mb-3">毎晩22時に褒めメッセージを届けるよ</p>
          {permission === 'denied' ? (
            <p className="text-xs text-red-400">通知がブロックされています。ブラウザの設定から許可してください</p>
          ) : (
            <button
              onClick={() => notifEnabled ? disableNotif() : requestAndEnable()}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                notifEnabled
                  ? 'bg-accent-100 text-accent-500 ring-2 ring-accent-200'
                  : 'bg-ivory-100 text-gray-500'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={notifEnabled ? '#B07A55' : '#999'} strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {notifEnabled ? '通知ON' : '通知をONにする'}
              </span>
            </button>
          )}
        </div>

        {/* アカウント */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-ivory-200">
          <label className="text-xs font-bold text-gray-400 mb-3 block">アカウント</label>
          {user ? (
            <div>
              <p className="text-xs text-gray-500 mb-3">{user.email} でログイン中</p>
              <p className="text-xs text-gray-400 mb-3">データはクラウドに保存されています</p>
              <button
                onClick={signOut}
                className="w-full py-3 rounded-xl text-sm font-bold bg-ivory-100 text-gray-500 transition-all active:scale-95"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-400 mb-3">
                ログインするとデータがクラウドに保存されます。<br />
                端末を変えてもデータが引き継げます。
              </p>
              <button
                onClick={() => { window.location.hash = ''; window.location.reload() }}
                className="w-full py-3 rounded-xl text-sm font-bold bg-accent-100 text-accent-500 ring-2 ring-accent-200 transition-all active:scale-95"
              >
                ログインする
              </button>
            </div>
          )}
        </div>

        <div className="bg-ivory-100 rounded-xl p-4 text-center">
          <p className="text-[11px] text-gray-400">
            {user
              ? 'データはクラウドに安全に保存されています。'
              : <>データはこの端末のブラウザに保存されています。<br />キャッシュクリアで消える可能性があります。</>
            }
          </p>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
