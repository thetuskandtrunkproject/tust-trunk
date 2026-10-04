import React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function PolicyLayout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cloud pt-24 pb-32">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-ink/60 hover:text-sky font-medium text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-ink/5">
          <h1 className="font-heading font-bold text-3xl md:text-5xl text-ink mb-10 pb-6 border-b border-ink/10">{title}</h1>
          <div className="prose prose-lg prose-ink max-w-none text-ink/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
