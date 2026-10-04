import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import logoImg from '@/assets/New_logo.png'

interface MaintenancePageProps {
  message: string
  timerEnd: string
}

export function MaintenancePage({ message, timerEnd }: MaintenancePageProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const calcTimeLeft = () => {
      if (!timerEnd) {
        setIsExpired(true)
        return
      }
      const end = new Date(timerEnd).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    calcTimeLeft()
    intervalRef.current = setInterval(calcTimeLeft, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerEnd])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F2F9FF] via-white to-[#FFF5F7] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-sky/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFE8EE]/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center px-6 max-w-2xl relative z-10">
        {/* Logo */}
        <div className="mb-12">
          <img src={logoImg} alt="The Tusk & Trunk" className="w-24 h-auto mx-auto mb-6 opacity-90" />
        </div>

        {/* Message */}
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-ink mb-6 tracking-tight">
          We'll Be Back Soon!
        </h1>
        <p className="text-lg md:text-xl text-ink/60 font-medium leading-relaxed mb-16">
          {message || "We're making things better! We'll be back shortly."}
        </p>

        {/* Countdown Timer */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-16">
          {[
            { value: pad(timeLeft.days), label: 'Days' },
            { value: pad(timeLeft.hours), label: 'Hours' },
            { value: pad(timeLeft.minutes), label: 'Minutes' },
            { value: pad(timeLeft.seconds), label: 'Seconds' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-lg border border-ink/5 flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-ink tabular-nums">{item.value}</span>
              </div>
              <span className="text-xs md:text-sm font-bold text-ink/50 mt-2 uppercase tracking-wider">{item.label}</span>
              {i < 3 && (
                <span className="hidden md:block absolute text-2xl font-bold text-ink/20" style={{ marginLeft: '6.5rem' }}>:</span>
              )}
            </div>
          ))}
        </div>

        {isExpired && !timerEnd && (
          <p className="text-ink/40 text-sm font-medium mb-8">We're still working on things. Please check back later.</p>
        )}

        {/* Admin Login Link */}
        <div className="border-t border-ink/10 pt-8">
          <Link
            to="/login"
            className="text-sm text-ink/30 hover:text-ink/60 transition-colors font-medium"
          >
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  )
}
