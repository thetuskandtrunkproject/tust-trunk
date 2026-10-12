import React from 'react'
import logoImg from '@/assets/New_logo.png'

interface BrandLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string
}

/**
 * BrandLogo — Single swappable logo component.
 * TEMP: Currently using New_logo.png (clean transparent elephant sticker) as placeholder.
 * Designed so the designer's multi-layer vector SVG can drop in seamlessly with separated layers.
 */
export const BrandLogo = React.forwardRef<HTMLImageElement, BrandLogoProps>(
  ({ className = '', style, alt = 'Tusk & Trunk', ...props }, ref) => {
    return (
      <img
        ref={ref}
        src={logoImg}
        alt={alt}
        className={`object-contain select-none ${className}`}
        style={style}
        {...props}
      />
    )
  }
)

BrandLogo.displayName = 'BrandLogo'
