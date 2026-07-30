import { useRef, useState, useEffect } from 'react'

export const RULE_VARIANTS = ['dash', 'zigzag', 'wave']

/**
 * Decorative rules use CSS repeating backgrounds (tiny SVG data-URIs in styles.css).
 * Generating full-length zigzag paths per row was freezing the page on switch.
 */

/** Row separator — class swap only */
export default function RowRule({ variant = 'dash' }) {
  return <div className={`index-rule is-horizontal is-${variant}`} aria-hidden="true" />
}

/** ⌞ guide: tab underline + vertical rail */
export function GuideL({ variant = 'dash', tabSelector = '.tab.active' }) {
  const ref = useRef(null)
  const [box, setBox] = useState({ top: 0, tabW: 120, height: 400 })

  useEffect(() => {
    const root = ref.current?.closest('.index-guide')
    if (!root) return

    let raf = 0
    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rootRect = root.getBoundingClientRect()
        const tab = root.querySelector(tabSelector)
        const list = root.querySelector('.index-list')
        if (!tab || !list) return

        const tabRect = tab.getBoundingClientRect()
        const listRect = list.getBoundingClientRect()
        const top = tabRect.bottom - rootRect.top + 10
        const height = Math.max(80, Math.round(listRect.bottom - rootRect.top - top))
        const tabW = Math.max(40, Math.round(tabRect.width - 20))

        setBox((prev) =>
          prev.top === top && prev.tabW === tabW && prev.height === height
            ? prev
            : { top, tabW, height }
        )
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [tabSelector])

  return (
    <div
      ref={ref}
      className={`guide-l is-${variant}`}
      aria-hidden="true"
      style={{
        top: box.top,
        height: box.height,
        ['--guide-tab-w']: `${box.tabW}px`,
      }}
    >
      <div className="guide-l-h" />
      <div className="guide-l-v" />
    </div>
  )
}
