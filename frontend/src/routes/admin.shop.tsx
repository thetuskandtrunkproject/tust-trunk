import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Save, RotateCcw, ImagePlus } from 'lucide-react'
import { useToast } from '@/context/toast-context'
import { MOCK_SHOP_SETTINGS, type ShopSettings } from '@/lib/admin/mock-shop-settings'
import { AdminPageHeader, AdminButton } from '@/components/admin/ui/primitives'
import logoImg from '@/assets/logo_full_hd.png'

export const Route = createFileRoute('/admin/shop')({
  component: AdminShopSettingsPage,
})

function AdminShopSettingsPage() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<ShopSettings>(MOCK_SHOP_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaving(false)
    showToast("Shop settings saved successfully")
  }

  const handleReset = () => {
    if (window.confirm("Are you sure you want to discard your unsaved changes?")) {
      setSettings(MOCK_SHOP_SETTINGS)
      showToast("Settings reset to defaults")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setSettings(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setSettings(prev => ({ ...prev, [name]: Number(value) }))
    } else {
      setSettings(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300 max-w-5xl">
      <AdminPageHeader
        title="Shop Settings"
        description="Manage core business information, tax, and shipping rules"
        actions={
          <>
            <AdminButton variant="ghost" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
              Reset
            </AdminButton>
            <AdminButton onClick={handleSave} disabled={isSaving} icon={isSaving ? undefined : <Save className="w-4 h-4" />}>
              {isSaving ? 'Saving...' : 'Save Company Details'}
            </AdminButton>
          </>
        }
      />

      <div className="space-y-8">
        {/* 1. Core Information */}
        <section className="bg-white border border-ink/10 rounded-2xl p-8 shadow-sm">
          <h2 className="font-heading font-bold text-xl text-ink mb-6">1. Core Information</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <label className="block text-sm font-bold text-ink/70 mb-3">Company Logo</label>
              <div className="aspect-square bg-cloud border-2 border-dashed border-ink/20 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-sky transition-colors">
                <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-4" />
                <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <ImagePlus className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Change</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-9 space-y-5">
              <div>
                <label className="block text-sm font-bold text-ink/70 mb-2">Company Name</label>
                <input type="text" name="companyName" value={settings.companyName} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-ink/70 mb-2">GST Number</label>
                  <input type="text" name="gstNumber" value={settings.gstNumber} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink/70 mb-2">Business Website</label>
                  <input type="url" name="businessWebsite" value={settings.businessWebsite} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Contact Details */}
        <section className="bg-white border border-ink/10 rounded-2xl p-8 shadow-sm">
          <h2 className="font-heading font-bold text-xl text-ink mb-6">2. Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink/70 mb-2">Primary Phone</label>
              <input type="tel" name="primaryPhone" value={settings.primaryPhone} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink/70 mb-2">Secondary Phone (Optional)</label>
              <input type="tel" name="secondaryPhone" value={settings.secondaryPhone} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink/70 mb-2">Business Email</label>
              <input type="email" name="businessEmail" value={settings.businessEmail} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink/70 mb-2">Support Email</label>
              <input type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
            </div>
          </div>
        </section>

        {/* 3. Registered Address */}
        <section className="bg-white border border-ink/10 rounded-2xl p-8 shadow-sm">
          <h2 className="font-heading font-bold text-xl text-ink mb-6">3. Registered Address</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-ink/70 mb-2">Address Line</label>
              <input type="text" name="addressLine" value={settings.addressLine} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-ink/70 mb-2">City</label>
                <input type="text" name="city" value={settings.city} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink/70 mb-2">State</label>
                <input type="text" name="state" value={settings.state} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink/70 mb-2">Country</label>
                <input type="text" name="country" value={settings.country} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink/70 mb-2">Pincode/ZIP</label>
                <input type="text" name="pincode" value={settings.pincode} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Social Links & Chat */}
        <section className="bg-white border border-ink/10 rounded-2xl p-8 shadow-sm">
          <h2 className="font-heading font-bold text-xl text-ink mb-6">4. Social Links & Chat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink/70 mb-2">WhatsApp Number</label>
              <input type="tel" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink/70 mb-2">Instagram URL</label>
              <input type="url" name="instagramUrl" value={settings.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink/70 mb-2">Facebook URL</label>
              <input type="url" name="facebookUrl" value={settings.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink/70 mb-2">YouTube URL</label>
              <input type="url" name="youtubeUrl" value={settings.youtubeUrl} onChange={handleChange} placeholder="https://youtube.com/..." className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
            </div>
          </div>
        </section>

        {/* 5. Website Status */}
        <section className="bg-white border border-ink/10 rounded-2xl p-8 shadow-sm">
          <h2 className="font-heading font-bold text-xl text-ink mb-6">5. Website Status</h2>
          <div className="bg-cloud/50 border border-ink/5 rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-ink text-lg">Maintenance Mode</h3>
              <p className="text-ink/60 text-sm mt-1">When enabled, customers will see a maintenance page. Admins can still access the site.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
              <div className="w-14 h-7 bg-ink/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-coral"></div>
            </label>
          </div>
        </section>

        {/* 6. Billing & Shipping Settings */}
        <section className="bg-white border border-ink/10 rounded-2xl p-8 shadow-sm">
          <h2 className="font-heading font-bold text-xl text-ink mb-6">6. Billing & Shipping Settings</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-ink mb-4 pb-2 border-b border-ink/10 text-lg">Tax Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="flex items-center justify-between bg-cloud/50 p-4 rounded-xl border border-ink/5">
                  <div className="font-bold text-ink">Enable GST Calculation</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="gstEnabled" checked={settings.gstEnabled} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-ink/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink/70 mb-2">GST Percentage</label>
                  <div className="relative">
                    <input type="number" name="gstPercentage" value={settings.gstPercentage} onChange={handleChange} disabled={!settings.gstEnabled} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium disabled:opacity-50" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-ink mb-4 pb-2 border-b border-ink/10 text-lg">Shipping Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-ink/70 mb-2">Home Pincodes/State (Prefixes)</label>
                  <input type="text" name="homeStatePincodePrefixes" value={settings.homeStatePincodePrefixes} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" placeholder="e.g. 36, 37, 38, 39" />
                  <p className="text-xs text-ink/50 mt-1">Comma-separated pincode prefixes for home state</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ink/70 mb-2">Charge (Home)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 font-bold">₹</span>
                      <input type="number" name="shippingChargeHomeState" value={settings.shippingChargeHomeState} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink/70 mb-2">Charge (Other)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 font-bold">₹</span>
                      <input type="number" name="shippingChargeOtherStates" value={settings.shippingChargeOtherStates} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="flex items-center justify-between bg-cloud/50 p-4 rounded-xl border border-ink/5">
                  <div className="font-bold text-ink">Enable Free Shipping Threshold</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="freeShippingEnabled" checked={settings.freeShippingEnabled} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-ink/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink/70 mb-2">Free Shipping Above</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 font-bold">₹</span>
                    <input type="number" name="freeShippingThreshold" value={settings.freeShippingThreshold} onChange={handleChange} disabled={!settings.freeShippingEnabled} className="w-full bg-cloud border border-ink/10 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium disabled:opacity-50" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
