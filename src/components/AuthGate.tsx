import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface AuthGateProps {
  children: React.ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, loading, signInWithOtp, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">読み込み中...</p>
      </div>
    )
  }

  if (user) {
    return <>{children}</>
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || sending) return
    setSending(true)
    setError('')
    const { error: err } = await signInWithOtp(email.trim())
    setSending(false)
    if (err) {
      console.error('Auth error:', err)
      setError(err.message || '送信できませんでした')
    } else {
      setStep('code')
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim() || sending) return
    setSending(true)
    setError('')
    const { error: err } = await verifyOtp(email.trim(), token.trim())
    setSending(false)
    if (err) {
      console.error('Verify error:', err)
      setError('コードが正しくないかもしれません。もう一度確認してね')
    }
  }

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-accent-500 mb-2">ほめぽめ</h1>
          <p className="text-sm text-gray-500">がんばるプレママ・ママを応援するアプリ</p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendCode} className="bg-white rounded-2xl p-6 shadow-card border border-ivory-200 animate-fade-in">
            <label className="text-xs font-bold text-gray-400 mb-3 block">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full py-3 px-4 rounded-xl border-2 border-ivory-200 text-base focus:outline-none focus:border-accent-300 bg-white mb-4"
              autoComplete="email"
              autoFocus
            />
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="w-full py-4 rounded-full text-base font-bold bg-accent-400 text-white shadow-card active:scale-95 transition-all disabled:opacity-50"
            >
              {sending ? '送信中...' : '認証コードを送る'}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
              6桁の認証コードをメールで送ります
            </p>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="bg-white rounded-2xl p-6 shadow-card border border-ivory-200 animate-fade-in">
            <p className="text-sm text-gray-500 mb-4 text-center leading-relaxed">
              <span className="font-bold text-gray-700">{email}</span><br />
              に送った6桁のコードを入力してね
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full py-4 px-4 rounded-xl border-2 border-ivory-200 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-accent-300 bg-white mb-4"
              autoFocus
            />
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <button
              type="submit"
              disabled={sending || token.length < 6}
              className="w-full py-4 rounded-full text-base font-bold bg-accent-400 text-white shadow-card active:scale-95 transition-all disabled:opacity-50"
            >
              {sending ? '確認中...' : 'ログイン'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setToken(''); setError('') }}
              className="w-full mt-3 text-sm text-gray-400 underline text-center"
            >
              メールアドレスを変更する
            </button>
          </form>
        )}

        <button
          onClick={() => {
            window.location.hash = '#skip-auth'
            window.location.reload()
          }}
          className="w-full mt-4 text-sm text-gray-400 underline text-center"
        >
          ログインせずに使う
        </button>
        <p className="text-[11px] text-gray-400 text-center mt-1">
          ※ログインしないとデータが消える可能性があります
        </p>
      </div>
    </div>
  )
}
