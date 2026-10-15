import {
  AdminTableShell,
  AdminTh,
  AdminTd,
  StatusBadge,
  AdminActionsDropdown,
} from '@/components/admin/ui/primitives'
import type { ComboOffer } from '@/lib/admin/offers-api'
import { Edit2, Trash2, Power } from 'lucide-react'

interface OfferTableProps {
  offers: ComboOffer[]
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<void>
  onEdit: (offer: ComboOffer) => void
  onDelete: (id: string) => void
}

export function OfferTable({ offers, onToggleStatus, onEdit, onDelete }: OfferTableProps) {
  const formatDiscount = (offer: ComboOffer) => {
    if (offer.discount_type === 'flat') {
      return `₹${Math.round(offer.discount_value / 100)} / product`
    }
    return `${offer.discount_value}% off`
  }

  const formatSequencePreview = (minQty: number, seq: string) => {
    const isEven = seq === 'even'
    let start = minQty
    // First number matching parity >= minQty
    while (isEven ? start % 2 !== 0 : start % 2 === 0) {
      start++
    }
    const samples = [start, start + 2, start + 4]
    return `${seq.toUpperCase()} (${samples.join(', ')}...)`
  }

  return (
    <AdminTableShell isEmpty={offers.length === 0} emptyMessage="No combo offers configured yet.">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <AdminTh>Offer Details</AdminTh>
            <AdminTh>Category</AdminTh>
            <AdminTh>Quantity Sequence</AdminTh>
            <AdminTh>Discount</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E3E3E3]">
          {offers.map((offer) => {
            const isEven = offer.sequence_type === 'even'
            return (
              <tr key={offer.id} className="hover:bg-[#F9FAFB] transition-colors">
                {/* Offer Details */}
                <AdminTd>
                  <div>
                    <span className="font-bold text-[#202223] text-[14px]">
                      {offer.title || `${offer.category_name || 'Category'} Combo`}
                    </span>
                    <p className="text-[12px] text-[#6D7175] mt-0.5">
                      Min {offer.min_quantity} products required
                    </p>
                  </div>
                </AdminTd>

                {/* Category */}
                <AdminTd>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-[#E1F3FA] text-[#005bd3]">
                    {offer.category_name || 'Category'}
                  </span>
                </AdminTd>

                {/* Sequence */}
                <AdminTd>
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider w-fit ${
                        isEven
                          ? 'bg-[#EBF3FC] text-[#1E56A0]'
                          : 'bg-[#FDF2E9] text-[#B85D19]'
                      }`}
                    >
                      {offer.sequence_type} sequence
                    </span>
                    <span className="text-[12px] font-mono text-[#5C5F62]">
                      {formatSequencePreview(offer.min_quantity, offer.sequence_type)}
                    </span>
                  </div>
                </AdminTd>

                {/* Discount */}
                <AdminTd>
                  <div>
                    <span className="font-bold text-[#202223] text-[13px]">
                      {formatDiscount(offer)}
                    </span>
                    <p className="text-[11px] text-[#6D7175]">
                      {offer.discount_type === 'flat' ? 'Flat per item' : 'Percentage off'}
                    </p>
                  </div>
                </AdminTd>

                {/* Status Toggle & Badge */}
                <AdminTd>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer" title="Toggle active status">
                      <input
                        type="checkbox"
                        checked={offer.is_active}
                        onChange={() => onToggleStatus(offer.id, offer.is_active)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#C9CCCF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#007F5F]"></div>
                    </label>
                    <StatusBadge status={offer.is_active ? 'Active' : 'Inactive'} />
                  </div>
                </AdminTd>

                {/* Actions Dropdown */}
                <AdminTd className="text-right">
                  <div className="flex items-center justify-end">
                    <AdminActionsDropdown
                      actions={[
                        {
                          label: offer.is_active ? 'Deactivate' : 'Activate',
                          icon: <Power className="w-4 h-4" />,
                          onClick: () => onToggleStatus(offer.id, offer.is_active),
                        },
                        {
                          label: 'Edit Offer',
                          icon: <Edit2 className="w-4 h-4" />,
                          onClick: () => onEdit(offer),
                        },
                        {
                          label: 'Delete Offer',
                          icon: <Trash2 className="w-4 h-4" />,
                          danger: true,
                          onClick: () => onDelete(offer.id),
                        },
                      ]}
                    />
                  </div>
                </AdminTd>
              </tr>
            )
          })}
        </tbody>
      </table>
    </AdminTableShell>
  )
}
