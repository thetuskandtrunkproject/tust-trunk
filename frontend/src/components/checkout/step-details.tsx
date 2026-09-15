import { useState } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface StepDetailsProps {
  onNext: (contact: any, shipping: any, saveDefault: boolean) => void
  onBack: () => void
  initialContact: any
  initialShipping: any
  initialSaveDefault: boolean
}

export function StepDetails({ onNext, onBack, initialContact, initialShipping, initialSaveDefault }: StepDetailsProps) {
  const [contact, setContact] = useState(initialContact)
  const [shipping, setShipping] = useState(initialShipping)
  const [saveDefault, setSaveDefault] = useState(initialSaveDefault)

  const isFormValid = () => {
    return (
      contact.email.includes('@') &&
      contact.phone.length >= 10 &&
      shipping.name.trim() !== '' &&
      shipping.address1.trim() !== '' &&
      shipping.city.trim() !== '' &&
      shipping.state.trim() !== '' &&
      shipping.pincode.length >= 5
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      onNext(contact, shipping, saveDefault)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="font-fraunces text-2xl text-ink mb-8">Delivery Details</h2>
      
      <form id="details-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
        
        {/* Contact Information */}
        <section className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-8">
          <h3 className="font-medium text-ink mb-6">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Email Address *</label>
              <input 
                type="email" 
                required
                value={contact.email}
                onChange={e => setContact({...contact, email: e.target.value})}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Phone Number *</label>
              <input 
                type="tel" 
                required
                value={contact.phone}
                onChange={e => setContact({...contact, phone: e.target.value})}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Shipping Address */}
        <section className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-8">
          <h3 className="font-medium text-ink mb-6">Shipping Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-2">Full Name *</label>
              <input 
                type="text" 
                required
                value={shipping.name}
                onChange={e => setShipping({...shipping, name: e.target.value})}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-2">Address Line 1 *</label>
              <input 
                type="text" 
                required
                value={shipping.address1}
                onChange={e => setShipping({...shipping, address1: e.target.value})}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-2">Address Line 2 (Optional)</label>
              <input 
                type="text" 
                value={shipping.address2}
                onChange={e => setShipping({...shipping, address2: e.target.value})}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">City *</label>
              <input 
                type="text" 
                required
                value={shipping.city}
                onChange={e => setShipping({...shipping, city: e.target.value})}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">State/Province *</label>
              <input 
                type="text" 
                required
                value={shipping.state}
                onChange={e => setShipping({...shipping, state: e.target.value})}
                className="w-full bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-2">Postal/Pincode *</label>
              <input 
                type="text" 
                required
                value={shipping.pincode}
                onChange={e => setShipping({...shipping, pincode: e.target.value})}
                className="w-full md:w-1/2 bg-cloud border border-ink/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/50 transition-all"
              />
            </div>
          </div>
          
          <label className="flex items-center gap-3 mt-6 cursor-pointer group w-fit">
            <input 
              type="checkbox" 
              checked={saveDefault}
              onChange={e => setSaveDefault(e.target.checked)}
              className="w-5 h-5 rounded border-ink/20 text-ink focus:ring-ink cursor-pointer" 
            />
            <span className="text-sm font-medium text-ink/80 group-hover:text-ink transition-colors">Save as default address</span>
          </label>
        </section>

        {/* Flat Delivery Notice */}
        <section className="bg-ink/5 rounded-2xl p-6 lg:p-8 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-ink mb-1">Standard Delivery</h3>
            <p className="text-sm text-ink/60">Arriving in 5-7 business days</p>
          </div>
          <span className="font-medium text-ink text-lg">₹60</span>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-ink/10">
          <button 
            type="button"
            onClick={onBack}
            className="text-ink/60 hover:text-ink font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Review
          </button>
          
          <button 
            type="submit"
            disabled={!isFormValid()}
            className="bg-ink text-cloud px-10 py-4 rounded-xl font-medium shadow-xl hover:bg-sky-soft hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue to Payment <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
