import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { handleGoogleLogin } from '@/lib/auth-actions'
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { firebaseUser, refreshUser } = useAuth()
  
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (firebaseUser) {
      navigate({ to: '/', replace: true })
    }
  }, [firebaseUser, navigate])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const onSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/api/v1/auth/send-otp', { phone })
      setStep('otp')
      setCountdown(60) // 60s cooldown for resend
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/api/v1/auth/verify-otp', { phone, otp })
      if (res.data.success && res.data.token) {
        await signInWithCustomToken(auth, res.data.token)
        await refreshUser()
        navigate({ to: '/account' })
      } else {
        setError("Invalid response from server.")
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onGoogleLogin = async () => {
    setError(null)
    const res = await handleGoogleLogin()
    if (!res.success) {
      setError(res.error || "Google login failed")
    }
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-gradient-to-br from-mint/20 via-cloud to-sky/20 px-4 py-16 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-sunshine rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-coral rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-white relative z-10">
        
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-4xl text-ink mb-3">Welcome Back!</h1>
          <p className="text-ink/60 font-medium">Log in to manage your orders and wishlist.</p>
        </div>

        {error && (
          <div className="bg-rust/10 border border-rust text-rust p-3 rounded-lg mb-6 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={onSendOtp} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2 ml-2">Phone Number</label>
              <div className="flex bg-white border-2 border-ink/10 rounded-2xl overflow-hidden focus-within:border-peach transition-colors">
                <div className="flex items-center justify-center px-4 bg-cloud border-r border-ink/10 font-bold text-ink/70">
                  +91
                </div>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full px-4 py-4 text-ink font-medium placeholder:text-ink/30 focus:ring-0 outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-cta text-white py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-cta/90 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="flex flex-col gap-6">
            <div className="text-center text-sm font-medium text-ink/70">
              OTP sent via WhatsApp to <br/>
              <span className="font-bold text-ink">+91 {phone}</span>
              <button 
                type="button" 
                onClick={() => { setStep('phone'); setOtp(''); setCountdown(0); setError(null); }}
                className="ml-2 text-sky hover:underline"
              >
                (Change)
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2 ml-2 text-center">Enter OTP</label>
              <input 
                type="text" 
                required
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full bg-white border-2 border-ink/10 rounded-2xl px-6 py-4 text-center text-2xl tracking-widest text-ink font-bold placeholder:text-ink/30 placeholder:tracking-normal focus:border-peach focus:ring-0 outline-none transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-cta text-white py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-cta/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                type="button"
                disabled={countdown > 0 || loading}
                onClick={() => onSendOtp()}
                className="text-sm font-bold text-sky hover:text-sky/80 disabled:text-ink/30 transition-colors"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-0.5 bg-ink/5"></div>
          <span className="text-sm font-bold text-ink/30 uppercase tracking-widest">or</span>
          <div className="flex-1 h-0.5 bg-ink/5"></div>
        </div>

        <button 
          onClick={onGoogleLogin}
          type="button"
          className="w-full bg-white border-2 border-ink/10 text-ink py-4 rounded-full font-bold shadow-sm hover:border-ink/20 hover:bg-cloud transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button 
          onClick={() => navigate({ to: '/' })}
          type="button"
          className="w-full bg-transparent border-2 border-transparent text-ink/60 py-4 rounded-full font-bold hover:text-ink hover:bg-ink/5 transition-all mt-3"
        >
          Continue as Guest
        </button>

      </div>
      
    </div>
  )
}

