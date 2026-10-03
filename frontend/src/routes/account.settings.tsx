import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useToast } from '@/context/toast-context'
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'
import { Save, Plus, Trash2, MapPin, X } from 'lucide-react'

export const Route = createFileRoute('/account/settings')({
  component: AccountSettingsPage,
})

function AccountSettingsPage() {
  const { showToast } = useToast()
  const { user, refreshUser } = useAuth()
  
  // Local state for edits
  const [profile, setProfile] = useState({
    name: user?.full_name || '',
    phone: user?.phone || '',
  })
  
  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [newAddressForm, setNewAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  
  // Form state
  const [addressForm, setAddressForm] = useState({
    name: '', address1: '', address2: '', city: '', state: '', pincode: ''
  })
  const [savingAddress, setSavingAddress] = useState(false)

  const loadAddresses = async () => {
    try {
      const res = await api.get('/api/v1/addresses')
      setAddresses(res.data)
    } catch (error) {
      showToast("Failed to load addresses")
    } finally {
      setLoadingAddresses(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.patch('/api/v1/auth/me', {
        full_name: profile.name,
        phone: profile.phone || null
      })
      await refreshUser()
      showToast("Profile details updated successfully")
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Failed to update profile")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.delete(`/api/v1/addresses/${id}`)
      showToast("Address removed")
      await loadAddresses()
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Failed to remove address")
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/api/v1/addresses/${id}/set-default`)
      showToast("Default address updated")
      await loadAddresses()
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Failed to set default")
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAddress(true)
    try {
      if (editingAddressId) {
        await api.put(`/api/v1/addresses/${editingAddressId}`, addressForm)
        showToast("Address updated")
      } else {
        await api.post('/api/v1/addresses', addressForm)
        showToast("Address added")
      }
      setNewAddressForm(false)
      setEditingAddressId(null)
      setAddressForm({ name: '', address1: '', address2: '', city: '', state: '', pincode: '' })
      await loadAddresses()
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Failed to save address")
    } finally {
      setSavingAddress(false)
    }
  }

  const handleEditAddress = (address: any) => {
    setAddressForm({
      name: address.name,
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    })
    setEditingAddressId(address.id)
    setNewAddressForm(true)
  }

  const cancelAddressForm = () => {
    setNewAddressForm(false)
    setEditingAddressId(null)
    setAddressForm({ name: '', address1: '', address2: '', city: '', state: '', pincode: '' })
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl">
      <h2 className="text-4xl font-heading font-bold text-ink mb-8">Account Settings</h2>
      
      <div className="flex flex-col gap-8">
        
        {/* Personal Details */}
        <section className="bg-white border border-ink/10 rounded-[2rem] p-6 lg:p-8 shadow-sm">
          <h3 className="font-bold text-xl text-ink mb-6">Personal Details</h3>
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-ink mb-2 ml-2">Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-cta focus:ring-4 focus:ring-cta/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2 ml-2">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-ink/5 border-2 border-transparent rounded-full px-6 py-3 font-medium text-ink/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2 ml-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-cta focus:ring-4 focus:ring-cta/20 transition-all"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                type="submit"
                className="bg-cta text-white px-8 py-3 rounded-full text-base font-bold shadow-xl hover:scale-105 hover:bg-cta/90 transition-all flex items-center gap-2"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* Address Book */}
        <section className="bg-white border border-ink/10 rounded-[2rem] p-6 lg:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-ink">Address Book</h3>
            {!newAddressForm && (
              <button 
                onClick={() => setNewAddressForm(true)}
                className="text-sm font-bold text-ink hover:text-sky transition-colors flex items-center gap-1 bg-ink/5 px-4 py-2 rounded-full"
              >
                <Plus className="w-4 h-4" /> Add new address
              </button>
            )}
          </div>

          {newAddressForm && (
            <form onSubmit={handleAddressSubmit} className="bg-cloud/50 border border-ink/10 rounded-[2rem] p-6 mb-8 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-lg text-ink">{editingAddressId ? 'Edit Address' : 'New Address'}</h4>
                <button type="button" onClick={cancelAddressForm} className="p-2 text-ink/40 hover:text-ink transition-colors rounded-full hover:bg-ink/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-ink mb-2 ml-2">Full Name</label>
                  <input type="text" required value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="w-full bg-white border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-cta transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-ink mb-2 ml-2">Address Line 1</label>
                  <input type="text" required value={addressForm.address1} onChange={e => setAddressForm({...addressForm, address1: e.target.value})} className="w-full bg-white border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-cta transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-ink mb-2 ml-2">Address Line 2 (Optional)</label>
                  <input type="text" value={addressForm.address2} onChange={e => setAddressForm({...addressForm, address2: e.target.value})} className="w-full bg-white border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-cta transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-2 ml-2">City</label>
                  <input type="text" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-white border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-cta transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-2 ml-2">State</label>
                  <input type="text" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full bg-white border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-cta transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-ink mb-2 ml-2">Pincode</label>
                  <input type="text" required pattern="[0-9]{6}" title="6 digit pincode" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-full md:w-1/2 bg-white border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-cta transition-all" />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-4">
                <button type="button" onClick={cancelAddressForm} className="px-6 py-3 rounded-full text-sm font-bold text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors">Cancel</button>
                <button type="submit" disabled={savingAddress} className="bg-cta text-white px-8 py-3 rounded-full text-sm font-bold shadow-md hover:bg-cta/90 transition-all disabled:opacity-50">
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          )}

          {loadingAddresses ? (
            <div className="text-center py-8 px-4">
              <div className="animate-spin w-8 h-8 border-4 border-cta border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm font-medium text-ink/60">Loading addresses...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div key={address.id} className={`p-6 rounded-[2rem] border-2 ${address.is_default ? 'border-sky bg-sky/5' : 'border-ink/10'} relative group`}>
                    {address.is_default && (
                      <span className="absolute -top-3 -right-2 bg-sky text-ink text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                        Default
                      </span>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${address.is_default ? 'text-sky' : 'text-ink/40'}`} />
                      <div className="text-sm text-ink/80 leading-relaxed font-medium">
                        <p className="font-bold text-ink text-base mb-1">{address.name}</p>
                        <p>{address.address1}</p>
                        {address.address2 && <p>{address.address2}</p>}
                        <p>{address.city}, {address.state} {address.pincode}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-ink/10">
                      {!address.is_default ? (
                         <button 
                           onClick={() => handleSetDefault(address.id)}
                           className="text-xs font-bold text-ink/60 hover:text-sky transition-colors"
                         >
                           Set as default
                         </button>
                      ) : (
                        <div></div> // spacer
                      )}
                      
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleEditAddress(address)}
                          className="text-xs font-bold text-ink/60 hover:text-sky transition-colors"
                        >
                          Edit
                        </button>
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
                <div className="text-center py-8 px-4 bg-ink/5 rounded-[2rem] border-2 border-dashed border-ink/20">
                  <p className="text-sm font-bold text-ink/60 mb-2">You haven't saved any addresses yet.</p>
                </div>
              )}
            </>
          )}
        </section>

      </div>
    </div>
  )
}


