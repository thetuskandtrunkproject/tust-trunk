import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AccordionItemProps {
  title: string
  content: string | React.ReactNode
  defaultOpen?: boolean
}

export function AccordionItem({ title, content, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-ink/10 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left py-2 focus:outline-none group"
      >
        <span className="font-medium text-ink group-hover:text-sky transition-colors">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-ink/50 group-hover:text-sky" />
        ) : (
          <ChevronDown className="w-5 h-5 text-ink/50 group-hover:text-sky" />
        )}
      </button>
      
      {isOpen && (
        <div className="pt-2 pb-4 text-ink/80 text-sm leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
          {content}
        </div>
      )}
    </div>
  )
}

export function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="w-full">{children}</div>
}
