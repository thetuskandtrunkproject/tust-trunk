import { Plus, Trash2 } from 'lucide-react'
import type { AdminProductVariant } from '@/lib/admin/mock-admin-products'

interface VariantEditorProps {
  variants: AdminProductVariant[]
  onChange: (variants: AdminProductVariant[]) => void
}

export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  
  const handleAddVariant = () => {
    const newVariant: AdminProductVariant = {
      id: `v${Date.now()}`,
      sku: '',
      size: '',
      stock: 0
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-ink">Variants</h3>
        <button 
          type="button"
          onClick={handleAddVariant}
          className="text-sm font-medium text-sky hover:text-sky/80 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Option
        </button>
      </div>

      <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cloud border-b border-ink/10 text-xs font-medium text-ink/60 uppercase tracking-wider">
                <th className="px-4 py-3 w-1/3">Size</th>
                <th className="px-4 py-3 w-1/3">SKU</th>
                <th className="px-4 py-3 w-1/3">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {variants.map((variant) => (
                <tr key={variant.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-2">
                    <input 
                      type="text" 
                      placeholder="e.g. M"
                      value={variant.size}
                      onChange={(e) => handleUpdateVariant(variant.id, 'size', e.target.value)}
                      className="w-full bg-transparent border border-ink/10 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-sky/50"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => handleUpdateVariant(variant.id, 'sku', e.target.value)}
                      className="w-full bg-transparent border border-ink/10 rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-sky/50"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      min="0"
                      value={variant.stock}
                      onChange={(e) => handleUpdateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent border border-ink/10 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-sky/50"
                    />
                  </td>
                  <td className="p-2 text-right pr-4">
                    <button 
                      type="button"
                      onClick={() => handleRemoveVariant(variant.id)}
                      className="p-1.5 text-ink/40 hover:text-rust hover:bg-rust/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {variants.length === 0 && (
          <div className="p-8 text-center text-ink/50 text-sm">
            No variants added yet. Products without variants can't be purchased.
          </div>
        )}
      </div>
    </div>
  )
}
