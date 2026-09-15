import type { CustomerAddress } from '@/lib/admin/mock-customers'

interface CustomerAddressesProps {
  addresses: CustomerAddress[]
}

export function CustomerAddresses({ addresses }: CustomerAddressesProps) {
  if (addresses.length === 0) {
    return (
      <div className="bg-white border border-ink/10 rounded-2xl p-8 text-center shadow-sm">
        <p className="text-ink/60">No saved addresses.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <div key={address.id} className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm relative">
          {address.isDefault && (
            <span className="absolute top-4 right-4 bg-ink text-cloud text-xs font-medium px-2 py-1 rounded-md">
              Default
            </span>
          )}
          <h4 className="font-medium text-ink mb-1 pr-16">{address.name}</h4>
          <p className="text-ink/70 text-sm">{address.address1}</p>
          {address.address2 && <p className="text-ink/70 text-sm">{address.address2}</p>}
          <p className="text-ink/70 text-sm">
            {address.city}, {address.state} {address.pincode}
          </p>
        </div>
      ))}
    </div>
  )
}
