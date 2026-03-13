import { useMemo } from 'react'
import Lottie from 'lottie-react'
import sparkleAnimation from '../assets/sparkle.json'
import { UserProfile, DayRecord } from '../hooks/useStore'
import { timeGreetings, postpartumExtraGreetings } from '../data/messages'
import { getDailyPregnancyMessage } from '../data/pregnancyDaily'
import { getDailyPostpartumMessage } from '../data/postpartumDaily'
import {
  getTimeOfDay,
  getPregnancyInfo,
  getPostpartumInfo,
  pickDaily,
} from '../utils/date'
import BabyIllustration from './illustrations/BabyIllustration'
import { FloatingDeco, WaveDivider } from './illustrations/BackgroundDeco'

interface HomeProps {
  profile: UserProfile
  todayRecord: DayRecord
}

export default function Home({ profile, todayRecord }: HomeProps) {
  const timeOfDay = getTimeOfDay()
  const greetingPool = useMemo(() => {
    const base = timeGreetings[timeOfDay]
    const extra = postpartumExtraGreetings[timeOfDay as keyof typeof postpartumExtraGreetings]
    if (profile.status === 'postpartum' && extra) {
      return [...base, ...extra]
    }
    return base
  }, [timeOfDay, profile.status])
  const greeting = useMemo(() => pickDaily(greetingPool), [greetingPool])

  const personalized = useMemo(() => {
    if (profile.status === 'pregnant' && profile.dueDate) {
      const info = getPregnancyInfo(profile.dueDate)
      const msg = getDailyPregnancyMessage(info.totalDays)
      return {
        title: `妊娠${info.weeks}週${info.days}日`,
        body: msg.body,
        babyInfo: msg.babyInfo,
        bodyKnowledge: msg.bodyKnowledge,
        type: 'pregnant' as const,
        info,
      }
    }
    if (profile.status === 'postpartum' && profile.birthDate) {
      const info = getPostpartumInfo(profile.birthDate)
      const msg = getDailyPostpartumMessage(info.totalDays)
      return {
        title: msg.title,
        body: msg.body,
        babyInfo: msg.babyInfo,
        bodyKnowledge: null as string | null,
        type: 'postpartum' as const,
        info,
      }
    }
    return null
  }, [profile])

  const illustrationType = profile.status === 'pregnant' ? 'pregnant'
    : profile.status === 'postpartum' ? 'postpartum' : 'default'

  return (
    <div className="animate-fade-in">
      <div className="relative bg-gradient-to-b from-ivory-200 via-ivory-100 to-ivory-100 overflow-hidden">
        <FloatingDeco className="absolute inset-0 z-0" />

        <div className="relative z-10 pt-8 pb-2 px-6">
          {personalized && (
            <div className="flex justify-center mb-2">
              <span className="inline-flex items-center bg-white/70 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-soft text-sm font-bold text-accent-400">
                {personalized.title}
              </span>
            </div>
          )}

          <div className="flex justify-center mb-3 relative">
            <BabyIllustration
              type={illustrationType}
              weeks={personalized?.type === 'pregnant' ? personalized.info.weeks : undefined}
              className="w-44 h-44 animate-fade-in"
            />
            <div className="absolute inset-0 pointer-events-none">
              <Lottie
                animationData={sparkleAnimation}
                loop={5}
                className="w-full h-full opacity-60"
              />
            </div>
          </div>

          <h1 className="text-center text-lg font-bold text-gray-700 leading-relaxed whitespace-pre-line">
            {greeting}
          </h1>

        </div>

        <WaveDivider color="#FDFBF7" className="w-full h-8 -mb-px" />
      </div>

      <div className="px-5 -mt-1 space-y-4">
        {personalized && (
          <div className="bg-white rounded-2xl shadow-card p-5 border border-ivory-200 animate-fade-in-up">
            {personalized.babyInfo && (
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-ivory-100 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A882" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="8" r="5"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed pt-1.5">
                  {personalized.babyInfo}
                </p>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#D4A882" stroke="none">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pt-1.5">
                {personalized.body}
              </p>
            </div>

            {personalized.bodyKnowledge && (
              <>
                <div className="border-t border-ivory-100 my-3" />
                <p className="text-xs text-gray-400 leading-relaxed pl-1">
                  {personalized.bodyKnowledge}
                </p>
              </>
            )}
          </div>
        )}

        {!personalized && (
          <div className="bg-white rounded-2xl p-5 text-center border border-ivory-200 shadow-card animate-fade-in-up">
            <p className="text-sm text-gray-500 mb-2">
              妊娠週数や産後月齢を設定すると<br />あなたに合ったメッセージが届くよ
            </p>
            <span className="text-xs text-accent-300">せっていタブから設定できます</span>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
