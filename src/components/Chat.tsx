import { useState, useRef, useEffect, useCallback } from 'react'

type Message = {
  role: 'user' | 'assistant'
  text: string
}

function useSpeechRecognition(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const toggle = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('このブラウザは音声入力に対応していません')
      return
    }

    const recognition = new SR()
    recognition.lang = 'ja-JP'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isListening, onResult])

  return { isListening, toggle }
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const idx = useRef(0)

  useEffect(() => {
    setDisplayed('')
    idx.current = 0
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1))
        idx.current++
      } else {
        clearInterval(interval)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [text])

  return <span>{displayed}{displayed.length < text.length && <span className="text-accent-400 animate-pulse">|</span>}</span>
}

export default function Chat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)

  const handleSpeechResult = useCallback((text: string) => {
    setInput(prev => prev + text)
  }, [])

  const { isListening, toggle: toggleMic } = useSpeechRecognition(handleSpeechResult)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isThinking) return

    const userMsg = input.trim()
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', text: userMsg }]
    setMessages(newMessages)
    setIsThinking(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(-10),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || data.error }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'うまくつながりませんでした。もう一度試してみてね' }])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-b from-ivory-200 to-ivory-50 px-6 pt-8 pb-4">
        <h2 className="text-center text-lg font-bold text-gray-700">そうだん</h2>
        <p className="text-center text-xs text-gray-400 mt-1">気持ちを話してみてね。聞いてるよ</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4A882" strokeWidth="2" strokeLinecap="round">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              つらいこと、不安なこと、<br />なんでも話してね
            </p>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              音声でもテキストでもOK<br />
              マイクボタンで話しかけてみて
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-accent-400 text-white rounded-2xl rounded-br-sm'
                : 'bg-white text-gray-700 rounded-2xl rounded-bl-sm shadow-soft border border-ivory-200'
            }`}>
              {msg.role === 'assistant' && i === messages.length - 1
                ? <TypewriterText text={msg.text} />
                : msg.text
              }
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 text-sm rounded-2xl rounded-bl-sm shadow-soft border border-ivory-200 text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-accent-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      {/* Helpline notice */}
      <div className="px-4 pb-1">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          つらいときは
          <a href="tel:0120279338" className="text-accent-400 underline mx-0.5">よりそいホットライン(0120-279-338)</a>
          に相談してね
        </p>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-ivory-200 bg-white/95 backdrop-blur-sm"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleMic}
            disabled={isThinking}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 ${
              isListening
                ? 'bg-accent-400 text-white shadow-card'
                : 'bg-ivory-100 text-accent-400'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="1" width="6" height="11" rx="3" />
              <path d="M19 10v1a7 7 0 01-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="ここに気持ちを書いてね"
            disabled={isThinking}
            className="flex-1 min-w-0 px-4 py-2 text-sm rounded-full border border-ivory-200 bg-white focus:outline-none focus:border-accent-300"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-accent-400 text-white transition-all disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5,12 12,5 19,12" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
