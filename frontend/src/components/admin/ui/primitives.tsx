import { type ReactNode } from 'react'

/* ─── AdminCard ─── */
interface AdminCardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function AdminCard({ children, className = '', padding = true }: AdminCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-ink/10 shadow-sm ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}

/* ─── AdminSearchInput ─── */
import { Search } from 'lucide-react'

interface AdminSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function AdminSearchInput({ value, onChange, placeholder = 'Search...', className = '' }: AdminSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-cloud border border-ink/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-sky/40 focus:ring-2 focus:ring-sky/10 transition-all placeholder:text-ink/40"
      />
    </div>
  )
}

/* ─── AdminSelect ─── */
interface AdminSelectProps {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  className?: string
}

export function AdminSelect({ value, onChange, children, className = '' }: AdminSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-cloud border border-ink/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-sky/40 focus:ring-2 focus:ring-sky/10 transition-all appearance-none cursor-pointer pr-8 min-w-[130px] ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
      }}
    >
      {children}
    </select>
  )
}

/* ─── StatusBadge ─── */
type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const STATUS_MAP: Record<string, StatusVariant> = {
  // Orders
  'Delivered': 'success',
  'Shipped': 'info',
  'Out for Delivery': 'info',
  'Processing': 'warning',
  'Pending': 'warning',
  'Cancelled': 'danger',
  // Payments
  'Paid': 'success',
  'Failed': 'danger',
  'Refunded': 'neutral',
  // Products
  'Active': 'success',
  'Draft': 'warning',
  'Archived': 'neutral',
  // Inventory
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger',
  // Coupons
  'Expired': 'danger',
  'Inactive': 'neutral',
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  info:    'bg-sky-50 text-sky-700 border-sky-200',
}

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolvedVariant = variant || STATUS_MAP[status] || 'neutral'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${VARIANT_CLASSES[resolvedVariant]}`}>
      {status}
    </span>
  )
}

/* ─── AdminThumbnail ─── */
import { ImageIcon } from 'lucide-react'
import { useState as useImgState } from 'react'

interface AdminThumbnailProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

export function AdminThumbnail({ src, alt = '', size = 'md' }: AdminThumbnailProps) {
  const [imgError, setImgError] = useImgState(false)

  return (
    <div className={`${SIZES[size]} bg-cloud rounded-lg overflow-hidden shrink-0 border border-ink/5 flex items-center justify-center`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <ImageIcon className="w-4 h-4 text-ink/20" />
      )}
    </div>
  )
}

/* ─── AdminButton ─── */
import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-ink text-cloud hover:bg-sky hover:text-white shadow-sm',
  secondary: 'bg-cloud text-ink/70 border border-ink/10 hover:bg-ink/5 hover:text-ink',
  ghost:     'text-ink/50 hover:text-ink hover:bg-ink/5',
  danger:    'text-red-600 hover:text-red-700 hover:bg-red-50',
}

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
  children?: ReactNode
}

export function AdminButton({ variant = 'primary', icon, children, className = '', ...props }: AdminButtonProps) {
  const isIconOnly = icon && !children
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-colors
        ${isIconOnly ? 'p-2' : 'px-4 py-2.5'}
        ${BUTTON_CLASSES[variant]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  )
}

/* ─── AdminPageHeader ─── */
interface AdminPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-8">
      <div>
        <h2 className="font-heading font-bold text-2xl text-ink">{title}</h2>
        {description && <p className="text-ink/60 text-sm mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

/* ─── AdminFilterBar ─── */
interface AdminFilterBarProps {
  children: ReactNode
  className?: string
}

export function AdminFilterBar({ children, className = '' }: AdminFilterBarProps) {
  return (
    <AdminCard className={`!p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${className}`}>
      {children}
    </AdminCard>
  )
}

/* ─── AdminTableShell ─── */
interface AdminTableShellProps {
  children: ReactNode
  emptyMessage?: string
  isEmpty?: boolean
}

export function AdminTableShell({ children, emptyMessage = 'No data found.', isEmpty }: AdminTableShellProps) {
  return (
    <AdminCard padding={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        {children}
      </div>
      {isEmpty && (
        <div className="p-12 text-center text-ink/50 font-medium">{emptyMessage}</div>
      )}
    </AdminCard>
  )
}

/* ─── AdminTh / AdminTd helpers ─── */
export function AdminTh({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-6 py-4 text-xs font-semibold text-ink/50 uppercase tracking-wider ${className}`} {...props}>
      {children}
    </th>
  )
}

export function AdminTd({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </td>
  )
}

/* ─── Spinner ─── */
export function AdminSpinner() {
  return (
    <div className="flex justify-center p-12">
      <div className="w-8 h-8 rounded-full border-[3px] border-ink/10 border-t-sky animate-spin" />
    </div>
  )
}
