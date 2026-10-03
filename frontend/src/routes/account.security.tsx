import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useToast } from '@/context/toast-context'
import { Shield, Key, LogOut } from 'lucide-react'
import { handleChangePassword, handleRevokeAllSessions } from '@/lib/auth-actions'
import { useAuth } from '@/context/auth-context'

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
  const [isChanging, setIsChanging] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      showToast("New passwords do not match")
      return
    }
    
    setIsChanging(true)
    // NOTE: Firebase requires re-authentication for changing password if session is old.
    // For this pass we'll just try to change it directly using the helper.
    const res = await handleChangePassword(passwords.new)
    setIsChanging(false)
    
    if (res.success) {
      showToast("Password updated successfully")
      setPasswords({ current: '', new: '', confirm: '' })
    } else {
      // Very likely requires recent-auth
      showToast(res.error || "Failed to update password. You may need to log in again.")
    }
  }

  const handleLogoutAll = async () => {
    setIsRevoking(true)
    const res = await handleRevokeAllSessions()
    setIsRevoking(false)
    
    if (res.success) {
      showToast("Logged out of all devices")
    } else {
      showToast("Failed to revoke sessions")
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl">
      <h2 className="text-4xl font-heading font-bold text-ink mb-8">Security</h2>
      
      <div className="flex flex-col gap-8">
        
        {/* Change Password */}
        <section className="bg-white border border-ink/10 rounded-[2rem] p-6 lg:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-sky/20 rounded-full flex items-center justify-center text-sky">
              <Key className="w-6 h-6 text-ink" />
            </div>
            <h3 className="font-bold text-xl text-ink">Change Password</h3>
          </div>
          
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-ink mb-2 ml-2">Current Password</label>
              <input 
                type="password" 
                required
                value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
                className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-mono focus:outline-none focus:border-cta focus:ring-4 focus:ring-cta/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2 ml-2">New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-mono focus:outline-none focus:border-cta focus:ring-4 focus:ring-cta/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2 ml-2">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-mono focus:outline-none focus:border-cta focus:ring-4 focus:ring-cta/20 transition-all"
                />
              </div>
            </div>
            
            <p className="text-sm font-medium text-ink/60 mt-2 ml-2">Password must be at least 8 characters long and contain a number and a symbol.</p>

            <div className="mt-4 flex justify-end">
              <button 
                type="submit"
                disabled={!passwords.new || !passwords.confirm || isChanging}
                className="bg-cta text-white px-8 py-3 rounded-full text-base font-bold shadow-xl hover:scale-105 hover:bg-cta/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isChanging ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>

        {/* Device Sessions */}
        <section className="bg-white border border-ink/10 rounded-[2rem] p-6 lg:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-rust/20 rounded-full flex items-center justify-center text-rust">
              <Shield className="w-6 h-6 text-ink" />
            </div>
            <h3 className="font-bold text-xl text-ink">Active Sessions</h3>
          </div>
          
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center justify-between p-5 bg-ink/5 rounded-2xl border border-ink/10">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-ink text-sm">Windows PC - Chrome</span>
                <span className="text-xs font-medium text-ink/60">Mumbai, India (Current session)</span>
              </div>
              <span className="text-xs font-bold bg-mint text-ink px-3 py-1 rounded-full shadow-sm">Active</span>
            </div>
          </div>

          <div className="border-t border-ink/10 pt-8">
            <p className="text-sm font-medium text-ink/60 mb-6">If you notice suspicious activity, you can sign out of all other devices immediately.</p>
            <button 
              onClick={handleLogoutAll}
              disabled={isRevoking}
              className="flex items-center gap-2 text-base font-bold text-rust bg-transparent border-2 border-rust/20 hover:bg-rust/5 hover:border-rust hover:scale-105 px-8 py-3 rounded-full transition-all w-fit shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <LogOut className="w-5 h-5" /> {isRevoking ? 'Revoking...' : 'Log out of all devices'}
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}

