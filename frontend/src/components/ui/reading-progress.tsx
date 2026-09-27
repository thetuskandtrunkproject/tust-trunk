import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateScroll = () => {
      // Calculate how far down the user has scrolled as a percentage
      const scrollPx = document.documentElement.scrollTop
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = `${(scrollPx / winHeightPx) * 100}%`
      
      // Update state
      setProgress((scrollPx / winHeightPx) * 100)
    }

    // Add scroll event listener
    window.addEventListener('scroll', updateScroll)
    // Initial check
    updateScroll()

    // Remove event listener on cleanup
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-coral pointer-events-none origin-left transition-transform duration-100 ease-out sm:h-[3px] motion-reduce:hidden"
         style={{ transform: `scaleX(${progress / 100})` }}
    />
  )
}
