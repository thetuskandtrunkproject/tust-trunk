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
        <span className="font-heading font-bold text-xl text-ink group-hover:text-coral transition-colors">{title}</span>
        <ChevronDown className={`w-6 h-6 text-ink/50 group-hover:text-coral transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="pt-2 pb-4 text-ink/80 text-base leading-relaxed font-sans font-medium">
            {content}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="w-full">{children}</div>
}
