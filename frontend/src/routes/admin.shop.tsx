import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Save, RotateCcw, ImagePlus, Loader2, AlertTriangle, Calendar, Clock, Sparkles, Timer, X } from 'lucide-react'
import { useToast } from '@/context/toast-context'
import { cmsApi } from '@/lib/admin/cms-api'
import { AdminPageHeader, AdminButton, ConfirmModal } from '@/components/admin/ui/primitives'
import logoImg from '@/assets/New_logo.png'

export const Route = createFileRoute('/admin/shop')({
  component: AdminShopSettingsPage,
})

interface ShopSettings {
  companyName: string
  gstNumber: string
  businessWebsite: string
  primaryPhone: string
  secondaryPhone: string
  businessEmail: string
  supportEmail: string
  addressLine: string
  city: string
  state: string
  country: string
  pincode: string
  whatsappNumber: string
  instagramUrl: string
  facebookUrl: string
  youtubeUrl: string
  maintenanceMode: boolean
  maintenanceMessage: string
  maintenanceTimerEnd: string
  gstEnabled: boolean
  gstPercentage: number
  homeStatePincodePrefixes: string
  shippingChargeHomeState: number
  shippingChargeOtherStates: number
  freeShippingEnabled: boolean
  freeShippingThreshold: number
}

function AdminShopSettingsPage() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [savedSettings, setSavedSettings] = useState<ShopSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  useEffect(() => {
    cmsApi.getShopSettings().then(res => {
      setSettings(res)
      setSavedSettings(res)
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings)

  const handleSave = async () => {
    if (!settings) return
    setIsSaving(true)
    try {
      const res = await cmsApi.updateShopSettings(settings)
      setSavedSettings(res)
      setSettings(res)
      showToast("Shop settings saved successfully")
    } catch (e) {
      console.error(e)
      showToast("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setIsResetModalOpen(true)
  }

  const confirmReset = () => {
    if (savedSettings) {
      setSettings({ ...savedSettings })
    }
    showToast("Changes discarded")
    setIsResetModalOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!settings) return
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setSettings(prev => prev ? { ...prev, [name]: (e.target as HTMLInputElement).checked } : prev)
    } else if (type === 'number') {
      setSettings(prev => prev ? { ...prev, [name]: Number(value) } : prev)
    } else {
      setSettings(prev => prev ? { ...prev, [name]: value } : prev)
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-ink/20" />
      </div>
    )
  }

  // Helpers for Maintenance Mode Timer UI
  const getTimerDateValue = (isoStr: string) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return ''
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const getTimerTimeValue = (isoStr: string) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return ''
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${min}`
  }

  const updateTimerEnd = (dateStr: string, timeStr: string) => {
    if (!dateStr) {
      setSettings(prev => prev ? { ...prev, maintenanceTimerEnd: '' } : prev)
      return
    }
    const time = timeStr || '00:00'
    const [yyyy, mm, dd] = dateStr.split('-').map(Number)
    const [hh, min] = time.split(':').map(Number)
    const targetDate = new Date(yyyy, mm - 1, dd, hh, min, 0)
    setSettings(prev => prev ? { ...prev, maintenanceTimerEnd: targetDate.toISOString() } : prev)
  }

  const addHoursToTimer = (hours: number) => {
    const target = new Date(Date.now() + hours * 60 * 60 * 1000)
    setSettings(prev => prev ? { ...prev, maintenanceTimerEnd: target.toISOString() } : prev)
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300 max-w-5xl">
      <AdminPageHeader
        title="Shop Settings"
        description="Manage core business information, tax, and shipping rules"
        actions={
          <>
            {hasChanges && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full mr-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Unsaved Changes
              </span>
            )}
            <AdminButton variant="ghost" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
              Reset
            </AdminButton>
            <AdminButton onClick={handleSave} disabled={isSaving || !hasChanges} icon={isSaving ? undefined : <Save className="w-4 h-4" />}>
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
              <label className="block text-sm font-bold text-ink/70 mb-2">Secondary Phone (WhatsApp)</label>
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
          <div className="space-y-6">
            <div className="bg-cloud/50 border border-ink/5 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-ink text-lg">Maintenance Mode</h3>
                <p className="text-ink/60 text-sm mt-1">When enabled, customers will see a maintenance page with a countdown timer. Admins can still log in.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                <div className="w-14 h-7 bg-ink/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-coral"></div>
              </label>
            </div>

            {settings.maintenanceMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Maintenance Mode is ACTIVE — Your storefront is hidden from customers.
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink/70 mb-2">Maintenance Message</label>
                  <textarea name="maintenanceMessage" value={settings.maintenanceMessage} onChange={handleChange} rows={2} className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium resize-none" />
                </div>
                
                {/* Custom Time & Date Selector */}
                <div className="space-y-3 pt-2">
                  <label className="block text-sm font-bold text-ink/80 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-600" />
                    Timer End (Date & Time)
                  </label>
                  
                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-ink/50 mr-1">Quick Add:</span>
                    {[
                      { label: '+1 Hour', hours: 1 },
                      { label: '+2 Hours', hours: 2 },
                      { label: '+6 Hours', hours: 6 },
                      { label: '+12 Hours', hours: 12 },
                      { label: '+1 Day', hours: 24 },
                      { label: '+3 Days', hours: 72 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => addHoursToTimer(preset.hours)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 hover:border-amber-400 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {preset.label}
                      </button>
                    ))}
                    {settings.maintenanceTimerEnd && (
                      <button
                        type="button"
                        onClick={() => setSettings(prev => prev ? { ...prev, maintenanceTimerEnd: '' } : prev)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Clear Timer
                      </button>
                    )}
                  </div>

                  {/* Custom Date and Time Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        value={getTimerDateValue(settings.maintenanceTimerEnd)}
                        onChange={(e) => updateTimerEnd(e.target.value, getTimerTimeValue(settings.maintenanceTimerEnd))}
                        className="w-full bg-white border border-ink/15 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
                        <Clock className="w-4 h-4" />
                      </div>
                      <input
                        type="time"
                        value={getTimerTimeValue(settings.maintenanceTimerEnd)}
                        onChange={(e) => updateTimerEnd(getTimerDateValue(settings.maintenanceTimerEnd), e.target.value)}
                        className="w-full bg-white border border-ink/15 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Live Target Time Preview Banner */}
                  <div className="p-3.5 rounded-xl bg-amber-100/60 border border-amber-200 flex items-center justify-between text-xs font-medium text-amber-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        {settings.maintenanceTimerEnd ? (
                          <>
                            Target End Time:{' '}
                            <strong className="font-bold">
                              {new Date(settings.maintenanceTimerEnd).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </strong>
                          </>
                        ) : (
                          <span className="italic text-amber-800/70">No timer set — storefront will remain in maintenance mode until manually disabled.</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  <p className="text-xs text-ink/50 mt-1">GST will be added at checkout on the review page.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-ink mb-4 pb-2 border-b border-ink/10 text-lg">Shipping Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-ink/70 mb-2">Home Pincodes/State (Prefixes)</label>
                  <input type="text" name="homeStatePincodePrefixes" value={settings.homeStatePincodePrefixes} onChange={handleChange} className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all font-medium" placeholder="e.g. 60, 61, 62, 63, 64" />
                  <p className="text-xs text-ink/50 mt-1">Comma-separated pincode prefixes for Tamil Nadu</p>
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
                  <p className="text-xs text-ink/50 mt-1">Orders above this amount get free shipping. Customers close to the threshold will see a friendly nudge.</p>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmReset}
        title="Discard Changes"
        message="Are you sure you want to discard your unsaved changes? This cannot be undone."
        confirmText="Discard"
        isDestructive={true}
      />
    </div>
  )
}
