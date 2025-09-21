export default function Gallery({ items, onThumbClick, onImageHover, onImageLeave, hoveredItemId, selectedItemId }) {
  // Create multiple sets of items to match the carousel in Figma
  const carouselItems = [...items, ...items, ...items, ...items];
  
  // Define specific sizes for each image type to match Figma
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
      'OH_10.png': { width: '57.278px', height: '81.016px' }
    };
    
    const fileName = imageName.split('/').pop();
    return sizeMap[fileName] || { width: '80px', height: '100px' };
  };
  
  return (
    <div className="gallery" role="list" aria-label="Image gallery">
      {carouselItems.map((item, index) => {
        const size = getImageSize(item.image);
        const isHovered = hoveredItemId === item.id;
        const isSelected = selectedItemId === item.id;
        return (
          <button 
            className={`card ${isSelected ? 'selected' : ''}`} 
            key={`${item.id}-${index}`} 
            onClick={() => onThumbClick(item.id)} 
            onMouseEnter={() => onImageHover(item.id)}
            onMouseLeave={onImageLeave}
            aria-label={`Jump to ${item.title}`}
            data-item-id={String(item.id).padStart(2,'0')}
            style={{
              width: size.width,
              height: size.height,
              flexShrink: 0
            }}
          >
            <img 
              src={item.image} 
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isHovered ? 'none' : 'blur(2px)'
              }}
            />
            {isHovered && (
              <div className="hover-cross">×</div>
            )}
          </button>
        );
      })}
    </div>
  )
}
