import { useState } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface StepDetailsProps {
  onNext: (contact: any, shipping: any, saveDefault: boolean) => void
  onBack: () => void
  initialContact: any
  initialShipping: any
  initialSaveDefault: boolean
  deliveryFee: number
}

export function StepDetails({ onNext, onBack, initialContact, initialShipping, initialSaveDefault, deliveryFee }: StepDetailsProps) {
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
    <div>
      <h2 className="font-heading font-bold text-4xl text-ink mb-8">Delivery Details</h2>
      
      <form id="details-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
        
        {/* Contact Information */}
        <section className="bg-white border border-ink/10 rounded-[2rem] p-6 lg:p-8 shadow-sm">
          <h3 className="font-bold text-xl text-ink mb-6">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-ink mb-2 ml-2">Email Address *</label>
              <input 
                type="email" 
                required
                value={contact.email}
                onChange={e => setContact({...contact, email: e.target.value})}
                className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-coral focus:ring-4 focus:ring-coral/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2 ml-2">Phone Number *</label>
              <input 
                type="tel" 
                required
                value={contact.phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  if (val.length <= 10) {
                    setContact({...contact, phone: val})
                  }
                }}
                maxLength={10}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-coral focus:ring-4 focus:ring-coral/20 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Shipping Address */}
        <section className="bg-white border border-ink/10 rounded-[2rem] p-6 lg:p-8 shadow-sm">
          <h3 className="font-bold text-xl text-ink mb-6">Shipping Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-ink mb-2 ml-2">Full Name *</label>
              <input 
                type="text" 
                required
                value={shipping.name}
                onChange={e => setShipping({...shipping, name: e.target.value})}
                className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-coral focus:ring-4 focus:ring-coral/20 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-ink mb-2 ml-2">Address Line 1 *</label>
              <input 
                type="text" 
                required
                value={shipping.address1}
                onChange={e => setShipping({...shipping, address1: e.target.value})}
                className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-coral focus:ring-4 focus:ring-coral/20 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-ink mb-2 ml-2">Address Line 2 (Optional)</label>
              <input 
                type="text" 
                value={shipping.address2}
                onChange={e => setShipping({...shipping, address2: e.target.value})}
                className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-coral focus:ring-4 focus:ring-coral/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2 ml-2">City *</label>
              <input 
                type="text" 
                required
                value={shipping.city}
                onChange={e => setShipping({...shipping, city: e.target.value})}
                className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-coral focus:ring-4 focus:ring-coral/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2 ml-2">State/Province *</label>
              <input 
                type="text" 
                required
                value={shipping.state}
                onChange={e => setShipping({...shipping, state: e.target.value})}
                className="w-full bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-coral focus:ring-4 focus:ring-coral/20 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-ink mb-2 ml-2">Postal/Pincode *</label>
              <input 
                type="text" 
                required
                value={shipping.pincode}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  if (val.length <= 6) {
                    setShipping({...shipping, pincode: val})
                  }
                }}
                maxLength={6}
                pattern="[0-9]{6}"
                title="Please enter a valid 6-digit PIN code"
                className="w-full md:w-1/2 bg-cloud border-2 border-ink/10 rounded-full px-6 py-3 font-medium focus:outline-none focus:border-coral focus:ring-4 focus:ring-coral/20 transition-all"
              />
            </div>
          </div>
          
          <label className="flex items-center gap-3 mt-8 cursor-pointer group w-fit ml-2">
            <input 
              type="checkbox" 
              checked={saveDefault}
              onChange={e => setSaveDefault(e.target.checked)}
              className="w-6 h-6 rounded-md border-2 border-ink/20 text-coral focus:ring-coral focus:ring-offset-2 cursor-pointer transition-colors" 
            />
            <span className="text-sm font-bold text-ink/80 group-hover:text-ink transition-colors">Save as default address</span>
          </label>
        </section>

        {/* Conditional Delivery Notice */}
        <section className="bg-sky/10 rounded-[2rem] p-6 lg:p-8 flex items-center justify-between border border-sky/20">
          <div>
            <h3 className="font-bold text-ink mb-1 text-lg">Standard Delivery</h3>
            <p className="text-sm text-ink/60 font-medium">Arriving in 5-7 business days</p>
          </div>
          <span className="font-heading font-bold text-ink text-2xl">
            {deliveryFee === 0 ? <span className="text-mint">Free</span> : `₹${deliveryFee}`}
          </span>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-ink/10">
          <button 
            type="button"
            onClick={onBack}
            className="text-ink/60 hover:text-ink font-bold transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Review
          </button>
          
          <button 
            type="submit"
            disabled={!isFormValid()}
            className="bg-coral text-white px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-coral/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            Continue to Payment <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
