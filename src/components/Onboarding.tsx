import { useState } from 'react'
import { UserProfile } from '../hooks/useStore'
import BabyIllustration from './illustrations/BabyIllustration'
import { FloatingDeco } from './illustrations/BackgroundDeco'

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
}

type Step = 'welcome' | 'date'

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [date, setDate] = useState('')

  const handleSkip = () => onComplete({ status: 'skipped', onboardingDone: true })

  const handleSubmit = () => {
    if (!date) { handleSkip(); return }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(date)
    const isPostpartum = dueDate <= today
    onComplete({
      status: isPostpartum ? 'postpartum' : 'pregnant',
      dueDate: date,
      birthDate: isPostpartum ? date : undefined,
      onboardingDone: true,
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ivory-200 via-ivory-50 to-white relative overflow-hidden">
      <FloatingDeco className="absolute inset-0 z-0" />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-sm w-full">
          {step === 'welcome' && (
            <div className="text-center animate-fade-in-up">
              <BabyIllustration type="default" className="w-48 h-48 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-700 mb-2">ほめぽめ</h1>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                がんばるプレママ・ママを<br />応援するアプリだよ
              </p>
              <button onClick={() => setStep('date')}
                className="w-full py-4 bg-accent-400 text-white rounded-full text-base font-bold active:scale-95 transition-transform shadow-card">
                はじめる
              </button>
            </div>
          )}

          {step === 'date' && (
            <div className="text-center animate-fade-in-up">
              <BabyIllustration type="pregnant" weeks={16} className="w-32 h-32 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-700 mb-1">出産予定日は？</h2>
              <p className="text-xs text-gray-400 mb-6">
                予定日に合わせたメッセージを届けるよ<br />
                もう生まれてる場合はお誕生日でもOK
              </p>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-center text-base mb-4 focus:outline-none focus:border-accent-300 bg-white" />
              <button onClick={handleSubmit}
                className="w-full py-4 bg-accent-400 text-white rounded-full text-base font-bold active:scale-95 transition-transform shadow-card mb-3">
                設定する
              </button>
              <button onClick={handleSkip} className="w-full py-3 text-gray-400 text-sm">あとで設定する</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
