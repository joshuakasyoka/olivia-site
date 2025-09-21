import { forwardRef } from 'react'

const IndexList = forwardRef(function IndexList({ items, hoveredItemId, selectedItemId, onIndexHover, onIndexLeave, onIndexClick }, ref) {
  return (
    <div className="index-list" ref={ref}>
      {items.map(item => (
        <div 
          className={`index-row ${hoveredItemId === item.id ? 'hovered' : ''} ${selectedItemId === item.id ? 'selected' : ''}`}
          key={item.id} 
          data-id={item.id}
          data-index-number={String(item.id).padStart(2,'0')}
          onMouseEnter={() => onIndexHover(item.id)}
          onMouseLeave={onIndexLeave}
          onClick={() => {
            onIndexClick(item.id);
            window.open('https://www.itsnicethat.com/authors/olivia-hingley', '_blank');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="date">{item.date}</div>
          <div className="title">{item.title}</div>
          <div className="num">{String(item.id).padStart(2,'0')}</div>
        </div>
      ))}
    </div>
  )
})

export default IndexList
