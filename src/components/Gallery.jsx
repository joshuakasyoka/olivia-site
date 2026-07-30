import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

const INDEX_SHAPES = ['circle', 'square', 'diamond', 'hexagon', 'pentagon']

const INDEX_SHAPE_PATHS = {
  circle: 'M12 2.5 A9.5 9.5 0 1 1 11.99 2.5',
  square: 'M4.5 4.5 H19.5 V19.5 H4.5 Z',
  diamond: 'M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z',
  hexagon: 'M12 2.5 L19.5 7 V17 L12 21.5 L4.5 17 V7 Z',
  pentagon: 'M12 2.5 L20.5 9.1 L17.2 20.2 H6.8 L3.5 9.1 Z',
}

const getIndexShape = (id) => INDEX_SHAPES[(Math.max(1, Number(id) || 1) - 1) % INDEX_SHAPES.length]

export default function Gallery({
  items,
  onThumbClick,
  onImageHover,
  onImageLeave,
  hoveredItemId,
  selectedItemId,
  playIntro = false,
  onIntroComplete,
}) {
  const rootRef = useRef(null)
  const galleryRef = useRef(null)
  const trackRef = useRef(null)
  const monogramRef = useRef(null)
  const introPlayed = useRef(false)

  const carouselItems = [...items, ...items, ...items, ...items]

  const getImageSize = (imageName) => {
    const sizeMap = {
      'Oh_01.png': { width: '63.566px', height: '47.675px' },
      'OH_8.png': { width: '84.22px', height: '119.779px' },
      'OH_4.png': { width: '77.653px', height: '109.351px' },
      'OH_3.png': { width: '84.79px', height: '127.217px' },
      'OH_7.png': { width: '91.625px', height: '116.058px' },
      'OH_02.png': { width: '91.608px', height: '128.569px' },
      'OH_9.png': { width: '88.635px', height: '101.253px' },
      'OH_6.png': { width: '88.692px', height: '88.692px' },
      'OH_10.png': { width: '57.278px', height: '81.016px' },
    }

    const fileName = imageName.split('/').pop()
    return sizeMap[fileName] || { width: '80px', height: '100px' }
  }

  useGSAP((context, contextSafe) => {
    const root = rootRef.current
    const gallery = galleryRef.current
    const track = trackRef.current
    const monogram = monogramRef.current
    if (!root || !gallery || !track) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = gsap.utils.toArray(track.querySelectorAll('.card'))
    if (!cards.length) return

    const uniqueCount = Math.max(1, Math.min(items.length, 10))
    const heroes = cards.slice(0, uniqueCount)
    const rest = cards.slice(uniqueCount)
    const heroImages = heroes.map((card) => card.querySelector('img')).filter(Boolean)
    const placeholders = []

    const startMarquee = () => {
      const loopDistance = track.scrollWidth / 4
      if (!loopDistance) return null

      track.style.willChange = 'transform'
      const marquee = gsap.to(track, {
        x: -loopDistance,
        duration: Math.max(28, loopDistance / 18),
        ease: 'none',
        repeat: -1,
      })

      let idleTimer = null
      let isFloating = false
      let floatLayer = null
      let floatSlots = []
      const floatTweens = []
      const IDLE_MS = 7000

      const clearFloatTweens = () => {
        floatTweens.forEach((t) => t.kill())
        floatTweens.length = 0
      }

      const restoreFloatCards = () => {
        floatSlots.forEach(({ card, placeholder }) => {
          if (placeholder?.parentNode) {
            placeholder.parentNode.insertBefore(card, placeholder)
            placeholder.remove()
          } else if (track && card.parentNode !== track) {
            track.appendChild(card)
          }
          gsap.set(card, {
            clearProps: 'position,left,top,x,y,width,zIndex,rotation,transformOrigin',
          })
        })
        floatSlots = []
        floatLayer?.remove()
        floatLayer = null
      }

      const pauseMarquee = contextSafe(() => {
        if (!isFloating) marquee.pause()
      })
      const playMarquee = contextSafe(() => {
        if (!isFloating) marquee.play()
      })

      const snapHome = contextSafe(() => {
        if (!isFloating) return
        isFloating = false
        gallery.classList.remove('is-idle-float')
        clearFloatTweens()

        if (!floatSlots.length) {
          restoreFloatCards()
          marquee.play()
          return
        }

        let pending = floatSlots.length
        floatSlots.forEach(({ card, placeholder }, i) => {
          const home = placeholder.getBoundingClientRect()
          gsap.to(card, {
            left: home.left,
            top: home.top,
            rotation: 0,
            duration: 0.75,
            ease: 'power3.inOut',
            delay: i * 0.018,
            overwrite: true,
            onComplete: () => {
              pending -= 1
              if (pending > 0) return
              restoreFloatCards()
              if (!isFloating) marquee.play()
            },
          })
        })
      })

      const beginFloat = contextSafe(() => {
        if (isFloating || reduceMotion) return
        isFloating = true
        gallery.classList.add('is-idle-float')
        marquee.pause()

        const vw = window.innerWidth
        const vh = window.innerHeight
        const visible = cards.filter((card) => {
          const r = card.getBoundingClientRect()
          return r.right > -60 && r.left < vw + 60 && r.bottom > 0 && r.top < vh
        })
        const targets = (visible.length ? visible : cards.slice(0, uniqueCount)).slice(0, 16)

        floatLayer = document.createElement('div')
        floatLayer.className = 'idle-float-layer'
        floatLayer.setAttribute('aria-hidden', 'true')
        document.body.appendChild(floatLayer)

        targets.forEach((card, i) => {
          const r = card.getBoundingClientRect()
          const w = card.offsetWidth || 80
          const h = card.offsetHeight || card.querySelector('img')?.offsetHeight || 100
          const pad = 20
          const maxLeft = Math.max(pad, vw - w - pad)
          const maxTop = Math.max(pad, vh - h - pad)

          const ph = document.createElement('span')
          ph.className = 'card-placeholder'
          ph.setAttribute('aria-hidden', 'true')
          ph.style.cssText = `width:${w}px;height:${h}px;flex-shrink:0;display:block;visibility:hidden;pointer-events:none;`
          card.parentNode.insertBefore(ph, card)

          floatSlots.push({ card, placeholder: ph })
          floatLayer.appendChild(card)

          gsap.set(card, {
            position: 'absolute',
            left: r.left,
            top: r.top,
            x: 0,
            y: 0,
            width: w,
            zIndex: 10 + i,
            rotation: 0,
            transformOrigin: '50% 50%',
          })

          const scatter = gsap.to(card, {
            left: gsap.utils.random(pad, maxLeft),
            top: gsap.utils.random(pad, maxTop),
            rotation: gsap.utils.random(-10, 10),
            duration: gsap.utils.random(2.4, 3.8),
            delay: i * 0.05,
            ease: 'sine.out',
            overwrite: true,
            onComplete: () => {
              if (!isFloating) return
              const drift = gsap.to(card, {
                left: () =>
                  gsap.utils.clamp(
                    pad,
                    maxLeft,
                    Number(gsap.getProperty(card, 'left')) + gsap.utils.random(-140, 140)
                  ),
                top: () =>
                  gsap.utils.clamp(
                    pad,
                    maxTop,
                    Number(gsap.getProperty(card, 'top')) + gsap.utils.random(-110, 110)
                  ),
                rotation: () => gsap.utils.random(-8, 8),
                duration: () => gsap.utils.random(4.5, 7.5),
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                overwrite: 'auto',
              })
              floatTweens.push(drift)
            },
          })
          floatTweens.push(scatter)
        })
      })

      const armIdle = contextSafe(() => {
        window.clearTimeout(idleTimer)
        idleTimer = window.setTimeout(beginFloat, IDLE_MS)
      })

      const onActivity = contextSafe(() => {
        armIdle()
        snapHome()
      })

      gallery.addEventListener('mouseenter', pauseMarquee)
      gallery.addEventListener('mouseleave', playMarquee)
      gallery.addEventListener('focusin', pauseMarquee)
      gallery.addEventListener('focusout', playMarquee)

      const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll']
      if (!reduceMotion) {
        activityEvents.forEach((type) => window.addEventListener(type, onActivity, { passive: true }))
        armIdle()
      }

      return () => {
        window.clearTimeout(idleTimer)
        clearFloatTweens()
        gallery.classList.remove('is-idle-float')
        restoreFloatCards()
        activityEvents.forEach((type) => window.removeEventListener(type, onActivity))
        gallery.removeEventListener('mouseenter', pauseMarquee)
        gallery.removeEventListener('mouseleave', playMarquee)
        gallery.removeEventListener('focusin', pauseMarquee)
        gallery.removeEventListener('focusout', playMarquee)
        marquee.kill()
        track.style.willChange = ''
        gsap.set(cards, { x: 0, y: 0, rotation: 0 })
      }
    }

    let stopMarquee = null
    let finished = false
    let masterTl = null

    const cleanupPlaceholders = () => {
      placeholders.forEach((ph) => ph.remove())
      placeholders.length = 0
    }

    const finishIntro = () => {
      if (finished) return
      finished = true
      gallery.dataset.introDone = '1'
      document.documentElement.classList.remove('is-intro-lock')

      masterTl?.kill()
      masterTl = null

      gsap.set(rest, { autoAlpha: 1 })
      gsap.set(heroImages, { clearProps: 'filter' })
      if (monogram) gsap.set(monogram, { autoAlpha: 0, display: 'none' })

      stopMarquee = startMarquee()
    }

    let handoffDone = false
    const settleIntoRow = () => {
      if (handoffDone) return
      handoffDone = true

      // Lock to live slot rects one last time (top-left origin → no visual drift)
      heroes.forEach((card, i) => {
        const ph = placeholders[i]
        if (!ph) return
        const r = ph.getBoundingClientRect()
        gsap.set(card, {
          left: r.left,
          top: r.top,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          transformOrigin: '0% 0%',
        })
      })

      heroes.forEach((card, i) => {
        const ph = placeholders[i]
        if (ph) track.insertBefore(card, ph)
      })

      cleanupPlaceholders()
      gsap.set(heroes, {
        clearProps: 'position,left,top,zIndex,rotation,scale,x,y,width,transformOrigin',
      })
      gallery.classList.remove('is-intro')
      finishIntro()
    }

    if (reduceMotion || !playIntro || introPlayed.current || gallery.dataset.introDone === '1') {
      gsap.set(cards, { autoAlpha: 1, clearProps: 'position,left,top,zIndex,rotation,scale,x,y' })
      if (monogram) gsap.set(monogram, { autoAlpha: 0, display: 'none' })
      stopMarquee = startMarquee()
      if (!introPlayed.current) {
        introPlayed.current = true
        gallery.dataset.introDone = '1'
        onIntroComplete?.()
      }
      return () => stopMarquee?.()
    }

    introPlayed.current = true
    gallery.classList.add('is-intro')
    document.documentElement.classList.add('is-intro-lock')

    const monoText = monogram?.querySelector('.intro-monogram-text')

    // Hide the looping duplicates during the gather
    gsap.set(rest, { autoAlpha: 0 })
    gsap.set(heroes, { autoAlpha: 1 })

    // Invisible spacers keep the row slots while heroes float as fixed layers
    heroes.forEach((card) => {
      const ph = document.createElement('span')
      ph.className = 'card-placeholder'
      ph.setAttribute('aria-hidden', 'true')
      const w = card.offsetWidth || 80
      const h = card.offsetHeight || card.querySelector('img')?.offsetHeight || 100
      ph.style.cssText = `width:${w}px;height:${h}px;flex-shrink:0;display:block;visibility:hidden;pointer-events:none;`
      card.after(ph)
      placeholders.push(ph)
    })

    const vw = window.innerWidth
    const vh = window.innerHeight
    const cx = vw / 2
    const cy = vh / 2
    // Compact cluster around the monogram — clear a small hole for O.H
    const clusterRx = Math.min(220, vw * 0.22)
    const clusterRy = Math.min(180, vh * 0.2)
    const clearR = Math.min(72, Math.min(clusterRx, clusterRy) * 0.45)

    heroes.forEach((card, i) => {
      const w = card.offsetWidth || 80
      const h = card.offsetHeight || 100
      const angle = (i / heroes.length) * Math.PI * 2 + gsap.utils.random(-0.22, 0.22)
      // Prefer mid-ring so tiles sit around the monogram, not at the edges
      const t = gsap.utils.random(0.35, 0.95)
      const rx = clearR + (clusterRx - clearR) * t
      const ry = clearR + (clusterRy - clearR) * t
      const left = cx + Math.cos(angle) * rx - w / 2 + gsap.utils.random(-18, 18)
      const top = cy + Math.sin(angle) * ry - h / 2 + gsap.utils.random(-14, 14)

      gsap.set(card, {
        position: 'fixed',
        left,
        top,
        x: 0,
        y: 0,
        width: w,
        zIndex: 220 + i,
        rotation: gsap.utils.random(-14, 14),
        scale: gsap.utils.random(0.98, 1.18),
        transformOrigin: '0% 0%',
        autoAlpha: 0,
      })
    })

    gsap.set(heroImages, { filter: 'blur(12px)' })
    if (monogram) {
      gsap.set(monogram, { display: 'flex', autoAlpha: 1 })
      if (monoText) gsap.set(monoText, { autoAlpha: 1 })
    }

    // Auto-play intro — no scroll required
    masterTl = gsap.timeline()

    masterTl.to(
      heroes,
      {
        autoAlpha: 1,
        duration: 0.55,
        stagger: { each: 0.05, from: 'random' },
        ease: 'power2.out',
      },
      0.45
    )

    masterTl.to({}, { duration: 1.4 })

    // Reveal final page chrome during gather so slots are already at end layout
    masterTl.add(() => {
      onIntroComplete?.()
    })

    const gatherStarts = heroes.map((card) => ({
      left: Number(gsap.getProperty(card, 'left')) || card.getBoundingClientRect().left,
      top: Number(gsap.getProperty(card, 'top')) || card.getBoundingClientRect().top,
      rotation: gsap.getProperty(card, 'rotation') || 0,
      scale: gsap.getProperty(card, 'scale') || 1,
    }))
    const gatherProgress = { value: 0 }

    masterTl.add(() => {
      heroes.forEach((card, i) => {
        gatherStarts[i] = {
          left: Number(gsap.getProperty(card, 'left')) || 0,
          top: Number(gsap.getProperty(card, 'top')) || 0,
          rotation: gsap.getProperty(card, 'rotation') || 0,
          scale: gsap.getProperty(card, 'scale') || 1,
        }
      })
    })

    masterTl.to(
      gatherProgress,
      {
        value: 1,
        duration: 2.4,
        ease: 'power3.inOut',
        onUpdate: () => {
          const t = gatherProgress.value
          heroes.forEach((card, i) => {
            const ph = placeholders[i]
            if (!ph) return
            const slot = ph.getBoundingClientRect()
            const start = gatherStarts[i]
            gsap.set(card, {
              left: gsap.utils.interpolate(start.left, slot.left, t),
              top: gsap.utils.interpolate(start.top, slot.top, t),
              rotation: gsap.utils.interpolate(start.rotation, 0, t),
              scale: gsap.utils.interpolate(start.scale, 1, t),
              transformOrigin: '0% 0%',
            })
          })
        },
      },
      'gather'
    )

    masterTl.to(
      heroImages,
      {
        filter: 'blur(2px)',
        duration: 2.4,
        ease: 'power3.inOut',
      },
      'gather'
    )

    if (monogram) {
      masterTl.to(
        monogram,
        {
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power2.in',
        },
        'gather+=0.35'
      )
    }

    masterTl.call(settleIntoRow)

    return () => {
      masterTl?.kill()
      stopMarquee?.()
      cleanupPlaceholders()
      gallery.classList.remove('is-intro')
      document.documentElement.classList.remove('is-intro-lock')
      if (!gallery.dataset.introDone) introPlayed.current = false
    }
  }, { scope: rootRef, dependencies: [items, playIntro], revertOnUpdate: true })

  const handleHoverEnter = (id) => {
    onImageHover(id)
  }

  const handleHoverLeave = () => {
    onImageLeave()
  }

  return (
    <div className="gallery-root" ref={rootRef}>
      <div className="intro-monogram" ref={monogramRef} aria-hidden="true">
        <div className="intro-monogram-text">O.H</div>
      </div>
      <div className="gallery" ref={galleryRef} role="list" aria-label="Image gallery">
        <div className="gallery-track" ref={trackRef}>
          {carouselItems.map((item, index) => {
            const size = getImageSize(item.image)
            const isHovered = hoveredItemId === item.id
            const isSelected = selectedItemId === item.id
            const indexShape = getIndexShape(item.id)
            return (
              <button
                className={`card${isSelected ? ' selected' : ''}${isHovered ? ' is-hovered' : ''}`}
                key={`${item.id}-${index}`}
                onClick={() => onThumbClick(item.id)}
                onMouseEnter={() => handleHoverEnter(item.id)}
                onMouseLeave={handleHoverLeave}
                aria-label={`Jump to ${item.title}`}
                data-item-id={String(item.id).padStart(2, '0')}
                style={{
                  width: size.width,
                  flexShrink: 0,
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: size.height,
                    objectFit: 'cover',
                    filter: isHovered ? 'none' : 'blur(2px)',
                  }}
                />
                <span className={`card-index is-${indexShape}`} aria-hidden="true">
                  <svg className="card-index-shape" viewBox="0 0 24 24" focusable="false">
                    <path
                      d={INDEX_SHAPE_PATHS[indexShape]}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeDasharray="2 2.25"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <span className="card-index-num">{String(item.id).padStart(2, '0')}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
