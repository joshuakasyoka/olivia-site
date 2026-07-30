import { useMemo, useRef, useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ITEMS } from './data/items'
import Header from './components/Header'
import Gallery from './components/Gallery'
import IndexList from './components/IndexList'
import About from './components/About'
import { gsap, useGSAP } from './lib/gsap'
import { RULE_VARIANTS, GuideL } from './components/RowRule'

function HomePage({ introComplete, onIntroComplete, ruleVariant }) {
  const [activeTab, setActiveTab] = useState('articles') // articles | talks
  const [hoveredItemId, setHoveredItemId] = useState(null)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [splitNonce, setSplitNonce] = useState(0)
  const filterType = activeTab === 'talks' ? 'talk' : 'article'
  const pageRef = useRef(null)
  const tabsRef = useRef(null)
  const isFirstTabRender = useRef(true)
  const contentRevealed = useRef(false)

  const items = useMemo(
    () => ITEMS.filter(i => i.type === filterType),
    [filterType]
  )

  const listRef = useRef()

  useEffect(() => {
    document.documentElement.classList.toggle('is-opening', !introComplete)
    return () => document.documentElement.classList.remove('is-opening')
  }, [introComplete])

  // Reveal tabs + index rows once floating photos have landed
  useGSAP(() => {
    const tabs = tabsRef.current?.querySelectorAll('.tab')
    const rows = pageRef.current?.querySelectorAll('.index-row')
    const footer = pageRef.current?.querySelector('.footer')
    if (!tabs?.length) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!introComplete) {
      gsap.set([tabs, rows, footer], { autoAlpha: 0, y: 18 })
      return
    }

    if (contentRevealed.current || reduceMotion) {
      gsap.set([tabs, rows, footer], { autoAlpha: 1, y: 0 })
      contentRevealed.current = true
      return
    }

    contentRevealed.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to(tabs, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
    })
    tl.to(
      rows,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.045,
      },
      '-=0.35'
    )
    tl.to(
      footer,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
      },
      '-=0.35'
    )
  }, { scope: pageRef, dependencies: [introComplete, items] })

  const switchTab = (tab) => {
    if (tab === activeTab) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gallery = pageRef.current?.querySelector('.gallery')
    const list = pageRef.current?.querySelector('.index-list')

    if (reduceMotion || !gallery || !list) {
      setActiveTab(tab)
      setHoveredItemId(null)
      setSelectedItemId(null)
      return
    }

    gsap.to([gallery, list], {
      opacity: 0,
      y: 12,
      duration: 0.22,
      ease: 'power2.in',
      stagger: 0.03,
      overwrite: true,
      onComplete: () => {
        setActiveTab(tab)
        setHoveredItemId(null)
        setSelectedItemId(null)
      },
    })
  }

  // Fade content back in after tab data swaps (skip initial mount)
  useGSAP(() => {
    if (isFirstTabRender.current) {
      isFirstTabRender.current = false
      return
    }

    const gallery = pageRef.current?.querySelector('.gallery')
    const list = pageRef.current?.querySelector('.index-list')
    if (!gallery || !list) return

    gsap.fromTo(
      [gallery, list],
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.05,
        ease: 'power3.out',
        overwrite: true,
        clearProps: 'opacity,transform,visibility',
      }
    )
  }, { scope: pageRef, dependencies: [activeTab] })

  const onThumbClick = (id) => {
    setSelectedItemId(id)
    setSplitNonce((n) => n + 1)
    const el = listRef.current?.querySelector(`[data-id="${id}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(
          el,
          { x: -6 },
          { x: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' }
        )
      }
    }
  }

  const onImageHover = (id) => {
    setHoveredItemId(id)
  }

  const onImageLeave = () => {
    setHoveredItemId(null)
  }

  const onIndexHover = (id) => {
    setHoveredItemId(id)
  }

  const onIndexLeave = () => {
    setHoveredItemId(null)
  }

  const onIndexClick = () => {
    // Selection (and SplitText) only from gallery image clicks
  }

  return (
    <div ref={pageRef} className={introComplete ? undefined : 'is-opening'}>
      <Gallery
        items={items}
        onThumbClick={onThumbClick}
        onImageHover={onImageHover}
        onImageLeave={onImageLeave}
        hoveredItemId={hoveredItemId}
        selectedItemId={selectedItemId}
        playIntro={!introComplete}
        onIntroComplete={onIntroComplete}
      />

      <div className="index-guide" ref={tabsRef}>
        <div className="tab-navigation">
          <button
            className={`tab${activeTab === 'articles' ? ' active' : ''}`}
            onClick={() => switchTab('articles')}
          >
            Writing.
          </button>
          <button
            className={`tab${activeTab === 'talks' ? ' active' : ''}`}
            onClick={() => switchTab('talks')}
          >
            Speaking.
          </button>
        </div>

        <IndexList
          items={items}
          ref={listRef}
          hoveredItemId={hoveredItemId}
          selectedItemId={selectedItemId}
          splitNonce={splitNonce}
          ruleVariant={ruleVariant}
          onIndexHover={onIndexHover}
          onIndexLeave={onIndexLeave}
          onIndexClick={onIndexClick}
        />

        <GuideL variant={ruleVariant} activeKey={activeTab} />
      </div>

      <div className="footer">© Copyright Olivia Hingley - Website designed by Josh Green</div>
    </div>
  )
}

export default function App() {
  const [introComplete, setIntroComplete] = useState(false)
  const [ruleVariant, setRuleVariant] = useState(RULE_VARIANTS[0])
  const [accentColor, setAccentColor] = useState('#FF824A')

  useEffect(() => {
    document.documentElement.style.setProperty('--hover', accentColor)
  }, [accentColor])

  return (
    <div className="container">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header
                introComplete={introComplete}
                ruleVariant={ruleVariant}
                onRuleVariantChange={setRuleVariant}
                accentColor={accentColor}
                onAccentColorChange={setAccentColor}
              />
              <HomePage
                introComplete={introComplete}
                onIntroComplete={() => setIntroComplete(true)}
                ruleVariant={ruleVariant}
              />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Header
                introComplete
                ruleVariant={ruleVariant}
                onRuleVariantChange={setRuleVariant}
                accentColor={accentColor}
                onAccentColorChange={setAccentColor}
              />
              <About />
            </>
          }
        />
      </Routes>
    </div>
  )
}
