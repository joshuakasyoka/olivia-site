import { useEffect, useRef, useState } from 'react'

function hexToHsl(hex) {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const num = Number.parseInt(full, 16)
  if (Number.isNaN(num) || full.length !== 6) return { h: 18, s: 100, l: 64 }

  const r = ((num >> 16) & 255) / 255
  const g = ((num >> 8) & 255) / 255
  const b = (num & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h, s, l) {
  const sat = s / 100
  const light = l / 100
  const a = sat * Math.min(light, 1 - light)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export default function ColorPicker({ color = '#FF824A', onChange }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const hsl = hexToHsl(color)
  const [hue, setHue] = useState(hsl.h)
  const sat = Math.max(hsl.s, 70)
  const light = hsl.l || 64

  useEffect(() => {
    const next = hexToHsl(color)
    setHue(next.h)
  }, [color])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="color-picker" ref={rootRef}>
      <button
        type="button"
        className={`color-switch${open ? ' is-open' : ''}`}
        title="Change accent colour"
        aria-label="Change accent colour"
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{ backgroundColor: color }}
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <div className="color-picker-panel" role="dialog" aria-label="Accent colour">
          <div className="color-picker-preview" style={{ backgroundColor: color }} />

          <label className="color-slider">
            <span className="color-slider-label">Hue</span>
            <div className="color-slider-track is-hue">
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={Math.round(hue)}
                aria-label="Hue"
                style={{ '--thumb-color': hslToHex(hue, 100, 50) }}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  setHue(next)
                  onChange?.(hslToHex(next, sat, light))
                }}
              />
            </div>
          </label>
        </div>
      )}
    </div>
  )
}
