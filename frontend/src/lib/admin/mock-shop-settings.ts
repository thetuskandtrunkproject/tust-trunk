export interface ShopSettings {
  companyName: string
  gstNumber: string
  businessWebsite: string
  
  primaryPhone: string
  secondaryPhone: string
  businessEmail: string
  supportEmail: string
  
  addressLine: string
  city: string
  state: string
  country: string
  pincode: string
  
  whatsappNumber: string
  instagramUrl: string
  facebookUrl: string
  youtubeUrl: string
  
  maintenanceMode: boolean
  
  gstEnabled: boolean
  gstPercentage: number
  
  homeStatePincodePrefixes: string
  shippingChargeHomeState: number
  shippingChargeOtherStates: number
  freeShippingEnabled: boolean
  freeShippingThreshold: number
}

export const MOCK_SHOP_SETTINGS: ShopSettings = {
  companyName: "The Tusk & Trunk",
  gstNumber: "22AAAAA0000A1Z5",
  businessWebsite: "https://thetuskandtrunk.com",
  
  primaryPhone: "+91 9876543210",
  secondaryPhone: "",
  businessEmail: "hello@thetuskandtrunk.com",
  supportEmail: "support@thetuskandtrunk.com",
  
  addressLine: "123 Heritage Block, Textile Hub",
  city: "Surat",
  state: "Gujarat",
  country: "India",
  pincode: "395002",
  
  whatsappNumber: "+91 9876543210",
  instagramUrl: "https://instagram.com/thetuskandtrunk",
  facebookUrl: "https://facebook.com/thetuskandtrunk",
  youtubeUrl: "",
  
  maintenanceMode: false,
  
  gstEnabled: true,
  gstPercentage: 5,
  
  homeStatePincodePrefixes: "36, 37, 38, 39",
  shippingChargeHomeState: 50,
  shippingChargeOtherStates: 100,
  freeShippingEnabled: true,
  freeShippingThreshold: 3000,
}
