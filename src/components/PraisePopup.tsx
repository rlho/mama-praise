import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import confettiAnimation from '../assets/confetti.json'
import starsAnimation from '../assets/stars.json'

interface PraisePopupProps {
  message: string
  onClose: () => void
}

export default function PraisePopup({ message, onClose }: PraisePopupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const dismiss = () => { setVisible(false); setTimeout(onClose, 300) }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center praise-overlay transition-all duration-300 ${visible ? 'bg-black/10 opacity-100' : 'bg-black/0 opacity-0'}`}
      onClick={dismiss}
    >
      {/* Confetti - 画面全体 */}
      <div className="absolute inset-0 pointer-events-none">
        <Lottie
          animationData={confettiAnimation}
          loop={false}
          className="w-full h-full"
        />
      </div>

      {/* メインカード */}
      <div className={`relative bg-white rounded-3xl p-8 mx-8 max-w-sm w-full text-center shadow-xl transition-all duration-500 border border-ivory-200 ${visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        {/* Stars animation on top */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 pointer-events-none">
          <Lottie
            animationData={starsAnimation}
            loop={true}
            className="w-full h-full"
          />
        </div>

        {/* チェックマーク */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-100 flex items-center justify-center animate-gentle-bounce">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16l6 6 10-10" stroke="#B07A55" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="text-base leading-relaxed text-gray-700 font-bold">{message}</p>
        <div className="mt-4 text-xs text-gray-300">タップして閉じる</div>
      </div>
    </div>
  )
}
