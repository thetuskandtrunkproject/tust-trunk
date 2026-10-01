import { AdminCard, AdminThumbnail } from '@/components/admin/ui/primitives'

interface TopProductsWidgetProps {
  products: {
    id: string
    name: string
    unitsSold: number
    revenue: number
    image: string
  }[]
}

export function TopProductsWidget({ products }: TopProductsWidgetProps) {
  return (
    <AdminCard className="h-full flex flex-col">
      <h3 className="font-semibold text-ink mb-6">Top Products</h3>
      
      {products.length === 0 ? (
        <p className="text-sm text-ink/50 mt-4">No product data for this period.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product, i) => (
            <div key={product.id} className="flex items-center gap-3">
              <span className="w-5 text-xs font-bold text-ink/40">{i + 1}</span>
              <AdminThumbnail src={product.image} alt={product.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{product.name}</p>
                <p className="text-xs text-ink/50">{product.unitsSold} sold</p>
              </div>
              <span className="text-sm font-semibold text-ink whitespace-nowrap">
                ₹{product.revenue.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminCard>
  )
}
