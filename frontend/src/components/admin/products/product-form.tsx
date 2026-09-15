import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import type { AdminProduct, ProductStatus, AdminProductVariant } from '@/lib/admin/mock-admin-products'
import { useAdminProducts } from '@/context/admin-product-context'
import { useToast } from '@/context/toast-context'
import { ImageUploader } from './image-uploader'
import { VariantEditor } from './variant-editor'

interface ProductFormProps {
  initialData?: AdminProduct
  isEditing?: boolean
}

export function ProductForm({ initialData, isEditing }: ProductFormProps) {
  const navigate = useNavigate()
  const { addProduct, updateProduct } = useAdminProducts()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<AdminProduct>(initialData || {
    id: `prod-${Date.now()}`,
    name: '',
    description: '',
    gender: 'men',
    category: 'shirts',
    status: 'Draft',
    basePrice: 0,
    images: [],
    variants: []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof AdminProduct, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate network delay
    setTimeout(() => {
      if (isEditing) {
        updateProduct(formData)
        showToast('Product updated successfully')
      } else {
        addProduct(formData)
        showToast('Product created successfully')
      }
      setIsSubmitting(false)
      navigate({ to: '/admin/products' })
    }, 600)
  }

  return (
    <form onSubmit={handleSubmit} className="pb-24 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate({ to: '/admin/products' })}
            className="p-2 border border-ink/10 rounded-full hover:bg-ink/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ink/70" />
          </button>
          <div>
            <h2 className="font-fraunces text-2xl text-ink">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate({ to: '/admin/products' })}
            className="px-4 py-2 font-medium text-ink/70 hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-ink text-cloud px-6 py-2.5 rounded-xl font-medium hover:bg-sky hover:text-white transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm space-y-6">
            <h3 className="font-medium text-ink">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-2">Product Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky/50"
                placeholder="e.g. Classic Linen Shirt"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-2">Description</label>
              <textarea 
                rows={5}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky/50 resize-y"
                placeholder="Describe the product..."
              />
            </div>
          </div>

          {/* Media */}
          <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm">
            <ImageUploader 
              images={formData.images}
              onChange={(images) => handleChange('images', images)}
            />
          </div>

          {/* Variants */}
          <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm">
            <VariantEditor 
              variants={formData.variants}
              onChange={(variants) => handleChange('variants', variants)}
            />
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Status */}
          <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm space-y-4">
            <h3 className="font-medium text-ink">Status</h3>
            <select 
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky/50"
            >
              <option value="Active">Active (Visible)</option>
              <option value="Draft">Draft (Hidden)</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Organization */}
          <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm space-y-6">
            <h3 className="font-medium text-ink">Organization</h3>
            
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-2">Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky/50"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/70 mb-2">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky/50"
              >
                <option value="t-shirts">T-Shirts</option>
                <option value="shirts">Shirts</option>
                <option value="hoodies">Hoodies</option>
                <option value="sweatshirts">Sweatshirts</option>
                <option value="jackets">Jackets</option>
                <option value="jeans">Jeans</option>
                <option value="joggers">Joggers</option>
                <option value="shorts">Shorts</option>
                <option value="dresses">Dresses</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm space-y-4">
            <h3 className="font-medium text-ink">Pricing</h3>
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-2">Base Price (₹)</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.basePrice || ''}
                onChange={(e) => handleChange('basePrice', parseInt(e.target.value) || 0)}
                className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky/50"
                placeholder="0"
              />
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}
