import { type ReactNode, forwardRef, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
/* ─── AdminCard ─── */
interface AdminCardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export const AdminCard = forwardRef<HTMLDivElement, AdminCardProps>(
  ({ children, className = '', padding = true }, ref) => {
    return (
      <div 
        ref={ref}
        className={`bg-white rounded-xl shadow-sm border border-[#E3E3E3] ${padding ? 'p-5' : ''} ${className}`}
      >
        {children}
      </div>
    )
  }
)

/* ─── AdminCheckbox ─── */

interface AdminCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function AdminCheckbox({ checked, onChange, disabled }: AdminCheckboxProps) {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); !disabled && onChange(!checked); }}
      className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${
        checked ? 'bg-[#005bd3] border-[#005bd3] text-white' : 'bg-white border-[#8C9196] hover:border-[#5C5F62]'
      }`}
    >
      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
      <Search className="w-4 h-4 text-[#5C5F62] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-[#C9CCCF] text-[#202223] rounded-lg pl-9 pr-3 h-[36px] text-[13px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#005bd3] focus:border-transparent transition-all placeholder:text-[#8C9196]"
      />
    </div>
  )
}

/* ─── AdminSelect ─── */
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface AdminSelectProps {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  className?: string
}

export function AdminSelect({ value, onChange, children, className = '' }: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const options = React.Children.toArray(children).map(child => {
    if (React.isValidElement(child) && child.type === 'option') {
      const element = child as React.ReactElement<any>;
      return { value: element.props.value, label: element.props.children }
    }
    return null
  }).filter(Boolean) as { value: string, label: ReactNode }[]

  const selectedOption = options.find(opt => opt.value === String(value)) || options.find(opt => opt.label === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-[#C9CCCF] text-[#202223] rounded-full px-4 h-[36px] text-[13px] shadow-sm hover:border-[#8C9196] focus:outline-none focus:ring-2 focus:ring-[#005bd3] transition-all min-w-[130px]"
      >
        <span className="truncate pr-2 font-medium">{selectedOption?.label || value}</span>
        <ChevronDown className={`w-4 h-4 text-[#5C5F62] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[160px] bg-white border border-[#E3E3E3] rounded-xl shadow-lg z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt) => {
            const isSelected = opt.value === String(value)
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`flex items-center justify-between px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors mx-1 rounded-lg ${
                  isSelected 
                    ? 'bg-[#E1F3FA] text-[#005bd3]' 
                    : 'text-[#5C5F62] hover:bg-black/5 hover:text-[#202223]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 text-[#005bd3] ml-2 shrink-0" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
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
  success: 'bg-[#AEE9D1] text-[#007F5F]', // Shopify success
  warning: 'bg-[#FFEA8A] text-[#8A6116]', // Shopify warning
  danger:  'bg-[#FFC4B0] text-[#D82C0D]', // Shopify critical
  neutral: 'bg-[#E3E5E7] text-[#202223]', // Shopify basic
  info:    'bg-[#E1F3FA] text-[#006E8B]', // Shopify info
}

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolvedVariant = variant || STATUS_MAP[status] || 'neutral'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-semibold tracking-tight ${VARIANT_CLASSES[resolvedVariant]}`}>
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
  sm: 'w-8 h-8 rounded-[4px]',
  md: 'w-10 h-10 rounded-md',
  lg: 'w-12 h-12 rounded-lg',
}

export function AdminThumbnail({ src, alt = '', size = 'md' }: AdminThumbnailProps) {
  const [imgError, setImgError] = useImgState(false)

  return (
    <div className={`${SIZES[size]} bg-[#F4F6F8] shrink-0 border border-[#E3E3E3] flex items-center justify-center overflow-hidden`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <ImageIcon className="w-4 h-4 text-[#8C9196]" />
      )}
    </div>
  )
}

/* ─── AdminButton ─── */
import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-[#303030] text-white hover:bg-[#1A1A1A] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.05)] border border-transparent',
  secondary: 'bg-white text-[#202223] border border-[#C9CCCF] hover:bg-[#F4F6F8] shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
  ghost:     'text-[#5C5F62] hover:bg-[#F4F6F8] hover:text-[#202223]',
  danger:    'bg-white text-[#D82C0D] border border-[#C9CCCF] hover:bg-[#FBF1ED] shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
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
        inline-flex items-center justify-center gap-2 rounded-lg font-medium text-[13px] transition-colors cursor-pointer
        ${isIconOnly ? 'p-1.5' : 'px-4 h-[36px]'}
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
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-6">
      <div>
        <h2 className="font-semibold text-[22px] tracking-tight text-[#202223]">{title}</h2>
        {description && <p className="text-[#6D7175] text-[14px] mt-0.5">{description}</p>}
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
    <div className={`bg-white rounded-xl shadow-sm border border-[#E3E3E3] p-4 mb-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${className}`}>
      {children}
    </div>
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
    <div className="bg-white rounded-xl shadow-sm border border-[#E3E3E3]">
      <div className="overflow-x-auto">
        {children}
      </div>
      {isEmpty && (
        <div className="p-12 text-center text-[#6D7175] text-[13px] font-medium">{emptyMessage}</div>
      )}
    </div>
  )
}

/* ─── AdminTh / AdminTd helpers ─── */
export function AdminTh({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-5 py-3 text-[13px] font-semibold text-[#5C5F62] bg-[#F9FAFB] border-b border-[#E3E3E3] ${className}`} {...props}>
      {children}
    </th>
  )
}

export function AdminTd({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-5 py-3 text-[14px] text-[#202223] border-b border-[#E3E3E3] ${className}`} {...props}>
      {children}
    </td>
  )
}

/* ─── Spinner ─── */
export function AdminSpinner() {
  return (
    <div className="flex justify-center p-12">
      <div className="w-8 h-8 rounded-full border-[3px] border-[#E3E3E3] border-t-[#005bd3] animate-spin" />
    </div>
  )
}

/* ─── AdminActionsDropdown ─── */
import { MoreHorizontal } from 'lucide-react'

export interface AdminActionItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  danger?: boolean
}

interface AdminActionsDropdownProps {
  actions: AdminActionItem[]
}

export function AdminActionsDropdown({ actions }: AdminActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleScroll = () => {
      if (isOpen) setIsOpen(false)
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('scroll', handleScroll, true)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      let top = rect.bottom + 4
      if (top + 250 > window.innerHeight) {
        top = rect.top - 4 - Math.min(250, (actions.length * 40 + 40))
      }
      setDropdownStyle({
        position: 'fixed',
        top: top + 'px',
        left: Math.max(10, rect.right - 192) + 'px',
        width: '192px',
        zIndex: 9999,
      })
    }
  }, [isOpen, actions.length])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1.5 rounded-md text-[#5C5F62] hover:bg-[#F4F6F8] hover:text-[#202223] transition-colors focus:outline-none"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef} 
          style={dropdownStyle} 
          className="bg-white border border-[#E3E3E3] rounded-xl shadow-lg py-2 animate-in fade-in duration-200"
        >
          <div className="px-3 pb-2 mb-1 border-b border-[#E3E3E3] text-[12px] font-semibold text-[#8C9196] uppercase tracking-wider">
            Actions
          </div>
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick()
                setIsOpen(false)
              }}
              className={`w-full flex items-center px-4 py-2 text-[13px] font-medium transition-colors hover:bg-[#F4F6F8] ${
                action.danger ? 'text-[#D82C0D] hover:bg-[#FBF1ED]' : 'text-[#202223]'
              }`}
            >
              {action.icon && <span className="mr-3 opacity-70">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

/* ─── AdminDatePicker ─── */
export { AdminDatePicker } from './admin-date-picker'
export function AdminModal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  children: React.ReactNode 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between">
          <h3 className="font-semibold text-ink text-lg">{title}</h3>
          <button 
            onClick={onClose}
            className="text-ink/50 hover:text-ink transition-colors p-1 rounded-md hover:bg-ink/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}) {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-ink/80 mb-8">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-md font-medium text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2 ${
            isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-ink hover:bg-ink/90'
          }`}
        >
          {isLoading && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {confirmText}
        </button>
      </div>
    </AdminModal>
  )
}

