import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/context/toast-context'
import { Check, X, Clock, ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/admin/reviews/')({
  component: AdminReviewsPage,
})

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('pending') // pending, approved, rejected
  const { showToast } = useToast()

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const query = filter ? `?status=${filter}` : ''
      const res = await api.get(`/api/v1/admin/reviews${query}`)
      setReviews(res.data)
    } catch (err) {
      showToast('Failed to load reviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/v1/admin/reviews/${id}/status`, { status })
      showToast(`Review ${status}`, 'success')
      fetchReviews()
    } catch (err) {
      showToast('Failed to update status', 'error')
    }
  }

  const deleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return
    try {
      await api.delete(`/api/v1/admin/reviews/${id}`)
      showToast('Review deleted', 'success')
      fetchReviews()
    } catch (err) {
      showToast('Failed to delete review', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-bold text-3xl text-ink">Reviews Management</h1>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', ''].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${
                filter === status 
                  ? 'bg-ink text-white' 
                  : 'bg-white border border-ink/10 text-ink/70 hover:border-ink/30'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-ink/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink/50 font-medium">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-ink/50 font-medium">No reviews found.</div>
        ) : (
          <div className="divide-y divide-ink/10">
            {reviews.map(review => (
              <div key={review.id} className="p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 shrink-0">
                  <div className="aspect-square rounded-xl bg-ink/5 overflow-hidden mb-3">
                    {review.products?.images?.[0] ? (
                      <img src={review.products.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink/20">No Image</div>
                    )}
                  </div>
                  <p className="font-bold text-sm text-ink line-clamp-2">{review.products?.name}</p>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-ink mr-2">{review.reviewer_name}</span>
                      <span className="text-sm text-ink/50">{new Date(review.created_at).toLocaleDateString()}</span>
                      {review.guest_email && (
                        <p className="text-xs text-ink/50 mt-0.5">Guest: {review.guest_email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${review.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                          review.status === 'rejected' ? 'bg-red-50 text-red-600' :
                          'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex text-sunshine text-lg mb-3">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className={star <= review.rating ? 'text-sunshine' : 'text-ink/10'}>★</span>
                    ))}
                  </div>

                  <p className="text-ink/80 text-sm leading-relaxed mb-4 flex-1">
                    {review.body_text}
                  </p>

                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-ink/5">
                    {review.status !== 'approved' && (
                      <button 
                        onClick={() => updateStatus(review.id, 'approved')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button 
                        onClick={() => updateStatus(review.id, 'rejected')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    )}
                    <button 
                      onClick={() => deleteReview(review.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-ink/5 text-ink/60 rounded-lg text-sm font-bold hover:bg-ink/10 hover:text-rust transition-colors ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
