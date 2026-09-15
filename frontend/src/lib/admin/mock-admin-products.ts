export type ProductStatus = 'Active' | 'Draft' | 'Archived'

export interface AdminProductVariant {
  id: string
  sku: string
  size: string
  stock: number
}

export interface AdminProduct {
  id: string
  name: string
  description: string
  gender: string
  category: string
  status: ProductStatus
  basePrice: number
  images: string[]
  variants: AdminProductVariant[]
}

const generateMockAdminProducts = (): AdminProduct[] => {
  return [
    {
      id: 'prod-001',
      name: 'Classic Linen Shirt',
      description: 'A breathable, lightweight linen shirt perfect for summer days.',
      gender: 'men',
      category: 'shirts',
      status: 'Active',
      basePrice: 2499,
      images: ['https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&fit=crop'],
      variants: [
        { id: 'v1', sku: 'M-LIN-SH-WHT-S', size: 'S', stock: 12 },
        { id: 'v2', sku: 'M-LIN-SH-WHT-M', size: 'M', stock: 45 },
        { id: 'v3', sku: 'M-LIN-SH-WHT-L', size: 'L', stock: 0 },
        { id: 'v4', sku: 'M-LIN-SH-NVY-M', size: 'M', stock: 3 },
        { id: 'v5', sku: 'M-LIN-SH-NVY-L', size: 'L', stock: 18 }
      ]
    },
    {
      id: 'prod-002',
      name: 'Essential Cotton Tee',
      description: 'The perfect everyday t-shirt, made from 100% organic cotton.',
      gender: 'women',
      category: 't-shirts',
      status: 'Active',
      basePrice: 999,
      images: ['https://images.unsplash.com/photo-1503341455253-b2e723bb3db8?q=80&w=800&fit=crop'],
      variants: [
        { id: 'v6', sku: 'W-TEE-BLK-S', size: 'S', stock: 120 },
        { id: 'v7', sku: 'W-TEE-BLK-M', size: 'M', stock: 85 },
        { id: 'v8', sku: 'W-TEE-BLK-L', size: 'L', stock: 42 },
        { id: 'v9', sku: 'W-TEE-GRY-S', size: 'S', stock: 15 },
        { id: 'v10', sku: 'W-TEE-GRY-M', size: 'M', stock: 2 }
      ]
    },
    {
      id: 'prod-003',
      name: 'Everyday Straight Fit Jeans',
      description: 'Classic straight fit denim that gets better with every wash.',
      gender: 'men',
      category: 'jeans',
      status: 'Active',
      basePrice: 2999,
      images: ['https://images.unsplash.com/photo-1542272604-780c8d52a5ce?q=80&w=800&fit=crop'],
      variants: [
        { id: 'v11', sku: 'M-JNS-BLU-30', size: '30', stock: 5 },
        { id: 'v12', sku: 'M-JNS-BLU-32', size: '32', stock: 12 },
        { id: 'v13', sku: 'M-JNS-BLU-34', size: '34', stock: 8 }
      ]
    },
    {
      id: 'prod-004',
      name: 'Oversized Premium Hoodie',
      description: 'Ultra-soft fleece hoodie with an oversized drop-shoulder fit.',
      gender: 'women',
      category: 'hoodies',
      status: 'Draft',
      basePrice: 3999,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&fit=crop'],
      variants: [
        { id: 'v14', sku: 'W-HOD-CRM-S', size: 'S', stock: 0 },
        { id: 'v15', sku: 'W-HOD-CRM-M', size: 'M', stock: 0 },
        { id: 'v16', sku: 'W-HOD-CRM-L', size: 'L', stock: 0 }
      ]
    },
    {
      id: 'prod-005',
      name: 'Kids Play Tee',
      description: 'Durable, stain-resistant tee for everyday adventures.',
      gender: 'kids',
      category: 't-shirts',
      status: 'Active',
      basePrice: 749,
      images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&fit=crop'],
      variants: [
        { id: 'v17', sku: 'K-TEE-YLW-4Y', size: '4Y', stock: 35 },
        { id: 'v18', sku: 'K-TEE-YLW-6Y', size: '6Y', stock: 22 },
        { id: 'v19', sku: 'K-TEE-RED-4Y', size: '4Y', stock: 4 }
      ]
    },
    {
      id: 'prod-006',
      name: 'Summer Breeze Dress',
      description: 'Flowy, lightweight summer dress with adjustable straps.',
      gender: 'women',
      category: 'dresses',
      status: 'Archived',
      basePrice: 2299,
      images: ['https://images.unsplash.com/photo-1572804013309-84a8f1035985?q=80&w=800&fit=crop'],
      variants: [
        { id: 'v20', sku: 'W-DRS-FLR-S', size: 'S', stock: 0 },
        { id: 'v21', sku: 'W-DRS-FLR-M', size: 'M', stock: 0 }
      ]
    },
    {
      id: 'prod-007',
      name: 'Classic Chino Shorts',
      description: 'Tailored chino shorts with a 7-inch inseam.',
      gender: 'men',
      category: 'shorts',
      status: 'Active',
      basePrice: 1499,
      images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&fit=crop'],
      variants: [
        { id: 'v22', sku: 'M-SHO-KHK-30', size: '30', stock: 15 },
        { id: 'v23', sku: 'M-SHO-KHK-32', size: '32', stock: 28 },
        { id: 'v24', sku: 'M-SHO-NVY-32', size: '32', stock: 4 }
      ]
    },
    {
      id: 'prod-008',
      name: 'Cozy Knit Sweater',
      description: 'Chunky knit sweater for chilly evenings.',
      gender: 'women',
      category: 'sweatshirts',
      status: 'Active',
      basePrice: 2899,
      images: ['https://images.unsplash.com/photo-1614068595701-1b6c08ad6895?q=80&w=800&fit=crop'],
      variants: [
        { id: 'v25', sku: 'W-SWT-OAT-S', size: 'S', stock: 8 },
        { id: 'v26', sku: 'W-SWT-OAT-M', size: 'M', stock: 12 },
        { id: 'v27', sku: 'W-SWT-OAT-L', size: 'L', stock: 2 }
      ]
    }
  ]
}

export const initialAdminProducts = generateMockAdminProducts()
