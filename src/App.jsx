import { useMemo, useRef, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ITEMS } from './data/items'
import Header from './components/Header'
import Gallery from './components/Gallery'
import IndexList from './components/IndexList'
import About from './components/About'

function HomePage() {
  const [activeTab, setActiveTab] = useState('articles') // articles | talks
  const [hoveredItemId, setHoveredItemId] = useState(null)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const filterType = activeTab === 'talks' ? 'talk' : 'article'

  const items = useMemo(
    () => ITEMS.filter(i => i.type === filterType),
    [filterType]
  )

  const listRef = useRef()

  const onThumbClick = (id) => {
    setSelectedItemId(id)
    const el = listRef.current?.querySelector(`[data-id="${id}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  const onIndexClick = (id) => {
    setSelectedItemId(id)
  }

  return (
    <>
      <Gallery 
        items={items} 
        onThumbClick={onThumbClick}
        onImageHover={onImageHover}
        onImageLeave={onImageLeave}
        hoveredItemId={hoveredItemId}
        selectedItemId={selectedItemId}
      />
      
      <div className="tab-navigation">
        {activeTab === 'articles' ? (
          <>
            <button 
              className="tab active" 
              onClick={() => setActiveTab('articles')}
            >
              Writing.
            </button>
            <button 
              className="tab" 
              onClick={() => setActiveTab('talks')}
            >
              Speaking.
            </button>
          </>
        ) : (
          <>
            <button 
              className="tab active" 
              onClick={() => setActiveTab('talks')}
            >
              Speaking.
            </button>
            <button 
              className="tab" 
              onClick={() => setActiveTab('articles')}
            >
              Writing.
            </button>
          </>
        )}
      </div>

      <IndexList 
        items={items} 
        ref={listRef} 
        hoveredItemId={hoveredItemId}
        selectedItemId={selectedItemId}
        onIndexHover={onIndexHover}
        onIndexLeave={onIndexLeave}
        onIndexClick={onIndexClick}
      />
      
      <div className="footer">© Copyright Olivia Hingley - Website designed by Josh Green</div>
    </>
  )
}

export default function App() {
  return (
    <div className="container">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}
