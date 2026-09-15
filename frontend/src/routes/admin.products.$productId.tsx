import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ProductForm } from '@/components/admin/products/product-form'
import { useAdminProducts } from '@/context/admin-product-context'
import { useEffect } from 'react'

export const Route = createFileRoute('/admin/products/$productId')({
  component: EditProductPage,
})

function EditProductPage() {
  const { productId } = Route.useParams()
  const { products } = useAdminProducts()
  const navigate = useNavigate()

  const product = products.find(p => p.id === productId)

  useEffect(() => {
    if (!product && products.length > 0) {
      navigate({ to: '/admin/products' })
    }
  }, [product, products, navigate])

  if (!product) return null

  return <ProductForm initialData={product} isEditing={true} />
}
