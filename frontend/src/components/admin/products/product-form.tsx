import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import type { AdminProduct } from '@/lib/admin/products-api'
import { 
  createAdminProduct, 
  updateAdminProduct, 
  addVariant, 
  updateVariant, 
  deactivateVariant,
  uploadProductImage,
  deleteProductImage
} from '@/lib/admin/products-api'
import type { Category } from '@/lib/admin/categories-api'
import { fetchCategories } from '@/lib/admin/categories-api'
import { useToast } from '@/context/toast-context'
import { ImageUploader } from './image-uploader'
import { VariantEditor } from './variant-editor'

interface ProductFormProps {
  initialData?: AdminProduct
  isEditing?: boolean
}

export function ProductForm({ initialData, isEditing }: ProductFormProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<AdminProduct>(initialData || {
    id: '',
    name: '',
    slug: '',
    description: '',
    gender: 'Women',
    category_id: '',
    category: '',
    status: 'Draft',
    images: [],
    tags: [],
    variants: [],
    created_at: '',
    updated_at: ''
  })

  const [newFiles, setNewFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories()
        setCategories(cats)
        if (!initialData && cats.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: cats[0].id, category: cats[0].name }))
        }
      } catch (e) {
        showToast('Failed to load categories')
      }
    }
    loadCategories()
  }, [initialData])

  const handleChange = (field: keyof AdminProduct, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.variants.length === 0) {
      showToast('You must add at least one variant')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      if (isEditing && initialData) {
        // 1. Update Product details
        await updateAdminProduct(formData.id, {
          name: formData.name,
          description: formData.description,
          gender: formData.gender,
          category_id: formData.category_id,
          status: formData.status,
        })
        
        // 2. Diff and Update Variants
        const currentVariantIds = formData.variants.map(v => v.id)
        for (const v of formData.variants) {
          if (v.id.startsWith('v')) {
            // new variant added during edit
            await addVariant(formData.id, { sku: v.sku, size: v.size, price: v.price, stock: v.stock })
          } else {
            // update existing
            await updateVariant(formData.id, v.id, { sku: v.sku, size: v.size, price: v.price, stock: v.stock })
          }
        }
        
        // deactivate removed variants
        for (const orig of initialData.variants) {
          if (!currentVariantIds.includes(orig.id)) {
            await deactivateVariant(formData.id, orig.id)
          }
        }
        
        // 3. Diff and update images
        const currentImages = formData.images
        for (const orig of initialData.images || []) {
          if (!currentImages.includes(orig)) {
            await deleteProductImage(formData.id, orig)
          }
        }
        
        for (const file of newFiles) {
          await uploadProductImage(formData.id, file)
        }
        
        showToast('Product updated successfully')
        
      } else {
        // Create new product
        const slug = generateSlug(formData.name)
        
        // 1. Create product and initial variants atomically
        const payload = {
          name: formData.name,
          slug: slug,
          description: formData.description,
          gender: formData.gender,
          category_id: formData.category_id,
          status: formData.status,
          variants: formData.variants.map(v => ({
            sku: v.sku,
            size: v.size,
            price: v.price,
            stock: v.stock
          }))
        }
        
        const createdProduct = await createAdminProduct(payload)
        
        // 2. Upload images
        for (const file of newFiles) {
          await uploadProductImage(createdProduct.id, file)
        }
        
        showToast('Product created successfully')
      }
      
      navigate({ to: '/admin/products' })
      
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'An error occurred while saving')
    } finally {
      setIsSubmitting(false)
    }
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
            <h2 className="font-heading font-bold text-2xl text-ink">
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
              existingImages={formData.images}
              newFiles={newFiles}
              onAddFiles={(files) => setNewFiles([...newFiles, ...files])}
              onRemoveExisting={(url) => handleChange('images', formData.images.filter(img => img !== url))}
              onRemoveNewFile={(idx) => {
                const next = [...newFiles]
                next.splice(idx, 1)
                setNewFiles(next)
              }}
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
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/70 mb-2">Category</label>
              <select 
                required
                value={formData.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky/50"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}
