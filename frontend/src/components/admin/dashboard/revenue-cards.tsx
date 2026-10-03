import { TrendingUp, TrendingDown, Package, AlertTriangle, IndianRupee, Clock, BarChart3 } from 'lucide-react'
import { AdminCard } from '@/components/admin/ui/primitives'
import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

interface RevenueCardsProps {
  periodRevenue: number
  previousPeriodRevenue: number
  avgDailyRevenue: number
  totalOrders: number
  avgOrderValue: number
  todayRevenue?: number
  weekRevenue?: number
  monthRevenue?: number
  yearRevenue?: number
  timeRange?: string
}

function AnimatedText({ text }: { text: string }) {
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, y: -4 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      )
    }
  }, [text])

  return (
    <span ref={elementRef} className="inline-block">
      {text}
    </span>
  )
}

function AnimatedNumber({ value, isCurrency = false }: { value: number, isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValue = useRef(value)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const obj = { val: prevValue.current }

    if (elementRef.current && prevValue.current !== value) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0.6, scale: 0.94, y: -2 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      )
    }

    gsap.to(obj, {
      val: value,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        setDisplayValue(obj.val)
      }
    })
    prevValue.current = value
  }, [value])

  return (
    <span ref={elementRef} className="inline-block transition-all origin-left">
      {isCurrency ? `₹${Math.round(displayValue).toLocaleString('en-IN')}` : Math.round(displayValue).toLocaleString('en-IN')}
    </span>
  )
}

export function RevenueCards({ 
  periodRevenue, 
  previousPeriodRevenue, 
  avgDailyRevenue,
  totalOrders,
  avgOrderValue,
  todayRevenue = 0,
  weekRevenue = 0,
  monthRevenue = 0,
  yearRevenue = 0,
  timeRange
}: RevenueCardsProps) {
  const [cardMode, setCardMode] = useState<'overview' | 'metrics'>('overview')
  
  const revenueChange = previousPeriodRevenue > 0
    ? ((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
    : 0
  const isRevenueUp = revenueChange >= 0

  const getCard1Title = () => {
    switch (timeRange) {
      case '1d': return "Today's Revenue"
      case '7d': return "This Week's Revenue"
      case '30d': return "This Month's Revenue"
      case '1y': return "This Year's Revenue"
      case 'custom': return "Total Revenue"
      default: return "Total Revenue"
    }
  }

  // Define 4 cards depending on cardMode
  const cardsData = cardMode === 'overview' ? [
    {
      title: "Today's Revenue",
      value: todayRevenue,
      isCurrency: true,
      icon: <IndianRupee className="w-4 h-4" />
    },
    {
      title: "This Week",
      value: weekRevenue,
      isCurrency: true,
      icon: <IndianRupee className="w-4 h-4" />
    },
    {
      title: "This Month",
      value: monthRevenue,
      isCurrency: true,
      icon: <IndianRupee className="w-4 h-4" />
    },
    {
      title: "This Year",
      value: yearRevenue,
      isCurrency: true,
      icon: <IndianRupee className="w-4 h-4" />
    },
  ] : [
    {
      title: getCard1Title(),
      value: periodRevenue,
      isCurrency: true,
      icon: <IndianRupee className="w-4 h-4" />,
      showChange: previousPeriodRevenue > 0
    },
    {
      title: "Avg Daily Revenue",
      value: avgDailyRevenue,
      isCurrency: true,
      icon: <IndianRupee className="w-4 h-4" />
    },
    {
      title: "Total Orders",
      value: totalOrders,
      isCurrency: false,
      icon: <Package className="w-4 h-4" />
    },
    {
      title: "Avg Order Value",
      value: avgOrderValue,
      isCurrency: true,
      icon: <TrendingUp className="w-4 h-4" />
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Top Header Controls: Segmented Mode Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#202223] tracking-tight">
          Stat Overview
        </span>

        {/* 2-Way Segmented Toggle Switch */}
        <div className="inline-flex p-0.5 bg-[#E1E3E5] rounded-[6px] text-[12px] font-medium text-[#5C5F62]">
          <button
            type="button"
            onClick={() => setCardMode('overview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] transition-all duration-200 cursor-pointer ${
              cardMode === 'overview'
                ? 'bg-white text-[#202223] shadow-xs font-semibold'
                : 'hover:text-[#202223]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Time Breakdown
          </button>
          <button
            type="button"
            onClick={() => setCardMode('metrics')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] transition-all duration-200 cursor-pointer ${
              cardMode === 'metrics'
                ? 'bg-white text-[#202223] shadow-xs font-semibold'
                : 'hover:text-[#202223]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Period Metrics
          </button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardsData.map((card, idx) => (
          <AdminCard key={idx} className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[13px] font-medium text-[#5C5F62]">
                <AnimatedText text={card.title} />
              </span>
              <div className="p-1.5 bg-[#F4F6F8] rounded-md text-[#5C5F62]">
                {card.icon}
              </div>
            </div>
            <div className="flex items-end gap-3 mt-auto pt-4">
              <span className="text-[24px] font-semibold text-[#202223] tracking-tight">
                <AnimatedNumber value={card.value} isCurrency={card.isCurrency} />
              </span>
              {card.showChange && (
                <span className={`flex items-center text-[12px] font-medium pb-1 ${isRevenueUp ? 'text-[#007F5F]' : 'text-[#D82C0D]'}`}>
                  {isRevenueUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(revenueChange).toFixed(1)}% vs prior
                </span>
              )}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}

