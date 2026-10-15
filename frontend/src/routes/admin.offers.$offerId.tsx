import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { OfferForm } from '@/components/admin/offers/offer-form'
import {
  fetchAdminOfferById,
  updateAdminOffer,
  type ComboOffer,
  type ComboOfferFormData,
} from '@/lib/admin/offers-api'
import { fetchCategories, type Category } from '@/lib/admin/categories-api'
import { useToast } from '@/context/toast-context'
import { AdminSpinner } from '@/components/admin/ui/primitives'

export const Route = createFileRoute('/admin/offers/$offerId')({
  component: AdminEditOfferPage,
})

function AdminEditOfferPage() {
  const { offerId } = Route.useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [offer, setOffer] = useState<ComboOffer | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [offerData, cats] = await Promise.all([
          fetchAdminOfferById(offerId),
          fetchCategories(),
        ])
        setOffer(offerData)
        setCategories(cats)
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Failed to load combo offer', 'error')
        navigate({ to: '/admin/offers' as any })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [offerId])

  const handleSubmit = async (formData: ComboOfferFormData) => {
    setIsSubmitting(true)
    try {
      await updateAdminOffer(offerId, formData)
      showToast('Combo offer updated successfully', 'success')
      navigate({ to: '/admin/offers' as any })
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to update combo offer', 'error')
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

  if (!offer) {
    return null
  }

  return (
    <div className="animate-in fade-in duration-300">
      <OfferForm
        initialData={offer}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
