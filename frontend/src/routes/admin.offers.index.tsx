import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { OfferTable } from '@/components/admin/offers/offer-table'
import {
  AdminPageHeader,
  AdminButton,
  ConfirmModal,
  AdminSpinner,
} from '@/components/admin/ui/primitives'
import {
  type ComboOffer,
  fetchAdminOffers,
  updateAdminOffer,
  deleteAdminOffer,
} from '@/lib/admin/offers-api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/offers/')({
  component: AdminOffersPage,
})

function AdminOffersPage() {
  const navigate = useNavigate()
  const [offers, setOffers] = useState<ComboOffer[]>([])
  const [loading, setLoading] = useState(true)
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
      const offersData = await fetchAdminOffers()
      setOffers(offersData)
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
          <Link to={'/admin/offers/new' as any}>
            <AdminButton icon={<Plus className="w-4 h-4" />}>
              Add New Offer
            </AdminButton>
          </Link>
        }
      />

      {loading ? (
        <AdminSpinner />
      ) : (
        <OfferTable
          offers={offers}
          onToggleStatus={handleToggleStatus}
          onEdit={(offer) => {
            navigate({ to: `/admin/offers/${offer.id}` as any })
          }}
          onDelete={handleDeleteClick}
        />
      )}

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
