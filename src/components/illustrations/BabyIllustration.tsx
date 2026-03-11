// やわらかいベージュ系の赤ちゃんイラスト（SVG）

interface Props {
  type: 'pregnant' | 'postpartum' | 'default'
  weeks?: number
  className?: string
}

export default function BabyIllustration({ type, weeks = 20, className = '' }: Props) {
  if (type === 'pregnant') return <PregnantBaby weeks={weeks} className={className} />
  if (type === 'postpartum') return <PostpartumBaby className={className} />
  return <DefaultIllustration className={className} />
}

function PregnantBaby({ weeks, className }: { weeks: number; className: string }) {
  const babyScale = Math.min(0.5 + (weeks / 40) * 0.5, 1)
  const bellySize = 50 + (weeks / 40) * 30

  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      <circle cx="100" cy="100" r="90" fill="#FAF6EE" />

      {/* お腹 */}
      <ellipse cx="100" cy="105" rx={bellySize} ry={bellySize + 5} fill="#F3ECDE" />
      <ellipse cx="100" cy="105" rx={bellySize - 6} ry={bellySize - 1} fill="#FAF6EE" />

      {/* 赤ちゃん */}
      <g transform={`translate(100, 108) scale(${babyScale})`} style={{ transformOrigin: 'center' }}>
        <ellipse cx="0" cy="8" rx="22" ry="26" fill="#FFECD2" />
        <circle cx="0" cy="-18" r="18" fill="#FFECD2" />
        <circle cx="-10" cy="-13" r="5" fill="#F0D4BB" opacity="0.4" />
        <circle cx="10" cy="-13" r="5" fill="#F0D4BB" opacity="0.4" />
        {/* 閉じ目 */}
        <path d="M-7 -18 Q-5 -16 -3 -18" stroke="#C4956A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M3 -18 Q5 -16 7 -18" stroke="#C4956A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M-3 -12 Q0 -10 3 -12" stroke="#D4A882" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* 手足 */}
        <ellipse cx="-18" cy="0" rx="7" ry="5" fill="#FFECD2" transform="rotate(-20 -18 0)" />
        <ellipse cx="18" cy="0" rx="7" ry="5" fill="#FFECD2" transform="rotate(20 18 0)" />
        <ellipse cx="-10" cy="30" rx="7" ry="5" fill="#FFECD2" transform="rotate(10 -10 30)" />
        <ellipse cx="10" cy="30" rx="7" ry="5" fill="#FFECD2" transform="rotate(-10 10 30)" />
      </g>

      <g opacity="0.5">
        <Star cx={40} cy={40} size={8} />
        <Star cx={155} cy={50} size={6} />
        <Star cx={30} cy={140} size={5} />
        <Star cx={165} cy={135} size={7} />
      </g>

      <g opacity="0.25">
        <Leaf cx={48} cy={68} size={10} />
        <Leaf cx={152} cy={78} size={8} />
      </g>
    </svg>
  )
}

function PostpartumBaby({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      <circle cx="100" cy="100" r="90" fill="#FAF6EE" />

      {/* おくるみ */}
      <ellipse cx="100" cy="115" rx="42" ry="48" fill="#F3ECDE" />
      <ellipse cx="100" cy="115" rx="38" ry="44" fill="#FAF6EE" />
      <path d="M65 95 Q100 105 135 95 Q130 90 100 88 Q70 90 65 95Z" fill="#E8DECE" />

      {/* 頭 */}
      <circle cx="100" cy="78" r="26" fill="#FFECD2" />

      {/* 髪の毛 */}
      <path d="M92 55 Q95 48 100 52 Q105 48 108 55" stroke="#C4956A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* ほっぺ */}
      <circle cx="85" cy="83" r="7" fill="#F0D4BB" opacity="0.35" />
      <circle cx="115" cy="83" r="7" fill="#F0D4BB" opacity="0.35" />

      {/* 目 */}
      <ellipse cx="91" cy="76" rx="3.5" ry="4" fill="#5D4E3C" />
      <circle cx="90" cy="74.5" r="1.2" fill="white" />
      <ellipse cx="109" cy="76" rx="3.5" ry="4" fill="#5D4E3C" />
      <circle cx="108" cy="74.5" r="1.2" fill="white" />

      {/* 口 */}
      <path d="M95 87 Q100 92 105 87" stroke="#D4A882" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* 手 */}
      <ellipse cx="70" cy="108" rx="8" ry="6" fill="#FFECD2" transform="rotate(-15 70 108)" />
      <ellipse cx="130" cy="108" rx="8" ry="6" fill="#FFECD2" transform="rotate(15 130 108)" />

      <g opacity="0.5">
        <Star cx={38} cy={45} size={8} />
        <Star cx={160} cy={42} size={6} />
        <Star cx={28} cy={150} size={5} />
        <Star cx={170} cy={145} size={7} />
      </g>

      <g opacity="0.25">
        <Leaf cx={45} cy={70} size={9} />
        <Leaf cx={155} cy={68} size={7} />
      </g>
    </svg>
  )
}

function DefaultIllustration({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      <circle cx="100" cy="100" r="90" fill="#FAF6EE" />

      {/* お花 */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const px = 100 + Math.cos(rad) * 30
        const py = 95 + Math.sin(rad) * 30
        return (
          <ellipse
            key={i}
            cx={px} cy={py} rx="18" ry="18"
            fill={i % 2 === 0 ? '#F3ECDE' : '#EACDB8'}
            opacity="0.7"
          />
        )
      })}
      <circle cx="100" cy="95" r="16" fill="#FFECD2" />

      {/* 顔 */}
      <path d="M93 93 Q95 91 97 93" stroke="#C4956A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M103 93 Q105 91 107 93" stroke="#C4956A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M96 98 Q100 101 104 98" stroke="#D4A882" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="91" cy="96" r="3.5" fill="#F0D4BB" opacity="0.35" />
      <circle cx="109" cy="96" r="3.5" fill="#F0D4BB" opacity="0.35" />

      <g opacity="0.4">
        <Star cx={42} cy={50} size={7} />
        <Star cx={158} cy={48} size={6} />
        <Star cx={35} cy={148} size={5} />
        <Star cx={162} cy={150} size={7} />
      </g>
    </svg>
  )
}

// ---- 装飾パーツ ----

function Star({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <line x1="0" y1={-size} x2="0" y2={size} stroke="#D4A882" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={-size} y1="0" x2={size} y2="0" stroke="#D4A882" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={-size * 0.6} y1={-size * 0.6} x2={size * 0.6} y2={size * 0.6} stroke="#D4A882" strokeWidth="1" strokeLinecap="round" />
      <line x1={size * 0.6} y1={-size * 0.6} x2={-size * 0.6} y2={size * 0.6} stroke="#D4A882" strokeWidth="1" strokeLinecap="round" />
    </g>
  )
}

function Leaf({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const s = size / 10
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <path
        d={`M0 ${5 * s} Q${-4 * s} ${-2 * s} 0 ${-6 * s} Q${4 * s} ${-2 * s} 0 ${5 * s}Z`}
        fill="#C8D5B9"
        opacity="0.6"
      />
      <line x1="0" y1={5 * s} x2="0" y2={-5 * s} stroke="#B0C4A0" strokeWidth="0.8" />
    </g>
  )
}
