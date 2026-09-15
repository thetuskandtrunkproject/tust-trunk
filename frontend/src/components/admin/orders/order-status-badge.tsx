interface OrderStatusBadgeProps {
  type: 'order' | 'payment'
  status: string
}

export function OrderStatusBadge({ type, status }: OrderStatusBadgeProps) {
  
  const getStyle = () => {
    if (type === 'order') {
      switch (status) {
        case 'Delivered': return 'bg-green-100 text-green-800 border-green-200'
        case 'Shipped': return 'bg-sky/10 text-sky border-sky/20'
        case 'Processing': return 'bg-[#F2C94C]/20 text-[#B28A00] border-[#F2C94C]/30'
        case 'Pending': return 'bg-ink/5 text-ink/70 border-ink/10'
        case 'Cancelled': return 'bg-rust/10 text-rust border-rust/20'
        default: return 'bg-ink/5 text-ink border-ink/10'
      }
    } else { // payment
      switch (status) {
        case 'Paid': return 'bg-green-100 text-green-800 border-green-200'
        case 'Pending': return 'bg-[#F2C94C]/20 text-[#B28A00] border-[#F2C94C]/30'
        case 'Failed': return 'bg-rust/10 text-rust border-rust/20'
        case 'Refunded': return 'bg-ink/10 text-ink/70 border-ink/20'
        default: return 'bg-ink/5 text-ink border-ink/10'
      }
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
      {status}
    </span>
  )
}
