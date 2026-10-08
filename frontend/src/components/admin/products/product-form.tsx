import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Plus, Loader2, Calendar } from 'lucide-react'
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
import { AdminSpinner } from '../ui/primitives'

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

  const [basePrice, setBasePrice] = useState<string>('')
  const [onSale, setOnSale] = useState(false)
  const [salePrice, setSalePrice] = useState<string>('')
  const [saleStartDate, setSaleStartDate] = useState<string>('')
  const [saleEndDate, setSaleEndDate] = useState<string>('')
  const [collectionBadge, setCollectionBadge] = useState<string>(initialData?.tags?.[0] || 'None')

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

    if (initialData) {
      if (initialData.variants && initialData.variants.length > 0) {
        setBasePrice((initialData.variants[0].price / 100).toString())
        const sp = initialData.variants[0].sale_price
        if (sp) {
          setOnSale(true)
          setSalePrice((sp / 100).toString())
        }
        const sd = initialData.variants[0].sale_start_date
        if (sd) setSaleStartDate(sd.split('T')[0])
        const ed = initialData.variants[0].sale_end_date
        if (ed) setSaleEndDate(ed.split('T')[0])
      }
    }
  }, [initialData])

  const handleChange = (field: keyof AdminProduct, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) return showToast('Product name is required', 'error')
    if (!formData.slug?.trim()) return showToast('Slug (URL handle) is required', 'error')
    if (!formData.category_id) return showToast('Category is required', 'error')
    if (!formData.variants || formData.variants.length === 0) return showToast('You must add at least one variant', 'error')
    if (!basePrice || parseFloat(basePrice) <= 0) return showToast('Valid base price is required', 'error')

    const invalidVariant = formData.variants.find(v => !v.sku?.trim() || !v.size?.trim())
    if (invalidVariant) return showToast('All variants must have a SKU and Size', 'error')

    setIsSubmitting(true)

    try {
      const tags = collectionBadge !== 'None' ? [collectionBadge] : []
      if (isEditing && initialData) {
        await updateAdminProduct(formData.id, {
          name: formData.name,
          description: formData.description,
          gender: formData.gender,
          category_id: formData.category_id,
          status: formData.status,
          slug: formData.slug,
          tags: tags,
          details: formData.details || []
        })
        const currentVariantIds = formData.variants.map(v => v.id)
        for (const v of formData.variants) {
          const finalPrice = v.price > 0 ? v.price : Math.round(parseFloat(basePrice || '0') * 100)
          const finalSalePrice = onSale && salePrice ? Math.round(parseFloat(salePrice) * 100) : null
          const payload = { 
            sku: v.sku, 
            size: v.size, 
            price: finalPrice, 
            stock: v.stock, 
            sale_price: finalSalePrice || undefined,
            sale_start_date: saleStartDate ? new Date(saleStartDate).toISOString() : undefined,
            sale_end_date: saleEndDate ? new Date(saleEndDate).toISOString() : undefined
          }
          if (v.id.startsWith('v')) {
            await addVariant(formData.id, payload)
          } else {
            await updateVariant(formData.id, v.id, payload)
          }
        }
        for (const orig of initialData.variants) {
          if (!currentVariantIds.includes(orig.id)) {
            await deactivateVariant(formData.id, orig.id)
          }
        }
        for (const file of newFiles) {
          await uploadProductImage(formData.id, file)
        }
        showToast('Product updated successfully')
        navigate({ to: '/admin/products' })
      } else {
        const bp = parseFloat(basePrice || '0') * 100
        const sp = onSale && salePrice ? parseFloat(salePrice) * 100 : undefined
        const variantsPayload = formData.variants.map(v => ({
          sku: v.sku, 
          size: v.size, 
          price: v.price > 0 ? v.price : bp, 
          stock: v.stock, 
          sale_price: sp,
          sale_start_date: saleStartDate ? new Date(saleStartDate).toISOString() : undefined,
          sale_end_date: saleEndDate ? new Date(saleEndDate).toISOString() : undefined
        }))
        const newProduct = await createAdminProduct({
          name: formData.name, slug: formData.slug, description: formData.description, gender: formData.gender,
          category_id: formData.category_id, status: formData.status, images: [], tags: tags, details: formData.details || [], variants: variantsPayload
        })
        for (const file of newFiles) {
          await uploadProductImage(newProduct.id, file)
        }
        showToast('Product created successfully')
        navigate({ to: '/admin/products' })
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Something went wrong', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteImage = async (url: string) => {
    if (!initialData || !isEditing) return
    if (!window.confirm('Remove this image?')) return
    try {
      await deleteProductImage(formData.id, url)
      setFormData(prev => ({ ...prev, images: prev.images.filter(i => i !== url) }))
      showToast('Image removed')
    } catch (err) {
      showToast('Failed to remove image', 'error')
    }
  }

  const handleAddDetail = () => {
    const newDetails = [...(formData.details || []), { key: '', value: '' }]
    handleChange('details', newDetails)
  }

  const handleUpdateDetail = (index: number, field: 'key' | 'value', val: string) => {
    const newDetails = [...(formData.details || [])]
    newDetails[index] = { ...newDetails[index], [field]: val }
    handleChange('details', newDetails)
  }

  const handleRemoveDetail = (index: number) => {
    const newDetails = (formData.details || []).filter((_, i) => i !== index)
    handleChange('details', newDetails)
  }

  // Professional styling (Shopify/Stripe-like)
  const inputClassName = "w-full bg-white border border-[#D1D5DB] text-[#111827] rounded-md px-3 py-2 text-[14px] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#005bd3] focus:border-[#005bd3] transition-colors"
  const labelClassName = "block text-[13px] font-medium text-[#374151] mb-1.5"
  const cardClassName = "bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-5"
  const sectionTitleClassName = "text-[16px] font-semibold text-[#111827] mb-4"

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1000px] mx-auto pb-24 font-sans text-[#111827]">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: '/admin/products' })}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[20px] font-semibold text-[#111827]">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="bg-white border border-[#D1D5DB] text-[#111827] rounded-md px-3 py-1.5 text-[14px] font-medium shadow-sm focus:outline-none focus:border-[#005bd3]"
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#005bd3] hover:bg-[#004c99] text-white px-4 py-1.5 rounded-md font-medium text-[14px] flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Information */}
          <div className={cardClassName}>
            <h2 className={sectionTitleClassName}>General</h2>

            <div className="space-y-4">
              <div>
                <label className={labelClassName}>Title</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    handleChange('name', e.target.value)
                    if (!isEditing) handleChange('slug', generateSlug(e.target.value))
                  }}
                  placeholder="Short sleeve t-shirt"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Description</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={`${inputClassName} resize-y`}
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className={cardClassName}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={sectionTitleClassName} style={{ marginBottom: 0 }}>Media</h2>
            </div>
            <ImageUploader
              existingImages={formData.images || []}
              newFiles={newFiles}
              onAddFiles={(files) => setNewFiles(prev => [...prev, ...files])}
              onRemoveExisting={handleDeleteImage}
              onRemoveNewFile={(index) => setNewFiles(prev => prev.filter((_, i) => i !== index))}
              onReorderExisting={(dragIndex, dropIndex) => {
                const newImages = [...formData.images]
                const draggedItem = newImages[dragIndex]
                newImages.splice(dragIndex, 1)
                newImages.splice(dropIndex, 0, draggedItem)
                handleChange('images', newImages)
              }}
              onReplaceExisting={async (index, newFile) => {
                try {
                  const oldUrl = formData.images[index]
                  const updatedProduct = await uploadProductImage(formData.id, newFile)
                  const newUrl = updatedProduct.images[updatedProduct.images.length - 1]
                  const newImages = [...formData.images]
                  newImages[index] = newUrl
                  handleChange('images', newImages)
                  await deleteProductImage(formData.id, oldUrl)
                  // Update the backend with the correct order immediately
                  await updateAdminProduct(formData.id, { ...formData, images: newImages })
                } catch (e) {
                  showToast('Failed to replace image', 'error')
                }
              }}
              onReplaceNewFile={(index, newFile) => {
                setNewFiles(prev => {
                  const arr = [...prev]
                  arr[index] = newFile
                  return arr
                })
              }}
            />
          </div>

          {/* Variants */}
          <div className={cardClassName}>
            <VariantEditor
              productName={formData.name}
              variants={formData.variants || []}
              onChange={(variants) => handleChange('variants', variants)}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Pricing */}
          <div className={cardClassName}>
            <h2 className={sectionTitleClassName}>Pricing</h2>

            <div className="space-y-4">
              <div>
                <label className={labelClassName}>Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">₹</span>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={e => setBasePrice(e.target.value)}
                    onKeyDown={(e) => { if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault() }}
                    placeholder="0"
                    className={`${inputClassName} pl-7`}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB]">
                <label className="flex items-center gap-2 cursor-pointer mb-3 mt-1">
                  <input
                    type="checkbox"
                    checked={onSale}
                    onChange={(e) => setOnSale(e.target.checked)}
                    className="w-4 h-4 text-[#005bd3] border-[#D1D5DB] rounded focus:ring-[#005bd3]"
                  />
                  <span className="text-[13px] font-medium text-[#374151]">Set compare at price (Sale)</span>
                </label>

                {onSale && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClassName}>Sale Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">₹</span>
                        <input
                          type="number"
                          value={salePrice}
                          onChange={e => setSalePrice(e.target.value)}
                          onKeyDown={(e) => { if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault() }}
                          placeholder="0"
                          className={`${inputClassName} pl-7`}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className={labelClassName}>Start Date (Optional)</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9196]" />
                          <input
                            type="date"
                            value={saleStartDate}
                            onChange={e => setSaleStartDate(e.target.value)}
                            onClick={e => (e.target as any).showPicker?.()}
                            className={`${inputClassName} pl-9`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClassName}>End Date (Optional)</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9196]" />
                          <input
                            type="date"
                            value={saleEndDate}
                            onChange={e => setSaleEndDate(e.target.value)}
                            onClick={e => (e.target as any).showPicker?.()}
                            className={`${inputClassName} pl-9`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Details (Key-Value) */}
          <div className={cardClassName}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={sectionTitleClassName} style={{ marginBottom: 0 }}>Product Details</h2>
              <button
                type="button"
                onClick={handleAddDetail}
                className="text-[13px] font-medium text-[#005bd3] hover:text-[#004c99] transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Detail
              </button>
            </div>

            <p className="text-[12px] text-[#6B7280] mb-4">
              Add custom specifications like Material, Fit, or Care Instructions.
            </p>

            <div className="space-y-3">
              {!(formData.details && formData.details.length > 0) && (
                <div className="text-[13px] text-[#6B7280] bg-[#F9FAFB] p-3 rounded border border-[#E5E7EB] text-center">
                  No details added yet.
                </div>
              )}
              {formData.details?.map((detail, index) => (
                <div key={index} className="flex items-start gap-2">
                  <input
                    type="text"
                    required
                    value={detail.key}
                    onChange={(e) => handleUpdateDetail(index, 'key', e.target.value)}
                    placeholder="Key (e.g. Material)"
                    className={`${inputClassName.replace('w-full', '')} flex-1 min-w-0`}
                  />
                  <input
                    type="text"
                    required
                    value={detail.value}
                    onChange={(e) => handleUpdateDetail(index, 'value', e.target.value)}
                    placeholder="Value (e.g. 100% Cotton)"
                    className={`${inputClassName.replace('w-full', '')} flex-1 min-w-0`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(index)}
                    className="p-2 text-[#9CA3AF] hover:text-[#EF4444] rounded transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Organization */}
          <div className={cardClassName}>
            <h2 className={sectionTitleClassName}>Product organization</h2>

            <div className="space-y-4">
              {!initialData && (
                <div>
                  <label className={labelClassName}>Category</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => handleChange('category_id', e.target.value)}
                    className={inputClassName}
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={labelClassName}>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className={inputClassName}
                >
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              <div>
                <label className={labelClassName}>Collection Badge</label>
                <select
                  value={collectionBadge}
                  onChange={(e) => setCollectionBadge(e.target.value)}
                  className={inputClassName}
                >
                  <option value="None">None</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="New Arrival">New Arrival</option>
                  <option value="Limited Edition">Limited Edition</option>
                </select>
              </div>

              <div>
                <label className={labelClassName}>Slug (URL handle)</label>
                <input
                  required
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}

