import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { handleLogin } from '@/lib/auth-actions'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

export const Route = createFileRoute('/admin-login')({
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const navigate = useNavigate()
  const { firebaseUser, user } = useAuth()
  
  const [gatewayPassed, setGatewayPassed] = useState(() => {
    return sessionStorage.getItem('adminGatewayPassed') === 'true'
  })
  
  const [gatewayPassword, setGatewayPassword] = useState('')
  const [gatewayError, setGatewayError] = useState('')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (firebaseUser && user?.role === 'admin') {
      navigate({ to: '/admin', replace: true })
    } else if (firebaseUser && user && user.role !== 'admin') {
      navigate({ to: '/', replace: true })
    }
  }, [firebaseUser, user, navigate])

  const onGatewaySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (gatewayPassword === import.meta.env.VITE_ADMIN_GATEWAY_PASSWORD) {
      sessionStorage.setItem('adminGatewayPassed', 'true')
      setGatewayPassed(true)
      setGatewayError('')
    } else {
      setGatewayError('Invalid access code')
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await handleLogin(email, password)
    setLoading(false)
    if (res.success) {
      // User is fetched via context, which will redirect when ready
    } else {
      setError(res.error || "Login failed")
    }
  }

  if (!gatewayPassed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1C1D1E] px-4 font-sans">
        <div className="w-full max-w-sm bg-[#2A2B2D] p-8 rounded-2xl shadow-2xl border border-[#3E3F42]">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-[#005bd3]/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#005bd3]" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="font-semibold text-xl text-white mb-2">System Access</h1>
            <p className="text-[#8C9196] text-sm">Restricted area. Please verify your identity.</p>
          </div>

          {gatewayError && (
            <div className="bg-[#FED3D1]/10 text-[#FF6B6B] p-3 rounded-lg mb-6 text-sm text-center border border-[#FF6B6B]/20">
              {gatewayError}
            </div>
          )}

          <form onSubmit={onGatewaySubmit} className="flex flex-col gap-4">
            <div>
              <input 
                type="password" 
                required
                placeholder="Enter Access Code"
                value={gatewayPassword}
                onChange={e => setGatewayPassword(e.target.value)}
                className="w-full bg-[#1C1D1E] border border-[#3E3F42] rounded-lg px-4 py-3 text-white placeholder:text-[#5C5F62] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all text-center tracking-widest"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#005bd3] text-white py-3 rounded-lg font-medium shadow-sm hover:bg-[#004bb4] transition-colors mt-2"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F8] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-[#E3E3E3]">
        <div className="text-center mb-8">
          <h1 className="font-semibold text-2xl text-[#202223] mb-2">Admin Portal</h1>
          <p className="text-[#6D7175] text-sm">Sign in to the store administration</p>
        </div>

        {error && (
          <div className="bg-[#FED3D1] text-[#8C1A11] p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-[#202223] mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-[#C9CCCF] rounded-lg px-3 py-2 text-[#202223] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#202223] mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-[#C9CCCF] rounded-lg pl-3 pr-10 py-2 text-[#202223] focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D7175]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#005bd3] text-white py-2.5 rounded-lg font-medium shadow-sm hover:bg-[#004bb4] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
