import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useToast } from '@/context/toast-context'
import { handleResendVerification } from '@/lib/auth-actions'
import { Mail, CheckCircle2 } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/auth-context'

export const Route = createFileRoute('/verify-account')({
  component: VerifyAccountPage,
})

function VerifyAccountPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as any
  const email = state?.email || 'your email'
  
  const { firebaseUser, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser) {
        navigate({ to: '/login', replace: true })
      } else if (firebaseUser.emailVerified) {
        navigate({ to: '/', replace: true })
      }
    }
  }, [loading, firebaseUser, navigate])

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
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-gradient-to-br from-mint/20 via-cloud to-sky/20 px-4 py-16 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-sunshine rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-coral rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-xl border border-white relative z-10 text-center flex flex-col items-center">
        
        <div className="relative mb-10">
          <div className="w-24 h-24 bg-sky-soft rounded-full flex items-center justify-center animate-in zoom-in spin-in-12 duration-500 shadow-inner">
            <Mail className="w-12 h-12 text-sky" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-mint fill-mint/20" />
          </div>
        </div>

        <h1 className="font-heading font-bold text-4xl text-ink mb-4">Check your inbox!</h1>
        
        <p className="text-ink/60 font-medium mb-10 leading-relaxed text-lg max-w-sm">
          We've sent a verification link to <strong className="text-ink">{email}</strong>. 
          Check your inbox — and your spam folder — to activate your account.
        </p>
        
        <button 
          onClick={onResend}
          disabled={cooldown}
          className="bg-white border-2 border-sky text-sky px-8 py-4 rounded-full font-bold shadow-sm hover:bg-sky-soft transition-all disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed mb-4 w-full"
        >
          {cooldown ? 'Wait before resending...' : 'Resend email'}
        </button>

        <button 
          onClick={async () => {
            if (firebaseUser) {
              await firebaseUser.reload();
              if (firebaseUser.emailVerified) {
                navigate({ to: '/', replace: true })
              } else {
                showToast("Email not verified yet. Please check your inbox.")
              }
            }
          }}
          className="w-full bg-cta text-white py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-cta/90 transition-all mb-8"
        >
          I've verified my email
        </button>
        
        <button 
          onClick={async () => {
            await auth.signOut();
            window.location.href = '/login';
          }}
          className="text-sm font-bold text-sky hover:text-sky/80 transition-colors underline underline-offset-4"
        >
          Log out & Back to login
        </button>

      </div>
    </div>
  )
}

