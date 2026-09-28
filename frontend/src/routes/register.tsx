import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { handleSignup, handleGoogleLogin } from '@/lib/auth-stub'
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Validation checks
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const passwordsMatch = password !== '' && password === confirmPassword
  
  const isValid = hasMinLength && hasNumber && hasSpecialChar && passwordsMatch

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    
    setError(null)
    setLoading(true)
    const res = await handleSignup(email, password)
    setLoading(false)
    
    if (res.success) {
      navigate({ to: '/verify-account' })
    } else {
      setError(res.error || "Signup failed")
    }
  }

  const onGoogleLogin = async () => {
    setError(null)
    const res = await handleGoogleLogin()
    if (res.success) {
      navigate({ to: '/account' })
    } else {
      setError(res.error || "Google signup failed")
    }
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-gradient-to-br from-mint/20 via-cloud to-sky/20 px-4 py-16 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-sunshine rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-coral rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-white relative z-10">
        
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-4xl text-ink mb-3">Create Account</h1>
          <p className="text-ink/60 font-medium">Join us to save your wishlist and track orders.</p>
        </div>

        {error && (
          <div className="bg-rust/10 border border-rust text-rust p-3 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-ink mb-2 ml-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border-2 border-ink/10 rounded-2xl px-6 py-4 text-ink font-medium placeholder:text-ink/30 focus:border-peach focus:ring-0 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2 ml-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-2 border-ink/10 rounded-2xl pl-6 pr-14 py-4 text-ink font-medium placeholder:text-ink/30 focus:border-peach focus:ring-0 outline-none transition-colors"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-peach transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Live Checklist */}
            <div className="mt-4 flex flex-col gap-2 ml-2">
              <div className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${hasMinLength ? 'text-mint' : 'text-ink/40'}`}>
                {hasMinLength ? <CheckCircle2 className="w-4 h-4 animate-in zoom-in spin-in-12" /> : <Circle className="w-4 h-4" />}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${hasNumber ? 'text-mint' : 'text-ink/40'}`}>
                {hasNumber ? <CheckCircle2 className="w-4 h-4 animate-in zoom-in spin-in-12" /> : <Circle className="w-4 h-4" />}
                <span>At least 1 number</span>
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${hasSpecialChar ? 'text-mint' : 'text-ink/40'}`}>
                {hasSpecialChar ? <CheckCircle2 className="w-4 h-4 animate-in zoom-in spin-in-12" /> : <Circle className="w-4 h-4" />}
                <span>At least 1 special character</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2 ml-2">Confirm Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border-2 border-ink/10 rounded-2xl px-6 py-4 text-ink font-medium placeholder:text-ink/30 focus:border-peach focus:ring-0 outline-none transition-colors"
            />
            {confirmPassword !== '' && !passwordsMatch && (
              <p className="text-coral text-sm font-bold mt-2 ml-2">Passwords do not match</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={!isValid || loading}
            className="w-full bg-coral text-white py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-coral/90 transition-all mt-4 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

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
      
      <p className="mt-8 text-ink/60 font-medium relative z-10">
        Already have an account? <Link to="/login" className="text-coral font-bold hover:text-coral/80 transition-colors underline underline-offset-4 ml-1">Log in</Link>
      </p>
    </div>
  )
}
