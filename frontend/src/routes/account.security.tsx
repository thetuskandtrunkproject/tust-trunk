import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useToast } from '@/context/toast-context'
import { Shield, Key, LogOut } from 'lucide-react'

export const Route = createFileRoute('/account/security')({
  component: AccountSecurityPage,
})

function AccountSecurityPage() {
  const { showToast } = useToast()
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      showToast("New passwords do not match")
      return
    }
    
    // Mock success
    showToast("Password updated successfully")
    setPasswords({ current: '', new: '', confirm: '' })
  }

  const handleLogoutAll = () => {
    showToast("Logged out of all other devices")
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl">
      <h2 className="text-2xl font-fraunces text-ink mb-6">Security</h2>
      
      <div className="flex flex-col gap-8">
        
        {/* Change Password */}
        <section className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sky/10 rounded-full flex items-center justify-center text-sky">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-ink">Change Password</h3>
          </div>
          
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Current Password</label>
              <input 
                type="password" 
                required
                value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all font-mono"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all font-mono"
                />
              </div>
            </div>
            
            <p className="text-xs text-ink/60 mt-2">Password must be at least 8 characters long and contain a number and a symbol.</p>

            <div className="mt-4 flex justify-end">
              <button 
                type="submit"
                disabled={!passwords.current || !passwords.new || !passwords.confirm}
                className="bg-ink text-cloud px-6 py-2.5 rounded-full text-sm font-medium hover:bg-sky-soft hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Password
              </button>
            </div>
          </form>
        </section>

        {/* Device Sessions */}
        <section className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rust/10 rounded-full flex items-center justify-center text-rust">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-ink">Active Sessions</h3>
          </div>
          
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-cloud rounded-xl border border-ink/5">
              <div className="flex flex-col">
                <span className="font-medium text-ink text-sm">Windows PC - Chrome</span>
                <span className="text-xs text-ink/60">Mumbai, India (Current session)</span>
              </div>
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
            </div>
          </div>

          <div className="border-t border-ink/10 pt-6">
            <p className="text-sm text-ink/60 mb-4">If you notice suspicious activity, you can sign out of all other devices immediately.</p>
            <button 
              onClick={handleLogoutAll}
              className="flex items-center gap-2 text-sm font-medium text-rust bg-rust/10 hover:bg-rust hover:text-white px-5 py-2.5 rounded-lg transition-colors w-fit"
            >
              <LogOut className="w-4 h-4" /> Log out of all devices
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
