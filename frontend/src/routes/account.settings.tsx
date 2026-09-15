import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { mockUser } from '@/lib/mock-account'
import { useToast } from '@/context/toast-context'
import { Save, Plus, Trash2, MapPin } from 'lucide-react'

export const Route = createFileRoute('/account/settings')({
  component: AccountSettingsPage,
})

function AccountSettingsPage() {
  const { showToast } = useToast()
  
  // Local state for edits
  const [profile, setProfile] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
  })
  
  const [addresses, setAddresses] = useState(mockUser.addresses)
  const [isEditingAddress, setIsEditingAddress] = useState<string | null>(null)
  const [newAddressForm, setNewAddressForm] = useState(false)

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    showToast("Profile details updated successfully")
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id))
    showToast("Address removed")
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })))
    showToast("Default address updated")
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl">
      <h2 className="text-2xl font-fraunces text-ink mb-6">Account Settings</h2>
      
      <div className="flex flex-col gap-8">
        
        {/* Personal Details */}
        <section className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-8">
          <h3 className="font-medium text-ink mb-6">Personal Details</h3>
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
                />
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button 
                type="submit"
                className="bg-ink text-cloud px-6 py-2.5 rounded-full text-sm font-medium hover:bg-sky-soft hover:text-ink transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* Address Book */}
        <section className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-ink">Address Book</h3>
            <button 
              onClick={() => setNewAddressForm(true)}
              className="text-sm font-medium text-ink hover:text-sky transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add new address
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address.id} className={`p-5 rounded-xl border ${address.isDefault ? 'border-sky bg-sky/5' : 'border-ink/10'} relative group`}>
                {address.isDefault && (
                  <span className="absolute top-0 right-0 bg-sky text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    Default
                  </span>
                )}
                
                <div className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${address.isDefault ? 'text-sky' : 'text-ink/40'}`} />
                  <div className="text-sm text-ink/80 leading-relaxed">
                    <p className="font-medium text-ink mb-1">{address.name}</p>
                    <p>{address.address1}</p>
                    {address.address2 && <p>{address.address2}</p>}
                    <p>{address.city}, {address.state} {address.pincode}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-ink/10">
                  {!address.isDefault ? (
                    <button 
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs font-medium text-ink/60 hover:text-sky transition-colors"
                    >
                      Set as default
                    </button>
                  ) : (
                    <div></div> // spacer
                  )}
                  
                  <div className="flex items-center gap-3">
                    <button className="text-xs font-medium text-ink/60 hover:text-sky transition-colors">Edit</button>
                    <button 
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-ink/40 hover:text-rust transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {addresses.length === 0 && !newAddressForm && (
            <div className="text-center py-8 px-4 bg-ink/5 rounded-xl border border-dashed border-ink/20">
              <p className="text-sm text-ink/60 mb-2">You haven't saved any addresses yet.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
