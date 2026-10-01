import { Plus, Trash2 } from 'lucide-react'
import type { AdminProductVariant } from '@/lib/admin/products-api'

interface VariantEditorProps {
  variants: AdminProductVariant[]
  onChange: (variants: AdminProductVariant[]) => void
}

export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  
  const handleAddVariant = () => {
    const newVariant = {
      id: `v${Date.now()}`,
      sku: '',
      size: '',
      price: 0,
      stock: 0,
      is_active: true
    }
    onChange([...variants, newVariant])
  }

  const handleUpdateVariant = (id: string, field: keyof AdminProductVariant, value: string | number) => {
    const newVariants = variants.map(v => {
      if (v.id === id) {
        return { ...v, [field]: value }
      }
      return v
    })
    onChange(newVariants)
  }

  const handleRemoveVariant = (id: string) => {
    onChange(variants.filter(v => v.id !== id))
  }

  const inputClassName = "w-full bg-white border border-[#D1D5DB] text-[#111827] rounded-md px-2 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#005bd3] focus:border-[#005bd3] transition-colors"

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-[#111827]">Variants</h2>
        <button 
          type="button"
          onClick={handleAddVariant}
          className="text-[13px] font-medium text-[#005bd3] hover:text-[#004c99] transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add options
        </button>
      </div>

      <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[12px] font-medium text-[#6B7280]">
                <th className="px-3 py-2 w-1/4">Size</th>
                <th className="px-3 py-2 w-1/4">SKU</th>
                <th className="px-3 py-2 w-1/4">Inventory</th>
                <th className="px-3 py-2 w-1/4">Price (₹)</th>
                <th className="px-3 py-2 w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] bg-white">
              {variants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <span className="text-[13px] text-[#6B7280]">
                      This product has no variants.
                    </span>
                  </td>
                </tr>
              ) : (
                variants.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-3 py-2">
                      <input 
                        type="text"
                        required
                        value={v.size}
                        onChange={(e) => handleUpdateVariant(v.id, 'size', e.target.value)}
                        placeholder="e.g. S, M"
                        className={inputClassName}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="text"
                        required
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(v.id, 'sku', e.target.value)}
                        placeholder="SKU"
                        className={inputClassName}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="number"
                        required
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className={inputClassName}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.price ? (v.price / 100).toString() : ''}
                        onChange={(e) => handleUpdateVariant(v.id, 'price', Math.round(parseFloat(e.target.value) * 100) || 0)}
                        placeholder="Default"
                        className={inputClassName}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button 
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="p-1 text-[#9CA3AF] hover:text-[#EF4444] rounded transition-colors"
                        title="Remove Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
