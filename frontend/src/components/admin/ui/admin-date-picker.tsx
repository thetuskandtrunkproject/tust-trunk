import React, { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminDatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export function AdminDatePicker({ value, onChange, placeholder = "Select date", className = "" }: AdminDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  })
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const year = currentView.getFullYear()
  const month = currentView.getMonth()
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))

  const handlePrevMonth = () => setCurrentView(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentView(new Date(year, month + 1, 1))

  const handleSelectDate = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    onChange(`${yyyy}-${mm}-${dd}`)
    setIsOpen(false)
  }
  
  // Format display string
  let displayStr = placeholder
  if (value) {
    const d = new Date(value)
    if (!isNaN(d.getTime())) {
      displayStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-[#C9CCCF] text-[#202223] rounded-full px-4 h-[36px] text-[13px] shadow-sm hover:border-[#8C9196] focus:outline-none focus:ring-2 focus:ring-[#005bd3] transition-all min-w-[140px]"
      >
        <span className="font-medium truncate pr-2">{displayStr}</span>
        <CalendarIcon className="w-4 h-4 text-[#5C5F62]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-[#E3E3E3] rounded-xl shadow-lg z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-[#F4F6F8] rounded-md transition-colors text-[#5C5F62]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-semibold text-[13px] text-[#202223]">
              {MONTHS[month]} {year}
            </div>
            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-[#F4F6F8] rounded-md transition-colors text-[#5C5F62]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-[11px] font-semibold text-[#8C9196] py-1">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />
              
              const isSelected = value && date.getTime() === new Date(value).getTime()
              const isToday = new Date().toDateString() === date.toDateString()
              
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-full text-[13px] mx-auto transition-colors
                    ${isSelected ? 'bg-[#303030] text-white font-semibold' : 'text-[#202223] hover:bg-[#F4F6F8]'}
                    ${isToday && !isSelected ? 'border border-[#C9CCCF]' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

