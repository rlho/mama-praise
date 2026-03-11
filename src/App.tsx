import { useState } from 'react'
import { useStore } from './hooks/useStore'
import Onboarding from './components/Onboarding'
import Home from './components/Home'
import ActivityGrid from './components/ActivityGrid'
import Summary from './components/Summary'
import Calendar from './components/Calendar'
import Settings from './components/Settings'

type Tab = 'home' | 'activity' | 'summary' | 'calendar' | 'settings'

const tabs: { id: Tab; label: string; icon: (active: boolean) => JSX.Element }[] = [
  {
    id: 'home', label: 'ホーム',
    icon: (a) => <SvgIcon a={a}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></SvgIcon>,
  },
  {
    id: 'activity', label: 'きろく',
    icon: (a) => <SvgIcon a={a}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></SvgIcon>,
  },
  {
    id: 'summary', label: 'ふりかえり',
    icon: (a) => <SvgIcon a={a} fill={a}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></SvgIcon>,
  },
  {
    id: 'calendar', label: 'カレンダー',
    icon: (a) => <SvgIcon a={a}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SvgIcon>,
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

export default function App() {
  const store = useStore()
  const [activeTab, setActiveTab] = useState<Tab>('home')

  if (!store.profile.onboardingDone) {
    return <Onboarding onComplete={store.setProfile} />
  }

  const showBabyCategory = store.profile.status === 'postpartum'

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full pb-20">
        {activeTab === 'home' && <Home profile={store.profile} todayRecord={store.todayRecord} />}
        {activeTab === 'activity' && (
          <ActivityGrid todayRecord={store.todayRecord} toggleActivity={store.toggleActivity} incrementPraise={store.incrementPraise} showBabyCategory={showBabyCategory} />
        )}
        {activeTab === 'summary' && <Summary todayRecord={store.todayRecord} />}
        {activeTab === 'calendar' && <Calendar records={store.records} getRecordForDay={store.getRecordForDay} />}
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
