import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Save,
  Check,
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  Tag,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { AdminButton } from '@/components/admin/ui/primitives'
import type { ComboOffer, ComboOfferFormData } from '@/lib/admin/offers-api'
import type { Category } from '@/lib/admin/categories-api'

interface OfferFormProps {
  initialData?: ComboOffer | null
  categories: Category[]
  onSubmit: (data: ComboOfferFormData) => Promise<void>
  isLoading?: boolean
}

export function OfferForm({
  initialData,
  categories,
  onSubmit,
  isLoading = false,
}: OfferFormProps) {
  const navigate = useNavigate()
  const isEditing = !!initialData

  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || (categories.length > 0 ? categories[0].id : '')
  )
  const [minQuantity, setMinQuantity] = useState(
    initialData ? initialData.min_quantity : 4
  )
  const [sequenceType, setSequenceType] = useState<'even' | 'odd'>(
    initialData ? initialData.sequence_type : 'even'
  )
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>(
    initialData ? initialData.discount_type : 'flat'
  )
  const [discountValue, setDiscountValue] = useState(
    initialData
      ? initialData.discount_type === 'flat'
        ? Math.round(initialData.discount_value / 100)
        : initialData.discount_value
      : 100
  )
  const [title, setTitle] = useState(initialData?.title || '')
  const [isActive, setIsActive] = useState(
    initialData ? initialData.is_active : true
  )

  const selectedCategory = categories.find((c) => c.id === categoryId)

  // Generate the first 5 eligible quantities in the sequence
  const sequencePreview = useMemo(() => {
    const list: number[] = []
    let curr = Math.max(1, Number(minQuantity) || 1)
    while (list.length < 5 && curr < 1000) {
      if (sequenceType === 'even' && curr % 2 === 0) {
        list.push(curr)
      } else if (sequenceType === 'odd' && curr % 2 !== 0) {
        list.push(curr)
      }
      curr++
    }
    return list
  }, [minQuantity, sequenceType])

  // Simulation table for quantities around minQuantity
  const simulationRows = useMemo(() => {
    const rows = []
    const baseQty = Math.max(1, Number(minQuantity) || 1)
    const startQty = Math.max(1, baseQty - 1)
    const endQty = startQty + 5
    const assumedItemPrice = 200 // Assumed ₹200 per product for clear preview

    for (let q = startQty; q <= endQty; q++) {
      const isQtyEligible =
        q >= baseQty &&
        (sequenceType === 'even' ? q % 2 === 0 : q % 2 !== 0)

      const originalTotal = q * assumedItemPrice
      let discountAmount = 0

      if (isQtyEligible) {
        if (discountType === 'flat') {
          discountAmount = q * Number(discountValue)
        } else {
          discountAmount = Math.round((originalTotal * Number(discountValue)) / 100)
        }
      }

      const finalPrice = Math.max(0, originalTotal - discountAmount)

      rows.push({
        quantity: q,
        originalTotal,
        discountAmount,
        finalPrice,
        isEligible: isQtyEligible,
      })
    }
    return rows
  }, [minQuantity, sequenceType, discountType, discountValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) return

    await onSubmit({
      category_id: categoryId,
      min_quantity: Number(minQuantity) || 1,
      sequence_type: sequenceType,
      discount_type: discountType,
      discount_value: Number(discountValue) || 0,
      title: title.trim() || undefined,
      is_active: isActive,
    })
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Top Navigation & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: '/admin/offers' as any })}
            className="p-2 text-[#5C5F62] hover:text-[#202223] hover:bg-[#F4F6F8] rounded-full transition-colors border border-transparent hover:border-[#E3E3E3]"
            title="Back to Offers"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#202223]">
                {isEditing ? 'Edit Combo Offer' : 'Add New Combo Offer'}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? 'bg-[#E3F1DF] text-[#007F5F]'
                    : 'bg-[#F4F6F8] text-[#6D7175]'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-[#6D7175] mt-1">
              Configure dynamic category-based rules, quantity sequence parity, and automatic cart discounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => navigate({ to: '/admin/offers' as any })}
          >
            Cancel
          </AdminButton>
          <AdminButton
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !categoryId}
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Offer'}
          </AdminButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Category & Title */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E3E3E3] p-6 space-y-5">
          <div className="border-b border-[#E3E3E3] pb-4">
            <h2 className="text-lg font-bold text-[#202223] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#005bd3]" />
              Category & Basic Information
            </h2>
            <p className="text-xs text-[#6D7175] mt-0.5">
              Select which category triggers this combo discount.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-[#202223] mb-1.5">
                Product Category <span className="text-[#D82C0D]">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full bg-[#F4F6F8] border border-[#C9CCCF] rounded-lg px-3.5 py-2.5 text-sm text-[#202223] focus:outline-none focus:border-[#005bd3] focus:bg-white transition-colors"
              >
                {categories.length === 0 && (
                  <option value="">No categories found</option>
                )}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.slug ? `(${cat.slug})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#6D7175] mt-1.5">
                Fetched live from database. The offer applies automatically to all products in this category.
              </p>
            </div>

            {/* Offer Title */}
            <div>
              <label className="block text-sm font-semibold text-[#202223] mb-1.5">
                Offer Title / Label <span className="text-xs text-[#6D7175] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  selectedCategory
                    ? `${selectedCategory.name} Combo Offer`
                    : 'e.g., Even Quantity Special Offer'
                }
                className="w-full bg-[#F4F6F8] border border-[#C9CCCF] rounded-lg px-3.5 py-2.5 text-sm text-[#202223] focus:outline-none focus:border-[#005bd3] focus:bg-white transition-colors"
              />
              <p className="text-xs text-[#6D7175] mt-1.5">
                Displayed in the cart drawer & order summary when discount is applied.
              </p>
            </div>
          </div>

          {/* Active Status Switch */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#C9CCCF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007F5F] relative"></div>
              <div>
                <span className="text-sm font-semibold text-[#202223]">
                  {isActive ? 'Offer is Active' : 'Offer is Inactive / Paused'}
                </span>
                <p className="text-xs text-[#6D7175]">
                  {isActive
                    ? 'Customers will automatically receive this discount in the cart & checkout when conditions match.'
                    : 'Inactive offers are ignored and will not be applied to customer carts.'}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 2: Quantity & Sequence Rules */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E3E3E3] p-6 space-y-5">
          <div className="border-b border-[#E3E3E3] pb-4">
            <h2 className="text-lg font-bold text-[#202223] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#005bd3]" />
              Quantity Sequence & Activation Rules
            </h2>
            <p className="text-xs text-[#6D7175] mt-0.5">
              Set the minimum items required and whether the combo requires even or odd quantities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimum Product Quantity */}
            <div>
              <label className="block text-sm font-semibold text-[#202223] mb-1.5">
                Minimum Product Quantity <span className="text-[#D82C0D]">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={minQuantity}
                onChange={(e) => setMinQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#F4F6F8] border border-[#C9CCCF] rounded-lg px-3.5 py-2.5 text-sm text-[#202223] focus:outline-none focus:border-[#005bd3] focus:bg-white transition-colors"
                required
              />
              <p className="text-xs text-[#6D7175] mt-1.5">
                The offer will only activate once the customer has at least this many items from the category.
              </p>
            </div>

            {/* Quantity Sequence */}
            <div>
              <label className="block text-sm font-semibold text-[#202223] mb-1.5">
                Quantity Sequence <span className="text-[#D82C0D]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSequenceType('even')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    sequenceType === 'even'
                      ? 'border-[#005bd3] bg-[#E1F3FA]/40 ring-1 ring-[#005bd3]'
                      : 'border-[#C9CCCF] bg-white hover:bg-[#F4F6F8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#202223]">Even Sequence</span>
                    {sequenceType === 'even' && (
                      <Check className="w-4 h-4 text-[#005bd3]" />
                    )}
                  </div>
                  <p className="text-xs text-[#6D7175] mt-1">
                    4, 6, 8, 10, 12... (even numbers)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSequenceType('odd')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    sequenceType === 'odd'
                      ? 'border-[#005bd3] bg-[#E1F3FA]/40 ring-1 ring-[#005bd3]'
                      : 'border-[#C9CCCF] bg-white hover:bg-[#F4F6F8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#202223]">Odd Sequence</span>
                    {sequenceType === 'odd' && (
                      <Check className="w-4 h-4 text-[#005bd3]" />
                    )}
                  </div>
                  <p className="text-xs text-[#6D7175] mt-1">
                    5, 7, 9, 11, 13... (odd numbers)
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Sequence Preview Box */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#005bd3]" />
                Calculated Eligible Quantities:
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#E1F3FA] text-[#005bd3] uppercase">
                {sequenceType}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {sequencePreview.map((qty) => (
                <span
                  key={qty}
                  className="px-3 py-1 bg-white border border-[#CBD5E1] rounded-md font-mono font-bold text-sm text-[#0F172A] shadow-sm"
                >
                  {qty} items
                </span>
              ))}
              <span className="text-sm font-semibold text-[#64748B] pl-1">...</span>
            </div>

            <p className="text-xs text-[#64748B] pt-1">
              The discount will apply automatically when the cart contains any of these eligible quantities.
              Quantities outside this sequence receive <strong className="text-[#0F172A]">₹0</strong> discount.
            </p>
          </div>
        </div>

        {/* SECTION 3: Discount Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E3E3E3] p-6 space-y-5">
          <div className="border-b border-[#E3E3E3] pb-4">
            <h2 className="text-lg font-bold text-[#202223] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#005bd3]" />
              Discount Calculation
            </h2>
            <p className="text-xs text-[#6D7175] mt-0.5">
              Choose between a fixed discount per eligible product or a percentage discount off the category total.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Flat */}
            <div
              onClick={() => setDiscountType('flat')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                discountType === 'flat'
                  ? 'border-[#005bd3] bg-[#E1F3FA]/30 ring-1 ring-[#005bd3]'
                  : 'border-[#C9CCCF] hover:bg-[#F4F6F8]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#202223]">
                  Option 1: Flat Discount Per Product
                </span>
                {discountType === 'flat' && (
                  <Check className="w-4 h-4 text-[#005bd3]" />
                )}
              </div>
              <p className="text-xs text-[#6D7175] mt-1">
                Fixed ₹ discount multiplied by every eligible product in the cart.
              </p>
            </div>

            {/* Option 2: Percentage */}
            <div
              onClick={() => setDiscountType('percent')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                discountType === 'percent'
                  ? 'border-[#005bd3] bg-[#E1F3FA]/30 ring-1 ring-[#005bd3]'
                  : 'border-[#C9CCCF] hover:bg-[#F4F6F8]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#202223]">
                  Option 2: Percentage Discount
                </span>
                {discountType === 'percent' && (
                  <Check className="w-4 h-4 text-[#005bd3]" />
                )}
              </div>
              <p className="text-xs text-[#6D7175] mt-1">
                Percentage deducted from the total cart value of this category.
              </p>
            </div>
          </div>

          {/* Discount Value Input */}
          <div className="max-w-md">
            <label className="block text-sm font-semibold text-[#202223] mb-1.5">
              {discountType === 'flat'
                ? 'Flat Discount Per Product (₹)'
                : 'Discount Percentage (%)'}{' '}
              <span className="text-[#D82C0D]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6D7175]">
                {discountType === 'flat' ? '₹' : '%'}
              </span>
              <input
                type="number"
                min={1}
                max={discountType === 'percent' ? 100 : undefined}
                value={discountValue}
                onChange={(e) =>
                  setDiscountValue(Math.max(1, parseInt(e.target.value) || 0))
                }
                className="w-full bg-[#F4F6F8] border border-[#C9CCCF] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-[#202223] font-bold focus:outline-none focus:border-[#005bd3] focus:bg-white transition-colors"
                required
              />
            </div>
            <p className="text-xs text-[#6D7175] mt-1.5">
              {discountType === 'flat'
                ? `Example: 4 products × ₹${discountValue} discount = ₹${4 * discountValue} total discount.`
                : `Example: 4 products costing ₹800 with ${discountValue}% off = ₹${Math.round((800 * discountValue) / 100)} total discount.`}
            </p>
          </div>
        </div>

        {/* SECTION 4: Live Rule Simulation Matrix */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E3E3E3] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#202223] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#005bd3]" />
                Live Rule Simulation
              </h2>
              <p className="text-xs text-[#6D7175] mt-0.5">
                Simulated cart calculation (assuming each product costs ₹200) to verify your logic:
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E3E3E3] bg-[#F9FAFB] text-xs font-bold text-[#5C5F62] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Products in Cart</th>
                  <th className="py-2.5 px-4">Original Price</th>
                  <th className="py-2.5 px-4">Discount</th>
                  <th className="py-2.5 px-4">Final Price</th>
                  <th className="py-2.5 px-4">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E3E3]">
                {simulationRows.map((row) => (
                  <tr
                    key={row.quantity}
                    className={
                      row.isEligible
                        ? 'bg-[#E3F1DF]/30 font-medium'
                        : 'text-[#6D7175] hover:bg-[#F9FAFB]'
                    }
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-[#202223]">
                      {row.quantity} products
                    </td>
                    <td className="py-2.5 px-4">₹{row.originalTotal.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4">
                      {row.discountAmount > 0 ? (
                        <span className="text-[#007F5F] font-bold">
                          - ₹{row.discountAmount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-[#8C9196]">₹0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#202223]">
                      ₹{row.finalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4">
                      {row.isEligible ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E3F1DF] text-[#007F5F]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Combo Applied
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F4F6F8] text-[#8C9196]">
                          <XCircle className="w-3.5 h-3.5" />
                          {row.quantity < Number(minQuantity)
                            ? `Below min (${minQuantity})`
                            : `Outside ${sequenceType} sequence`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3E3E3]">
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => navigate({ to: '/admin/offers' as any })}
          >
            Cancel
          </AdminButton>
          <AdminButton
            type="submit"
            disabled={isLoading || !categoryId}
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isLoading ? 'Saving Offer...' : isEditing ? 'Save Changes' : 'Create Combo Offer'}
          </AdminButton>
        </div>
      </form>
    </div>
  )
}
