import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react'
import type { Category } from '@/lib/admin/categories-api'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/admin/categories-api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/categories/')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', gender: 'Women', is_active: true })

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id)
      setFormData({ name: cat.name, slug: cat.slug, description: cat.description, gender: cat.gender, is_active: cat.is_active })
    } else {
      setEditingId(null)
      setFormData({ name: '', slug: '', description: '', gender: 'Women', is_active: true })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateCategory(editingId, formData)
        showToast('Category updated successfully')
      } else {
        await createCategory({ ...formData, gender: 'Women' })
        showToast('Category created successfully')
      }
      setIsModalOpen(false)
      loadCategories()
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await deleteCategory(id)
      showToast('Category deleted successfully')
      loadCategories()
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to delete category (it may be in use)')
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  if (loading && categories.length === 0) {
    return <div className="flex justify-center items-center min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-4 border-ink/20 border-t-sky animate-spin"></div>
    </div>
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300">
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
            <h1 className="font-heading font-bold text-3xl text-ink">Categories</h1>
            <p className="text-ink/60 mt-1">Manage product categories</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-ink text-cloud px-6 py-2.5 rounded-xl font-medium hover:bg-sky hover:text-white transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cloud border-b border-ink/10 text-xs font-medium text-ink/60 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-ink/5 hover:bg-cloud/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ink">{cat.name}</td>
                  <td className="px-6 py-4 text-ink/70">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      cat.is_active ? 'bg-forest/10 text-forest' : 'bg-rust/10 text-rust'
                    }`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(cat)}
                        className="p-2 text-ink/40 hover:text-sky hover:bg-sky/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-ink/40 hover:text-rust hover:bg-rust/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-ink/50">
                    No categories found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-ink/10">
              <h3 className="font-heading font-bold text-xl text-ink">
                {editingId ? 'Edit Category' : 'New Category'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData(prev => ({ 
                      ...prev, 
                      name, 
                      slug: editingId ? prev.slug : generateSlug(name) 
                    }))
                  }}
                  className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky/50"
                  placeholder="e.g. T-Shirts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Slug</label>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                  className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky/50"
                  placeholder="e.g. t-shirts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky/50"
                >
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-cloud border border-ink/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sky/50 resize-y"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-sky border-ink/20 rounded focus:ring-sky"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-ink/70">
                  Active (visible in store)
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10 mt-6">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 font-medium text-ink/70 hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-ink text-cloud px-6 py-2 rounded-xl font-medium hover:bg-sky hover:text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-cloud/30 border-t-cloud rounded-full animate-spin"></div>
                  ) : (
                    editingId ? 'Save Changes' : 'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
