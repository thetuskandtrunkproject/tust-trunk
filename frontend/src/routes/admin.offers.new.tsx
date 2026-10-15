import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { OfferForm } from '@/components/admin/offers/offer-form'
import { createAdminOffer, type ComboOfferFormData } from '@/lib/admin/offers-api'
import { fetchCategories, type Category } from '@/lib/admin/categories-api'
import { useToast } from '@/context/toast-context'
import { AdminSpinner } from '@/components/admin/ui/primitives'

export const Route = createFileRoute('/admin/offers/new')({
  component: AdminNewOfferPage,
})

function AdminNewOfferPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const cats = await fetchCategories()
        setCategories(cats)
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Failed to load categories', 'error')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleSubmit = async (formData: ComboOfferFormData) => {
    setIsSubmitting(true)
    try {
      await createAdminOffer(formData)
      showToast('Combo offer created successfully', 'success')
      navigate({ to: '/admin/offers' as any })
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to create combo offer', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <AdminSpinner />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-300">
      <OfferForm
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
