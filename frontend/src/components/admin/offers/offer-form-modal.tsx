import { useState, useEffect } from 'react'
import { X, Sparkles, Check, HelpCircle, Layers } from 'lucide-react'
import { AdminModal } from '@/components/admin/ui/primitives'
import type { ComboOffer, ComboOfferFormData } from '@/lib/admin/offers-api'
import type { Category } from '@/lib/admin/categories-api'

interface OfferFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ComboOfferFormData) => Promise<void>
  offer?: ComboOffer | null
  categories: Category[]
  isLoading?: boolean
}

export function OfferFormModal({
  isOpen,
  onClose,
  onSave,
  offer,
  categories,
  isLoading = false,
}: OfferFormModalProps) {
  const [categoryId, setCategoryId] = useState('')
  const [minQuantity, setMinQuantity] = useState(4)
  const [sequenceType, setSequenceType] = useState<'even' | 'odd'>('even')
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat')
  const [discountValue, setDiscountValue] = useState(100)
  const [title, setTitle] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Initialize form when opened or offer changes
  useEffect(() => {
    if (offer) {
      setCategoryId(offer.category_id)
      setMinQuantity(offer.min_quantity)
      setSequenceType(offer.sequence_type)
      setDiscountType(offer.discount_type)
      setDiscountValue(
        offer.discount_type === 'flat'
          ? Math.round(offer.discount_value / 100)
          : offer.discount_value
      )
      setTitle(offer.title || '')
      setIsActive(offer.is_active)
    } else {
      setCategoryId(categories.length > 0 ? categories[0].id : '')
      setMinQuantity(4)
      setSequenceType('even')
      setDiscountType('flat')
      setDiscountValue(100)
      setTitle('')
      setIsActive(true)
    }
  }, [offer, isOpen, categories])

  // Generate sequence preview dynamically
  const generateSequencePreview = (minQty: number, seq: 'even' | 'odd'): number[] => {
    const list: number[] = []
    let curr = Math.max(1, minQty)
    while (list.length < 5) {
      if (seq === 'even' && curr % 2 === 0) {
        list.push(curr)
      } else if (seq === 'odd' && curr % 2 !== 0) {
        list.push(curr)
      }
      curr++
    }
    return list
  }

  const sequencePreview = generateSequencePreview(minQuantity, sequenceType)
  const selectedCategory = categories.find((c) => c.id === categoryId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) return

    await onSave({
      category_id: categoryId,
      min_quantity: minQuantity,
      sequence_type: sequenceType,
      discount_type: discountType,
      discount_value: discountValue,
      title: title.trim() || undefined,
      is_active: isActive,
    })
  }

  if (!isOpen) return null

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={offer ? 'Edit Combo Offer' : 'Add New Combo Offer'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Selection */}
        <div>
          <label className="block text-[13px] font-semibold text-[#202223] mb-1.5">
            Product Category <span className="text-[#D82C0D]">*</span>
          </label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full bg-white border border-[#C9CCCF] text-[#202223] rounded-lg px-3.5 py-2.5 text-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005bd3] focus:border-transparent transition-all"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.gender || 'Storewide'})
                </option>
              ))}
            </select>
          </div>
          <p className="text-[12px] text-[#6D7175] mt-1">
            Category list is fetched dynamically from the store database.
          </p>
        </div>

        {/* Min Quantity & Sequence Parity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#202223] mb-1.5">
              Minimum Quantity <span className="text-[#D82C0D]">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={minQuantity}
              onChange={(e) => setMinQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              required
              className="w-full bg-white border border-[#C9CCCF] text-[#202223] rounded-lg px-3.5 py-2 text-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005bd3] focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-[#6D7175] mt-1">E.g. 4 products to activate</p>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#202223] mb-1.5">
              Quantity Sequence <span className="text-[#D82C0D]">*</span>
            </label>
            <select
              value={sequenceType}
              onChange={(e) => setSequenceType(e.target.value as 'even' | 'odd')}
              className="w-full bg-white border border-[#C9CCCF] text-[#202223] rounded-lg px-3.5 py-2 text-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005bd3] focus:border-transparent transition-all"
            >
              <option value="even">Even Sequence</option>
              <option value="odd">Odd Sequence</option>
            </select>
            <p className="text-[11px] text-[#6D7175] mt-1">
              Applies only to {sequenceType} numbers
            </p>
          </div>
        </div>

        {/* Dynamic Sequence Preview Card */}
        <div className="bg-[#F6F6F7] border border-[#E1E3E5] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[12px] font-semibold text-[#202223] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#005bd3]" />
              Calculated Sequence Preview:
            </span>
            <span className="text-[#005bd3] font-bold text-[11px] uppercase tracking-wider">
              {sequenceType}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {sequencePreview.map((qty, idx) => (
              <span
                key={idx}
                className="bg-white border border-[#C9CCCF] text-[#202223] px-2.5 py-0.5 rounded-md font-bold text-[12px] shadow-xs"
              >
                {qty}
              </span>
            ))}
            <span className="text-[#6D7175] text-[13px] font-bold">...</span>
          </div>
          <p className="text-[11px] text-[#6D7175] mt-2">
            The discount will apply automatically when the cart contains any of these eligible quantities. Quantities outside this sequence receive no discount.
          </p>
        </div>

        {/* Discount Type Selection */}
        <div>
          <label className="block text-[13px] font-semibold text-[#202223] mb-1.5">
            Discount Type <span className="text-[#D82C0D]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDiscountType('flat')}
              className={`p-3 rounded-xl border text-left transition-all ${
                discountType === 'flat'
                  ? 'border-[#005bd3] bg-[#E1F3FA] text-[#005bd3]'
                  : 'border-[#C9CCCF] bg-white text-[#202223] hover:border-[#8C9196]'
              }`}
            >
              <div className="font-bold text-[13px] flex items-center justify-between">
                <span>Flat Per Product</span>
                {discountType === 'flat' && <Check className="w-4 h-4 text-[#005bd3]" />}
              </div>
              <p className="text-[11px] mt-1 text-[#6D7175]">Fixed ₹ discount per eligible item</p>
            </button>

            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={`p-3 rounded-xl border text-left transition-all ${
                discountType === 'percent'
                  ? 'border-[#005bd3] bg-[#E1F3FA] text-[#005bd3]'
                  : 'border-[#C9CCCF] bg-white text-[#202223] hover:border-[#8C9196]'
              }`}
            >
              <div className="font-bold text-[13px] flex items-center justify-between">
                <span>Percentage (%)</span>
                {discountType === 'percent' && <Check className="w-4 h-4 text-[#005bd3]" />}
              </div>
              <p className="text-[11px] mt-1 text-[#6D7175]">% off total category price</p>
            </button>
          </div>
        </div>

        {/* Discount Value Input */}
        <div>
          <label className="block text-[13px] font-semibold text-[#202223] mb-1.5">
            {discountType === 'flat' ? 'Flat Discount Per Product (₹)' : 'Discount Percentage (%)'}{' '}
            <span className="text-[#D82C0D]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D7175] font-bold text-[14px]">
              {discountType === 'flat' ? '₹' : '%'}
            </span>
            <input
              type="number"
              min={1}
              max={discountType === 'percent' ? 100 : 50000}
              value={discountValue}
              onChange={(e) => setDiscountValue(Math.max(1, parseInt(e.target.value) || 1))}
              required
              className="w-full bg-white border border-[#C9CCCF] text-[#202223] rounded-lg pl-8 pr-3.5 py-2 text-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005bd3] focus:border-transparent transition-all"
            />
          </div>
          <p className="text-[11px] text-[#6D7175] mt-1">
            {discountType === 'flat'
              ? `Example: 4 products × ₹${discountValue} = ₹${4 * discountValue} total discount.`
              : `Example: 4 products at ₹200 (₹800) gets ${discountValue}% off = ₹${Math.round(800 * (discountValue / 100))} total discount.`}
          </p>
        </div>

        {/* Title / Description */}
        <div>
          <label className="block text-[13px] font-semibold text-[#202223] mb-1.5">
            Offer Name / Title <span className="text-[#6D7175] font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder={
              selectedCategory
                ? `${selectedCategory.name} Combo: ${discountType === 'flat' ? `₹${discountValue} off/item` : `${discountValue}% off`}`
                : 'Special Combo Offer'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-[#C9CCCF] text-[#202223] rounded-lg px-3.5 py-2 text-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005bd3] focus:border-transparent transition-all placeholder:text-[#8C9196]"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E1E3E5]">
          <div>
            <p className="font-bold text-[13px] text-[#202223]">Offer Status</p>
            <p className="text-[11px] text-[#6D7175]">
              Active offers apply automatically in cart and checkout
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#C9CCCF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007F5F]"></div>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3E3E3]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium text-[13px] text-[#5C5F62] hover:bg-[#F4F6F8] hover:text-[#202223] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !categoryId}
            className="px-5 py-2 bg-[#303030] text-white hover:bg-[#1A1A1A] rounded-lg font-bold text-[13px] shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {offer ? 'Save Changes' : 'Create Offer'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
