import { useState, useEffect } from 'react'
import { useStore } from './hooks/useStore'
import { useAuth } from './hooks/useAuth'
import { useNotification } from './hooks/useNotification'
import Onboarding from './components/Onboarding'
import Home from './components/Home'
import ActivityGrid from './components/ActivityGrid'
import Settings from './components/Settings'
import Chat from './components/Chat'

type Tab = 'home' | 'chat' | 'settings'

const tabs: { id: Tab; label: string; icon: (active: boolean) => JSX.Element }[] = [
  {
    id: 'home', label: 'ホーム',
    icon: (a) => <SvgIcon a={a}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></SvgIcon>,
  },
  {
    id: 'chat', label: 'そうだん',
    icon: (a) => <SvgIcon a={a}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></SvgIcon>,
  },
  {
    id: 'settings', label: 'せってい',
    icon: (a) => <SvgIcon a={a}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></SvgIcon>,
  },
]

function SvgIcon({ a, fill, children }: { a: boolean; fill?: boolean; children: React.ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={fill && a ? '#B07A55' : 'none'}
      stroke={a ? '#B07A55' : '#C0B8AE'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

function AppContent({ userId }: { userId?: string | null }) {
  const store = useStore(userId)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const { permission, notSupported, requestAndEnable } = useNotification()
  const [showNotifPrompt, setShowNotifPrompt] = useState(false)

  // オンボーディング完了後に通知許可を求める（ONなら出さない、「あとで」なら3日後に再表示）
  useEffect(() => {
    if (!store.profile.onboardingDone || notSupported || permission === 'granted') return

    const dismissedAt = localStorage.getItem('mama-praise-notif-dismissed-at')
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (daysSince < 3) return
    }

    const accepted = localStorage.getItem('mama-praise-notif-accepted')
    if (accepted) return

    const timer = setTimeout(() => setShowNotifPrompt(true), 1500)
    return () => clearTimeout(timer)
  }, [store.profile.onboardingDone, notSupported, permission])

  const handleNotifAccept = async () => {
    localStorage.setItem('mama-praise-notif-accepted', '1')
    setShowNotifPrompt(false)
    await requestAndEnable()
  }

  const handleNotifDismiss = () => {
    localStorage.setItem('mama-praise-notif-dismissed-at', String(Date.now()))
    setShowNotifPrompt(false)
  }

  if (!store.profile.onboardingDone) {
    return <Onboarding onComplete={store.setProfile} />
  }

  // 出産予定日から妊娠中/産後を判定
  const isPostpartum = (() => {
    const d = store.profile.dueDate || store.profile.birthDate
    if (!d) return store.profile.status === 'postpartum'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(d) <= today
  })()
  const showBabyCategory = isPostpartum

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      {/* 通知許可ポップアップ */}
      {showNotifPrompt && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-6 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-card animate-fade-in-up">
            <p className="text-base font-bold text-gray-700 text-center mb-2">通知をオンにする？</p>
            <p className="text-xs text-gray-400 text-center mb-5 leading-relaxed">
              毎晩20時にメッセージを届けるよ
            </p>
            <button
              onClick={handleNotifAccept}
              className="w-full py-4 rounded-full text-base font-bold bg-accent-400 text-white shadow-card active:scale-95 transition-all mb-2"
            >
              オンにする
            </button>
            <button
              onClick={handleNotifDismiss}
              className="w-full py-3 text-sm text-gray-400"
            >
              あとで
            </button>
          </div>
        </div>
      )}

      <main className={`flex-1 max-w-lg mx-auto w-full ${activeTab === 'chat' ? 'flex flex-col pb-14' : 'pb-20'}`}>
        {activeTab === 'home' && (
          <>
            <Home profile={store.profile} todayRecord={store.todayRecord} />
            <ActivityGrid todayRecord={store.todayRecord} toggleActivity={store.toggleActivity} incrementPraise={store.incrementPraise} showBabyCategory={showBabyCategory} customActivities={store.customActivities} addCustomActivity={store.addCustomActivity} removeCustomActivity={store.removeCustomActivity} />
          </>
        )}
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'settings' && <Settings profile={store.profile} setProfile={store.setProfile} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-ivory-200 safe-bottom z-40">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 transition-all duration-200 ${
                activeTab === tab.id ? 'text-accent-500' : 'text-gray-400'
              }`}
            >
              {tab.icon(activeTab === tab.id)}
              <span className={`text-[10px] mt-1 ${activeTab === tab.id ? 'font-bold text-accent-500' : 'font-medium text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()
  return <AppContent userId={user?.id} />
}
