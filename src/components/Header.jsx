import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsap'
import { RULE_VARIANTS } from './RowRule'
import ColorPicker from './ColorPicker'

const RULE_ICONS = {
  dash: (
    <svg viewBox="0 0 24 12" aria-hidden="true">
      <path
        d="M1 6 H5 M9.5 6 H13.5 M18 6 H22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  zigzag: (
    <svg viewBox="0 0 24 12" aria-hidden="true">
      <path
        d="M1 9 L5 3 L9 9 L13 3 L17 9 L21 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  wave: (
    <svg viewBox="0 0 24 12" aria-hidden="true">
      <path
        d="M1 6 C4 2, 5 2, 7 6 S10 10, 13 6 S16 2, 19 6 S22 10, 23 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

const RULE_LABELS = {
  dash: 'Dotted lines',
  zigzag: 'Zigzag lines',
  wave: 'Wave lines',
}

export default function Header({
  introComplete = true,
  ruleVariant = 'dash',
  onRuleVariantChange,
  accentColor = '#FF824A',
  onAccentColorChange,
}) {
  const headerRef = useRef(null)
  const revealed = useRef(false)

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        motionOk: '(prefers-reduced-motion: no-preference)',
      },
      (context) => {
        const { reduceMotion } = context.conditions
        const targets = '.brand, .rule-switch, .color-switch, .nav a'

        if (reduceMotion) {
          gsap.set(targets, { autoAlpha: 1, y: 0 })
          revealed.current = true
          return
        }

        if (!introComplete) {
          gsap.set(targets, { autoAlpha: 0, y: 0 })
          return
        }

        if (revealed.current) {
          gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: 'visibility' })
          return
        }

        revealed.current = true

        const brand = headerRef.current?.querySelector('.brand')
        if (brand && Number(gsap.getProperty(brand, 'opacity')) > 0.5) {
          gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: 'visibility' })
          return
        }

        gsap.set(targets, { autoAlpha: 1, y: 0 })

        gsap.from('.brand, .rule-switch, .color-switch', {
          y: -16,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          immediateRender: false,
        })

        gsap.from('.nav a', {
          y: -12,
          autoAlpha: 0,
          duration: 0.7,
          delay: 0.12,
          ease: 'power3.out',
          immediateRender: false,
        })
      }
    )

    return () => mm.revert()
  }, { scope: headerRef, dependencies: [introComplete] })

  const cycleRule = () => {
    if (!onRuleVariantChange) return
    const i = RULE_VARIANTS.indexOf(ruleVariant)
    const next = RULE_VARIANTS[(i + 1) % RULE_VARIANTS.length]
    onRuleVariantChange(next)
  }

  return (
    <div className="header" ref={headerRef}>
      <div className="brand-row">
        <Link to="/" className="brand">
          Olivia Hingley
        </Link>
        {onRuleVariantChange && (
          <button
            type="button"
            className="rule-switch"
            aria-label={`${RULE_LABELS[ruleVariant]}. Click for next style.`}
            title="Change line style"
            onClick={cycleRule}
          >
            {RULE_ICONS[ruleVariant]}
          </button>
        )}
        {onAccentColorChange && (
          <ColorPicker color={accentColor} onChange={onAccentColorChange} />
        )}
      </div>
      <div className="nav">
        <Link to="/about">About</Link>
      </div>
    </div>
  )
}
