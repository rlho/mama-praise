// 背景装飾（ベージュ系）

export function FloatingDeco({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <svg className="absolute top-4 left-6 w-5 h-5 animate-float opacity-20" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#E8DECE" />
      </svg>
      <svg className="absolute top-14 right-8 w-3 h-3 animate-float opacity-15" style={{ animationDelay: '1s' }} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#D4A882" />
      </svg>
      <svg className="absolute top-6 right-24 w-4 h-4 animate-float opacity-15" style={{ animationDelay: '0.5s' }} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#F3ECDE" />
      </svg>
      <svg className="absolute top-20 left-16 w-4 h-4 animate-float opacity-15" style={{ animationDelay: '1.5s' }} viewBox="0 0 24 24">
        <MiniLeaf />
      </svg>
      <svg className="absolute top-8 left-[45%] w-3 h-3 animate-float opacity-20" style={{ animationDelay: '2s' }} viewBox="0 0 24 24">
        <MiniStar />
      </svg>
    </div>
  )
}

function MiniLeaf() {
  return (
    <path d="M12 20 Q4 8 12 2 Q20 8 12 20Z" fill="#C8D5B9" opacity="0.5" />
  )
}

function MiniStar() {
  return (
    <g>
      <line x1="12" y1="4" x2="12" y2="20" stroke="#D4A882" strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="#D4A882" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

export function WaveDivider({ color = '#FDFBF7', className = '' }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 400 40" className={className} preserveAspectRatio="none" fill="none">
      <path
        d={`M0 20 Q50 0 100 20 Q150 40 200 20 Q250 0 300 20 Q350 40 400 20 L400 40 L0 40Z`}
        fill={color}
      />
    </svg>
  )
}
