import { useId } from 'react'
import { motion } from 'framer-motion'

const TONES = {
  caramel: { dough: '#D9A05B', edge: '#B97A3A', chip: '#3E2417' },
  raspberry: { dough: '#B23A48', edge: '#8F2735', chip: '#FFF3E6' },
  cocoa: { dough: '#4A2C1E', edge: '#2B1911', chip: '#8A5A3C' },
  pistachio: { dough: '#C9CB8C', edge: '#9FA35C', chip: '#F7EBD6' },
  oat: { dough: '#E2C08C', edge: '#B8925A', chip: '#6E3F2C' },
}
const FILLINGS = { nutella: '#5A3320', dulce: '#C27A2C', guava: '#D9445A', biscoff: '#B86A2E', none: null }

const CHIPS = [[30, 28], [62, 22], [78, 48], [40, 55], [22, 66], [58, 70], [72, 82], [45, 84], [88, 66], [15, 44]]

/** Procedural cookie illustration. `split` opens it to reveal the filling. */
export default function Cookie({ tone = 'caramel', filling = 'none', size = 120, split = false, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const t = TONES[tone] || TONES.caramel
  const f = FILLINGS[filling]
  const hasFill = !!f
  return (
    <motion.svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true"
      initial={false} animate={{ rotate: split ? -4 : 0 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
      <defs>
        <radialGradient id={`g-${uid}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={t.dough} />
          <stop offset="100%" stopColor={t.edge} />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="94" rx="36" ry="4" fill="rgba(43,25,17,0.18)" />
      <motion.g initial={false} animate={{ x: split ? 6 : 0, y: split ? 4 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}>
        <path d="M6 50 Q6 90 50 90 Q94 90 94 50 Z" fill={t.edge} />
        {hasFill && <path d="M14 52 Q20 74 50 76 Q80 74 86 52 Z" fill={f} />}
      </motion.g>
      {hasFill && (
        <motion.ellipse
          cx="50"
          fill={f}
          initial={false}
          animate={split ? { cy: 80, rx: 7, ry: 9, opacity: 1 } : { cy: 58, rx: 3, ry: 2, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: split ? 0.08 : 0 }}
        />
      )}
      <motion.g initial={false} animate={{ x: split ? -6 : 0, y: split ? -6 : 0, rotate: split ? -6 : 0 }} style={{ originX: '50%', originY: '50%' }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}>
        <path d={split ? 'M6 50 Q6 10 50 10 Q94 10 94 50 Q70 46 50 52 Q30 46 6 50 Z' : 'M6 50 Q6 10 50 10 Q94 10 94 50 Q94 90 50 90 Q6 90 6 50 Z'} fill={`url(#g-${uid})`} />
        {CHIPS.map(([x, y], i) => (!split || y < 50) && (
          <ellipse key={i} cx={x} cy={y} rx={4 + (i % 3)} ry={3 + (i % 2)} fill={t.chip} transform={`rotate(${i * 37} ${x} ${y})`} />
        ))}
        {hasFill && split && <path d="M22 50 Q50 44 78 50 Q60 56 50 54 Q40 56 22 50 Z" fill={f} />}
      </motion.g>
    </motion.svg>
  )
}
