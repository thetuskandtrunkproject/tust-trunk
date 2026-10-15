import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { OfferTable } from '@/components/admin/offers/offer-table'
import { OfferFormModal } from '@/components/admin/offers/offer-form-modal'
import {
  AdminPageHeader,
  AdminButton,
  ConfirmModal,
  AdminSpinner,
} from '@/components/admin/ui/primitives'
import {
  type ComboOffer,
  type ComboOfferFormData,
  fetchAdminOffers,
  createAdminOffer,
  updateAdminOffer,
  deleteAdminOffer,
} from '@/lib/admin/offers-api'
import { type Category, fetchCategories } from '@/lib/admin/categories-api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/offers/')({
  component: AdminOffersPage,
})

function AdminOffersPage() {
  const [offers, setOffers] = useState<ComboOffer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<ComboOffer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    id: string
    title?: string
    message?: string
  }>({ isOpen: false, id: '' })

  const loadData = async () => {
    setLoading(true)
    try {
      const [offersData, categoriesData] = await Promise.all([
        fetchAdminOffers(),
        fetchCategories(),
      ])
      setOffers(offersData)
      setCategories(categoriesData)
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to load offers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const activeCount = offers.filter((o) => o.is_active).length
  const inactiveCount = offers.filter((o) => !o.is_active).length

  const handleOpenCreate = () => {
    setEditingOffer(null)
    setFormModalOpen(true)
  }

  const handleOpenEdit = (offer: ComboOffer) => {
    setEditingOffer(offer)
    setFormModalOpen(true)
  }

  const handleSaveOffer = async (formData: ComboOfferFormData) => {
    setIsSubmitting(true)
    try {
      if (editingOffer) {
        await updateAdminOffer(editingOffer.id, formData)
        showToast('Combo offer updated successfully', 'success')
      } else {
        await createAdminOffer(formData)
        showToast('Combo offer created successfully', 'success')
      }
      setFormModalOpen(false)
      setEditingOffer(null)
      loadData()
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to save offer', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateAdminOffer(id, { is_active: !currentStatus })
      showToast(
        `Offer marked as ${!currentStatus ? 'Active' : 'Inactive'}`,
        'success'
      )
      loadData()
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to update status', 'error')
    }
  }

  const handleDeleteClick = (id: string) => {
    const target = offers.find((o) => o.id === id)
    setConfirmModal({
      isOpen: true,
      id,
      title: 'Delete Combo Offer',
      message: `Are you sure you want to delete the offer "${target?.title || 'this offer'}"? This action cannot be undone.`,
    })
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteAdminOffer(confirmModal.id)
      showToast('Combo offer deleted successfully', 'success')
      setConfirmModal({ isOpen: false, id: '' })
      loadData()
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to delete offer', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <AdminPageHeader
        title="Category Combo Offers"
        description={`Active: ${activeCount} · Inactive: ${inactiveCount}`}
        actions={
          <AdminButton
            onClick={handleOpenCreate}
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Offer
          </AdminButton>
        }
      />

      {loading ? (
        <AdminSpinner />
      ) : (
        <OfferTable
          offers={offers}
          onToggleStatus={handleToggleStatus}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Add / Edit Form Modal */}
      <OfferFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingOffer(null)
        }}
        onSave={handleSaveOffer}
        offer={editingOffer}
        categories={categories}
        isLoading={isSubmitting}
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: '' })}
        onConfirm={handleConfirmDelete}
        title={confirmModal.title || 'Delete Offer'}
        message={
          confirmModal.message ||
          'Are you sure you want to delete this offer?'
        }
        confirmText="Delete Offer"
        isDestructive={true}
      />
    </div>
  )
}
