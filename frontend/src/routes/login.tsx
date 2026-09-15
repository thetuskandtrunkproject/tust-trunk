import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { handleLogin, handleGoogleLogin } from '@/lib/auth-stub'
import { Eye, EyeOff } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // UI Stub: pretend it succeeds and go to account
    await handleLogin(email, password)
    navigate({ to: '/account' })
  }

  const onGoogleLogin = async () => {
    await handleGoogleLogin()
    navigate({ to: '/account' })
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-cloud px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-ink/5">
        
        <div className="text-center mb-8">
          <h1 className="font-fraunces text-3xl text-ink mb-2">Welcome Back</h1>
          <p className="text-ink/60">Log in to manage your orders and wishlist.</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-ink">Password</label>
              <button type="button" className="text-xs text-ink/60 hover:text-sky transition-colors">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cloud border border-ink/10 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all font-mono"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-ink text-cloud py-3.5 rounded-xl font-medium shadow-xl hover:bg-sky-soft hover:text-ink transition-colors mt-2"
          >
            Log In
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-ink/10"></div>
          <span className="text-sm font-medium text-ink/40 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-ink/10"></div>
        </div>

        <button 
          onClick={onGoogleLogin}
          type="button"
          className="w-full bg-white border border-ink/10 text-ink py-3.5 rounded-xl font-medium shadow-sm hover:bg-ink/5 transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

      </div>
      
      <p className="mt-8 text-ink/60">
        Don't have an account? <Link to="/register" className="text-ink font-medium hover:text-sky transition-colors underline underline-offset-4">Sign up</Link>
      </p>
    </div>
  )
}
