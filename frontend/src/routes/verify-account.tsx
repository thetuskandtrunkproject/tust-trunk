import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import { useToast } from '@/context/toast-context'
import { handleResendVerification } from '@/lib/auth-stub'
import { Mail, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/verify-account')({
  component: VerifyAccountPage,
})

function VerifyAccountPage() {
  const location = useLocation()
  const state = location.state as any
  const email = state?.email || 'your email'
  
  const { showToast } = useToast()
  const [cooldown, setCooldown] = useState(false)

  const onResend = async () => {
    if (cooldown) return
    
    setCooldown(true)
    await handleResendVerification()
    showToast("Verification email resent")
    
    // Simulate cooldown
    setTimeout(() => {
      setCooldown(false)
    }, 10000)
  }

  return (
    <div className="min-h-[70vh] bg-cloud flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-ink/5 max-w-lg text-center flex flex-col items-center">
        
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-sky/10 rounded-full flex items-center justify-center">
            <Mail className="w-10 h-10 text-sky" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-cloud rounded-full p-1">
            <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-50" />
          </div>
        </div>

        <h1 className="font-fraunces text-3xl text-ink mb-4">Check your inbox</h1>
        
        <p className="text-ink/70 mb-8 leading-relaxed">
          We've sent a verification link to <strong className="text-ink">{email}</strong>. 
          Check your inbox — and your spam folder — to activate your account.
        </p>
        
        <button 
          onClick={onResend}
          disabled={cooldown}
          className="bg-ink text-cloud px-8 py-3.5 rounded-xl font-medium shadow-xl hover:bg-sky-soft hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6 w-full"
        >
          {cooldown ? 'Wait before resending...' : 'Resend email'}
        </button>
        
        <Link 
          to="/login"
          className="text-sm font-medium text-ink hover:text-sky transition-colors underline underline-offset-4"
        >
          Back to login
        </Link>

      </div>
    </div>
  )
}
