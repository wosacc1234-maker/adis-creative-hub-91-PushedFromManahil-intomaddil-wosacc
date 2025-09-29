import { useState, useRef } from "react"
import { MoveHorizontal } from "lucide-react"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function BeforeAfterSlider({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Before", 
  afterLabel = "After",
  className = ""
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100
    
    setSliderPosition(Math.max(0, Math.min(100, newPosition)))
  }

  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const newPosition = ((touch.clientX - rect.left) / rect.width) * 100
    
    setSliderPosition(Math.max(0, Math.min(100, newPosition)))
  }

  return (
    <div 
      ref={containerRef}
      className={`relative aspect-video bg-muted rounded-xl overflow-hidden cursor-col-resize select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* After image (background) */}
      <div className="absolute inset-0">
        <img 
          src={afterImage} 
          alt={afterLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 right-4 bg-youtube-red text-white px-3 py-1 rounded-full text-sm font-medium">
          {afterLabel}
        </div>
      </div>

      {/* Before image (overlay with clipping) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={beforeImage} 
          alt={beforeLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 left-4 bg-muted text-foreground px-3 py-1 rounded-full text-sm font-medium">
          {beforeLabel}
        </div>
      </div>

      {/* Slider line and handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-transform duration-100 ease-out"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider handle */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-col-resize hover:scale-110 transition-transform border-2 border-youtube-red"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <MoveHorizontal className="h-5 w-5 text-youtube-red" />
        </div>
      </div>

      {/* Mobile touch area */}
      <div 
        className="absolute inset-0 md:hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  )
}