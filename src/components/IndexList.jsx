import { forwardRef, useRef, useImperativeHandle, memo } from 'react'
import { gsap, useGSAP, SplitText } from '../lib/gsap'
import RowRule from './RowRule'

/**
 * Memoized so IndexList hover/select re-renders cannot reset the title
 * children and wipe the SplitText character nodes.
 * SplitText plays only when playNonce increments (gallery image click).
 */
const IndexTitle = memo(function IndexTitle({ text, playNonce }) {
  const titleRef = useRef(null)
  const splitRef = useRef(null)
  const lastNonce = useRef(0)

  useGSAP(() => {
    const title = titleRef.current
    if (!title) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const split = SplitText.create(title, {
      type: 'words,chars',
      mask: 'chars',
      charsClass: 'char',
      wordsClass: 'word',
      aria: 'auto',
    })
    splitRef.current = split
    gsap.set(split.chars, { yPercent: 0 })

    return () => {
      split.revert()
      splitRef.current = null
    }
  }, { scope: titleRef, dependencies: [text], revertOnUpdate: true })

  useGSAP(() => {
    if (!playNonce || playNonce === lastNonce.current) return
    lastNonce.current = playNonce

    const split = splitRef.current
    if (!split?.chars?.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.fromTo(
      split.chars,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 0.45,
        stagger: 0.014,
        ease: 'power3.out',
        overwrite: true,
      }
    )
  }, { dependencies: [playNonce] })

  return (
    <div className="title" ref={titleRef}>
      {text}
    </div>
  )
})

const IndexList = forwardRef(function IndexList(
  { items, hoveredItemId, selectedItemId, splitNonce, ruleVariant, onIndexHover, onIndexLeave, onIndexClick },
  ref
) {
  const listRef = useRef(null)

  useImperativeHandle(ref, () => listRef.current)

  return (
    <div className="index-list" ref={listRef}>
      {items.map(item => (
        <div
          className={`index-row${hoveredItemId === item.id ? ' hovered' : ''}${selectedItemId === item.id ? ' selected' : ''}`}
          key={item.id}
          data-id={item.id}
          onMouseEnter={() => onIndexHover(item.id)}
          onMouseLeave={onIndexLeave}
          onClick={() => {
            onIndexClick(item.id)
            const href =
              item.url || 'https://www.itsnicethat.com/authors/olivia-hingley'
            window.open(href, '_blank', 'noopener,noreferrer')
          }}
        >
          <div className="date">{item.date}</div>
          <IndexTitle
            text={item.title}
            playNonce={selectedItemId === item.id ? splitNonce : 0}
          />
          <div className="num">{String(item.id).padStart(2, '0')}</div>
          <RowRule variant={ruleVariant} />
        </div>
      ))}
    </div>
  )
})

export default IndexList
