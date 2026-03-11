import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface AuthGateProps {
  children: React.ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, loading, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || sending) return
    setSending(true)
    setError('')
    const { error: err } = await signInWithEmail(email.trim())
    setSending(false)
    if (err) {
      setError('送信できませんでした。もう一度試してね')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-accent-500 mb-2">ほめぽめ</h1>
          <p className="text-sm text-gray-500">がんばるプレママ・ママを応援するアプリ</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-6 shadow-card border border-ivory-200 text-center animate-fade-in">
            <p className="text-base font-bold text-gray-700 mb-2">メールを送ったよ！</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {email} に届いたリンクをタップしてね。
              <br />届かない場合は迷惑メールも確認してみてね。
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-4 text-sm text-accent-400 underline"
            >
              別のメールアドレスで試す
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-card border border-ivory-200 animate-fade-in">
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
              {sending ? '送信中...' : 'ログインリンクを送る'}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
              パスワード不要！メールのリンクをタップするだけ。
            </p>
          </form>
        )}

        <button
          onClick={() => {
            // Skip auth - use app without login (localStorage only)
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
