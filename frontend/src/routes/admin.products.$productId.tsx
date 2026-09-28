import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ProductForm } from '@/components/admin/products/product-form'
import { useEffect, useState } from 'react'
import type { AdminProduct } from '@/lib/admin/products-api'
import { fetchAdminProduct } from '@/lib/admin/products-api'
import { useToast } from '@/context/toast-context'

export const Route = createFileRoute('/admin/products/$productId')({
  component: EditProductPage,
})

function EditProductPage() {
  const { productId } = Route.useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [product, setProduct] = useState<AdminProduct | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchAdminProduct(productId)
        setProduct(data)
      } catch (err: any) {
        showToast('Failed to load product')
        navigate({ to: '/admin/products' })
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [productId, navigate, showToast])

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-4 border-ink/20 border-t-sky animate-spin"></div>
    </div>
  }

  if (!product) return null

  return <ProductForm initialData={product} isEditing={true} />
}
