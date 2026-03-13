// やわらかいベージュ系の赤ちゃんイラスト（SVG）

interface Props {
  type: 'pregnant' | 'postpartum' | 'default'
  weeks?: number
  className?: string
}

export default function BabyIllustration({ type, weeks = 20, className = '' }: Props) {
  if (type === 'pregnant') return <PregnantBaby weeks={weeks} className={className} />
  if (type === 'postpartum') return <PregnantBaby weeks={40} className={className} />
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

      {/* おくるみ — ふんわり丸い形 */}
      <ellipse cx="100" cy="120" rx="44" ry="46" fill="#F0E6D6" />
      <ellipse cx="100" cy="120" rx="40" ry="42" fill="#FAF3EA" />
      {/* おくるみの襟元 */}
      <path d="M62 100 Q80 112 100 108 Q120 112 138 100 Q134 94 100 92 Q66 94 62 100Z" fill="#E8DECE" />

      {/* まるい頭 */}
      <circle cx="100" cy="76" r="30" fill="#FFECD2" />

      {/* ふわふわ前髪 */}
      <path d="M80 60 Q85 50 92 55 Q96 48 100 52 Q104 48 108 55 Q115 50 120 60" stroke="#D4B896" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* おおきなほっぺ */}
      <circle cx="82" cy="82" r="9" fill="#FCCFB5" opacity="0.3" />
      <circle cx="118" cy="82" r="9" fill="#FCCFB5" opacity="0.3" />

      {/* くりくりお目目 */}
      <ellipse cx="90" cy="74" rx="4.5" ry="5" fill="#4A3D2E" />
      <circle cx="88.5" cy="72.5" r="1.8" fill="white" />
      <circle cx="91.5" cy="75.5" r="0.8" fill="white" opacity="0.6" />
      <ellipse cx="110" cy="74" rx="4.5" ry="5" fill="#4A3D2E" />
      <circle cx="108.5" cy="72.5" r="1.8" fill="white" />
      <circle cx="111.5" cy="75.5" r="0.8" fill="white" opacity="0.6" />

      {/* まゆげ */}
      <path d="M86 67 Q90 65 94 67" stroke="#D4B896" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M106 67 Q110 65 114 67" stroke="#D4B896" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* にっこり口 */}
      <path d="M94 86 Q100 92 106 86" stroke="#D4A882" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* ちいさな手 */}
      <circle cx="67" cy="112" r="7" fill="#FFECD2" />
      <circle cx="133" cy="112" r="7" fill="#FFECD2" />

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
