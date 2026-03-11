import { useState } from 'react'
import { UserProfile } from '../hooks/useStore'
import BabyIllustration from './illustrations/BabyIllustration'
import { FloatingDeco } from './illustrations/BackgroundDeco'

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
}

type Step = 'welcome' | 'status' | 'pregnant-date' | 'postpartum-date'

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [date, setDate] = useState('')

  const handleSkip = () => onComplete({ status: 'skipped', onboardingDone: true })
  const handlePregnantSubmit = () => onComplete({ status: 'pregnant', dueDate: date || undefined, onboardingDone: true })
  const handlePostpartumSubmit = () => onComplete({ status: 'postpartum', birthDate: date || undefined, onboardingDone: true })

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ivory-200 via-ivory-50 to-white relative overflow-hidden">
      <FloatingDeco className="absolute inset-0 z-0" />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-sm w-full">
          {step === 'welcome' && (
            <div className="text-center animate-fade-in-up">
              <BabyIllustration type="default" className="w-48 h-48 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-700 mb-2">ママほめ</h1>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                頑張るあなたを<br />毎日褒めるアプリだよ
              </p>
              <button onClick={() => setStep('status')}
                className="w-full py-4 bg-accent-400 text-white rounded-full text-base font-bold active:scale-95 transition-transform shadow-card">
                はじめる
              </button>
            </div>
          )}

          {step === 'status' && (
            <div className="text-center animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-700 mb-2">教えてくれる？</h2>
              <p className="text-xs text-gray-400 mb-8">あなたに合ったメッセージを届けるよ</p>
              <div className="space-y-3">
                <button onClick={() => setStep('pregnant-date')}
                  className="w-full py-5 bg-white rounded-2xl font-medium text-gray-700 active:scale-95 transition-transform border border-ivory-200 shadow-soft flex items-center gap-4 px-5">
                  <BabyIllustration type="pregnant" className="w-14 h-14 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-bold block text-sm">妊娠中</span>
                    <span className="text-xs text-gray-400">週数に合わせて褒めるよ</span>
                  </div>
                </button>
                <button onClick={() => setStep('postpartum-date')}
                  className="w-full py-5 bg-white rounded-2xl font-medium text-gray-700 active:scale-95 transition-transform border border-ivory-200 shadow-soft flex items-center gap-4 px-5">
                  <BabyIllustration type="postpartum" className="w-14 h-14 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-bold block text-sm">産後</span>
                    <span className="text-xs text-gray-400">月齢に合わせて褒めるよ</span>
                  </div>
                </button>
                <button onClick={handleSkip} className="w-full py-3 text-gray-400 text-sm mt-2">あとで設定する</button>
              </div>
            </div>
          )}

          {step === 'pregnant-date' && (
            <div className="text-center animate-fade-in-up">
              <BabyIllustration type="pregnant" weeks={16} className="w-32 h-32 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-700 mb-1">出産予定日は？</h2>
              <p className="text-xs text-gray-400 mb-6">週数と日数に合わせたメッセージを届けるよ</p>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-center text-base mb-4 focus:outline-none focus:border-accent-300 bg-white" />
              <button onClick={handlePregnantSubmit}
                className="w-full py-4 bg-accent-400 text-white rounded-full text-base font-bold active:scale-95 transition-transform shadow-card mb-3">
                設定する
              </button>
              <button onClick={handleSkip} className="w-full py-3 text-gray-400 text-sm">スキップ</button>
            </div>
          )}

          {step === 'postpartum-date' && (
            <div className="text-center animate-fade-in-up">
              <BabyIllustration type="postpartum" className="w-32 h-32 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-700 mb-1">赤ちゃんのお誕生日は？</h2>
              <p className="text-xs text-gray-400 mb-6">月齢に合わせたメッセージを届けるよ</p>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-center text-base mb-4 focus:outline-none focus:border-accent-300 bg-white" />
              <button onClick={handlePostpartumSubmit}
                className="w-full py-4 bg-accent-400 text-white rounded-full text-base font-bold active:scale-95 transition-transform shadow-card mb-3">
                設定する
              </button>
              <button onClick={handleSkip} className="w-full py-3 text-gray-400 text-sm">スキップ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
