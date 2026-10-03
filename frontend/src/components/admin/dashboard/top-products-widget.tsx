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
      <h3 className="font-semibold text-[14px] text-[#202223] mb-6">Top Products</h3>
      
      {products.length === 0 ? (
        <p className="text-[13px] text-[#6D7175] mt-4">No product data for this period.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product, i) => (
            <div key={product.id} className="flex items-center gap-3">
              <span className="w-5 text-[12px] font-bold text-[#8C9196]">{i + 1}</span>
              <AdminThumbnail src={product.image} alt={product.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#202223] truncate">{product.name}</p>
                <p className="text-[13px] text-[#6D7175]">{product.unitsSold} sold</p>
              </div>
              <span className="text-[14px] font-semibold text-[#202223] whitespace-nowrap">
                ₹{product.revenue.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminCard>
  )
}

