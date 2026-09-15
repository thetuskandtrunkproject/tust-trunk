import { TrendingUp } from 'lucide-react'

interface TopProduct {
  id: string
  name: string
  unitsSold: number
  revenue: number
  image: string
}

interface TopProductsWidgetProps {
  products: TopProduct[]
}

export function TopProductsWidget({ products }: TopProductsWidgetProps) {
  
  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`

  return (
    <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-ink flex items-center gap-2">
          Top Selling Products <TrendingUp className="w-4 h-4 text-sky" />
        </h3>
        <button className="text-xs text-sky font-medium hover:underline">View All</button>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center gap-4 p-2 hover:bg-ink/[0.02] rounded-xl transition-colors -mx-2">
            <span className="w-4 text-center text-xs font-bold text-ink/40">{index + 1}</span>
            <div className="w-12 aspect-[3/4] rounded-md overflow-hidden bg-cloud shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate mb-1">{product.name}</p>
              <p className="text-xs text-ink/60">{product.unitsSold} units sold</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{formatPrice(product.revenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
