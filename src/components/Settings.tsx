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
  const [date, setDate] = useState(profile.dueDate || profile.birthDate || '')
  const [saved, setSaved] = useState(false)
  const { permission, enabled: notifEnabled, notSupported, requestAndEnable, disable: disableNotif } = useNotification()
  const { user, signOut, signInWithOtp, verifyOtp } = useAuth()

  // ログインフォーム用state
  const [loginStep, setLoginStep] = useState<'none' | 'email' | 'code'>('none')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginToken, setLoginToken] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSending, setLoginSending] = useState(false)

  const handleSave = () => {
    if (!date) {
      setProfile({ status: 'skipped', onboardingDone: true })
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dueDate = new Date(date)
      const isPostpartum = dueDate <= today
      setProfile({
        status: isPostpartum ? 'postpartum' : 'pregnant',
        dueDate: date,
        birthDate: isPostpartum ? date : undefined,
        onboardingDone: true,
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSendCode = async () => {
    if (!loginEmail.trim() || loginSending) return
    setLoginSending(true)
    setLoginError('')
    const { error } = await signInWithOtp(loginEmail.trim())
    setLoginSending(false)
    if (error) {
      setLoginError(error.message || '送信できませんでした')
    } else {
      setLoginStep('code')
    }
  }

  const handleVerifyCode = async () => {
    if (!loginToken.trim() || loginSending) return
    setLoginSending(true)
    setLoginError('')
    const { error } = await verifyOtp(loginEmail.trim(), loginToken.trim())
    setLoginSending(false)
    if (error) {
      setLoginError('コードが正しくないかもしれません')
    } else {
      setLoginStep('none')
    }
  }

  const currentInfo = (() => {
    const d = profile.dueDate || profile.birthDate
    if (!d) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isPostpartum = new Date(d) <= today
    if (!isPostpartum) {
      const info = getPregnancyInfo(d)
      return `妊娠${info.weeks}週${info.days}日`
    } else {
      const info = getPostpartumInfo(d)
      if (info.totalDays <= 28) return `生後${info.totalDays}日`
      return info.months === 0 ? '生後まもなく' : `生後${info.months}ヶ月`
    }
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
          <label className="text-xs font-bold text-gray-400 mb-3 block">出産予定日 / お誕生日</label>
          <p className="text-xs text-gray-400 mb-3">予定日を過ぎたら自動で産後モードになるよ</p>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-center text-base focus:outline-none focus:border-accent-300 bg-white" />
        </div>

        <button onClick={handleSave}
          className={`w-full py-4 rounded-full text-base font-bold active:scale-95 transition-all ${
            saved ? 'bg-ivory-200 text-accent-400' : 'bg-accent-400 text-white shadow-card'
          }`}>
          {saved ? '保存しました' : '保存する'}
        </button>

        {/* 通知設定 */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-ivory-200">
          <label className="text-xs font-bold text-gray-400 mb-3 block">夜の通知</label>
          <p className="text-xs text-gray-400 mb-3">毎晩20時にメッセージを届けるよ</p>
          {notSupported ? (
            <p className="text-xs text-gray-400">
              iOSで通知を使うには、まずホーム画面に追加してね<br />
              <span className="text-[11px]">（Safari → 共有ボタン → ホーム画面に追加）</span>
            </p>
          ) : permission === 'denied' ? (
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
          ) : loginStep === 'none' ? (
            <div>
              <p className="text-xs text-gray-400 mb-3">
                ログインするとデータがクラウドに保存されます。<br />
                端末を変えてもデータが引き継げます。
              </p>
              <button
                onClick={() => setLoginStep('email')}
                className="w-full py-3 rounded-xl text-sm font-bold bg-accent-100 text-accent-500 ring-2 ring-accent-200 transition-all active:scale-95"
              >
                ログインする
              </button>
            </div>
          ) : loginStep === 'email' ? (
            <div className="animate-fade-in">
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-sm focus:outline-none focus:border-accent-300 bg-white mb-3"
                autoComplete="email"
              />
              {loginError && <p className="text-xs text-red-400 mb-2">{loginError}</p>}
              <button
                onClick={handleSendCode}
                disabled={loginSending || !loginEmail.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold bg-accent-400 text-white active:scale-95 transition-all disabled:opacity-50 mb-2"
              >
                {loginSending ? '送信中...' : '認証コードを送る'}
              </button>
              <button onClick={() => { setLoginStep('none'); setLoginError('') }}
                className="w-full text-xs text-gray-400 underline">
                キャンセル
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <p className="text-xs text-gray-500 mb-3 text-center">
                <span className="font-bold">{loginEmail}</span> に送った6桁のコードを入力
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={loginToken}
                onChange={e => setLoginToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-center text-xl tracking-[0.4em] font-bold focus:outline-none focus:border-accent-300 bg-white mb-3"
              />
              {loginError && <p className="text-xs text-red-400 mb-2">{loginError}</p>}
              <button
                onClick={handleVerifyCode}
                disabled={loginSending || loginToken.length < 6}
                className="w-full py-3 rounded-xl text-sm font-bold bg-accent-400 text-white active:scale-95 transition-all disabled:opacity-50 mb-2"
              >
                {loginSending ? '確認中...' : 'ログイン'}
              </button>
              <button onClick={() => { setLoginStep('email'); setLoginToken(''); setLoginError('') }}
                className="w-full text-xs text-gray-400 underline">
                メールアドレスを変更
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

        <div className="h-24" />
      </div>
    </div>
  )
}
