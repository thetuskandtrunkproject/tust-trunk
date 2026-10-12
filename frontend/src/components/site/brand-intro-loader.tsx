import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { BrandLogo } from './brand-logo'

interface BrandIntroLoaderProps {
  /** Fired when match cut begins or during frame-by-frame scrubbing */
  onMatchCut?: (targetProgress?: number) => void
  /** Fired when intro finishes completely and overlay is dismissed */
  onComplete?: () => void
}

/**
 * BrandIntroLoader — Full-screen intro loader with true match-cut into Hero hanging tag.
 *
 * Storyboard:
 *   0.0s – 1.4s: Build phase (TEMP: scale-in & subtle squash/stretch on placeholder until designer's vector SVG).
 *   1.4s – 1.6s: Hold / breath. Gated by fonts & hero image decoding (capped at 4s total).
 *   1.6s – 2.4s: Match cut. Logo travels (x, y, scale with power3.inOut) from center to hero tag.
 *                Hero reveals around travelling logo (photo wipes from right, headlines rise, tag drops in).
 *   2.4s       : Landing frame. Single-frame handoff: hide loader clone, reveal tag's real logo.
 *   2.4s – 2.9s: Settle. CTA buttons & trust chips stagger in.
 */
export function BrandIntroLoader({ onMatchCut, onComplete }: BrandIntroLoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const logoWrapperRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const masterTlRef = useRef<gsap.core.Timeline | null>(null)
  const isSkippedRef = useRef(false)

  const finish = useCallback(() => {
    sessionStorage.setItem('tusk_intro_seen', 'true')
    document.body.style.overflow = ''
    if (overlayRef.current) {
      overlayRef.current.style.visibility = 'hidden'
      overlayRef.current.style.display = 'none'
      overlayRef.current.style.pointerEvents = 'none'
    }
    // Ensure tag logo in hero is visible if not already
    const tagLogo = document.querySelector('[data-brand-tag-logo]') as HTMLElement
    if (tagLogo) {
      gsap.set(tagLogo, { visibility: 'visible', opacity: 1 })
    }
    onComplete?.()
  }, [onComplete])

  const skip = useCallback(() => {
    if (isSkippedRef.current) return
    isSkippedRef.current = true
    if (masterTlRef.current) {
      masterTlRef.current.kill()
    }
    if (logoRef.current) {
      gsap.killTweensOf(logoRef.current)
    }
    onMatchCut?.()
    finish()
  }, [finish, onMatchCut])

  useEffect(() => {
    // 1. Accessibility: prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      const overlay = overlayRef.current
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            onMatchCut?.()
            finish()
          }
        })
      } else {
        finish()
      }
      return
    }

    // Lock scrolling during intro
    document.body.style.overflow = 'hidden'

    // Click or Escape to skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip()
    }
    const handleClick = () => skip()

    window.addEventListener('keydown', handleKeyDown)
    const overlay = overlayRef.current
    if (overlay) overlay.addEventListener('click', handleClick)

    let isCancelled = false

    // 2. Readiness gating (fonts ready + hero image decode)
    const fontPromise = document.fonts ? document.fonts.ready : Promise.resolve()
    const heroImgEl = document.querySelector('.hero-parallax-img') as HTMLImageElement
    const imgPromise = heroImgEl
      ? (heroImgEl.complete ? Promise.resolve() : heroImgEl.decode().catch(() => {}))
      : Promise.resolve()

    const readyPromise = Promise.all([fontPromise, imgPromise])
    // Cap total wait time at 4 seconds
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 4000))
    const gatingPromise = Promise.race([readyPromise, timeoutPromise])

    const logo = logoRef.current
    const wrapper = logoWrapperRef.current

    if (!logo || !wrapper || !overlay) return

    window.scrollTo(0, 0)

    const searchParams = new URLSearchParams(window.location.search)
    const pauseAtParam = searchParams.get('pauseAt')
    const pauseAt = pauseAtParam !== null ? parseFloat(pauseAtParam) : null

    // Initial state: logo starts scaled down, backdrop opaque
    gsap.set(wrapper, { x: 0, y: 0, scale: 1 })
    gsap.set(logo, { scale: 0.85, opacity: 0, transformOrigin: 'center center' })

    const tl = gsap.timeline()
    masterTlRef.current = tl

    // === PHASE 1: BUILD (0s – 1.4s) ===
    // TEMP: scale-in & squash/stretch on placeholder logo until designer's multi-layer SVG is provided
    tl.to(logo, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: 'back.out(1.2)',
    }, 0.1)

    // Subtle inflation pulse toward end of build
    tl.to(logo, {
      scale: 1.02,
      duration: 0.2,
      ease: 'power1.inOut',
    }, 1.2)

    // === PHASE 2: HOLD / BREATH (1.4s – 1.6s) ===
    tl.to(logo, {
      scale: 1.0,
      duration: 0.2,
      ease: 'power1.inOut',
    }, 1.4)

    // If deterministic inspection is requested for Phase 1 or 2:
    if (pauseAt !== null && pauseAt < 1.6) {
      tl.seek(pauseAt).pause()
      return
    }

    // Gate the match cut on asset readiness
    tl.call(async () => {
      if (isCancelled || isSkippedRef.current) return

      // Pause master timeline while waiting if gating hasn't resolved yet
      if (pauseAt === null) {
        tl.pause()
        await gatingPromise
        if (isCancelled || isSkippedRef.current) return
      }

      // Measure landing coordinates from live hero DOM
      const tagLogo = document.querySelector('[data-brand-tag-logo]') as HTMLElement
      const cloneLogo = logoRef.current
      const currentOverlay = overlayRef.current

      if (!tagLogo || !cloneLogo || !currentOverlay) {
        finish()
        return
      }

      // Measure target rect in viewport coordinates
      const tagRect = tagLogo.getBoundingClientRect()
      const cloneRect = cloneLogo.getBoundingClientRect()

      if (tagRect.width === 0 || cloneRect.width === 0) {
        finish()
        return
      }

      // Account for any initial CSS or GSAP transforms on the tag container to get the true rest target
      const tagParent = tagLogo.closest('.hero-intro-tag') as HTMLElement | null
      const tagOffsetY = tagParent ? ((gsap.getProperty(tagParent, 'y') as number) || 0) : 0
      const tagOffsetX = tagParent ? ((gsap.getProperty(tagParent, 'x') as number) || 0) : 0

      const targetCenterX = (tagRect.left - tagOffsetX) + tagRect.width / 2
      const targetCenterY = (tagRect.top - tagOffsetY) + tagRect.height / 2

      const dx = targetCenterX - (cloneRect.left + cloneRect.width / 2)
      const dy = targetCenterY - (cloneRect.top + cloneRect.height / 2)
      const scaleTarget = tagRect.width / cloneRect.width

      // At 1.6s, match cut begins:
      // The overlay background clears so the hero (which has identical background gradient on its left panel)
      // is revealed around the travelling logo.
      currentOverlay.style.background = 'transparent'
      currentOverlay.style.pointerEvents = 'none'

      // If inspecting a specific moment in the match cut (1.6s – 2.4s)
      if (pauseAt !== null && pauseAt >= 1.6 && pauseAt < 2.4) {
        const progress = (pauseAt - 1.6) / 0.8
        onMatchCut?.(progress)
        const travelTween = gsap.to(cloneLogo, {
          x: dx,
          y: dy,
          scale: scaleTarget,
          duration: 0.8,
          ease: 'power3.inOut',
        })
        travelTween.progress(progress).pause()
        return
      }

      // If inspecting landing or settle (>= 2.4s)
      if (pauseAt !== null && pauseAt >= 2.4) {
        onMatchCut?.(pauseAt >= 2.9 ? 1.0 : (pauseAt - 1.6) / 1.3)
        gsap.set(cloneLogo, { visibility: 'hidden' })
        gsap.set(tagLogo, { visibility: 'visible', opacity: 1 })
        gsap.set(currentOverlay, { visibility: 'hidden', display: 'none', pointerEvents: 'none' })
        return
      }

      // Trigger hero reveal around travelling logo
      onMatchCut?.()

      // === PHASE 3: THE MATCH CUT (1.6s – 2.4s, 0.8s continuous travel) ===
      gsap.to(cloneLogo, {
        x: dx,
        y: dy,
        scale: scaleTarget,
        duration: 0.8,
        ease: 'power3.inOut',
        onComplete: () => {
          if (isCancelled || isSkippedRef.current) return
          // === LANDING FRAME HANDOFF (2.4s) ===
          // Single-frame instantaneous handoff: hide loader clone, show tag's real logo
          gsap.set(cloneLogo, { visibility: 'hidden' })
          gsap.set(tagLogo, { visibility: 'visible', opacity: 1 })

          // Hide overlay (backdrop gradient matched hero left panel, so no flash)
          gsap.set(currentOverlay, { visibility: 'hidden', display: 'none', pointerEvents: 'none' })
          document.body.style.overflow = ''
          sessionStorage.setItem('tusk_intro_seen', 'true')
          onComplete?.()
        }
      })
    }, [], 1.6)

    return () => {
      isCancelled = true
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
      if (overlay) overlay.removeEventListener('click', handleClick)
      if (masterTlRef.current) masterTlRef.current.kill()
      if (logoRef.current) gsap.killTweensOf(logoRef.current)
    }
  }, [finish, onMatchCut, onComplete, skip])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center select-none"
      style={{
        // Identical background gradient to hero's left panel so backdrop never changes at cut
        background: 'linear-gradient(to bottom, #FFF5F8, #FAF7F9, #FFFFFF)',
      }}
      aria-hidden="true"
    >
      {/* Centered logo container — NO cards, NO tiles, NO text, NO progress bars */}
      <div ref={logoWrapperRef} className="relative flex items-center justify-center">
        <BrandLogo
          ref={logoRef}
          className="w-[280px] h-auto md:w-[320px] max-w-[80vw]"
          style={{
            willChange: 'transform, opacity',
            transformOrigin: 'center center',
          }}
        />
      </div>
    </div>
  )
}
