export type Product = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  gender: 'Men' | 'Women' | 'Kids'
  category: string
  sizes: string[]
  images: string[]
  tags: string[]
}

export const brandColors = {
  ink: '#1F2A33',
  sky: '#AFD3EA',
  blush: '#E8A6B0',
  butter: '#F3D673',
  cloud: '#FAF7F2',
  white: '#FFFFFF',
  charcoal: '#333333',
  olive: '#556B2F',
  rust: '#b7410e',
}

const getImg = (id: string) => `https://images.weserv.nl/?url=images.unsplash.com/photo-${id}&w=800&h=1000&fit=cover&output=webp`

export const mockProducts: Product[] = [
  // Men (8 items)
  { 
    id: 'm1', slug: 'essential-oversized-tee', name: 'Essential Oversized Tee', price: 2499, gender: 'Men', category: 'Tees', sizes: ['S', 'M', 'L', 'XL'], 
    images: [getImg('1521572163474-6864f9cf17ab'), getImg('1516257984099-ce11ed6e0018')], tags: ['new', 'bestseller'],
    description: 'Our iconic oversized tee crafted from heavy-weight, breathable organic cotton. A slightly dropped shoulder and boxy fit make it the ultimate everyday essential.'
  },
  { 
    id: 'm2', slug: 'relaxed-fit-jogger', name: 'Relaxed Fit Jogger', price: 3499, gender: 'Men', category: 'Pants', sizes: ['M', 'L', 'XL', 'XXL'], 
    images: [getImg('1552902865-b72c031ac5ea'), getImg('1617127365659-c47fa864d8bc')], tags: ['bestseller'],
    description: 'Lounge in style or hit the streets in these relaxed fit joggers. Made with ultra-soft French terry with ribbed cuffs and an adjustable drawstring waist.'
  },
  { 
    id: 'm3', slug: 'premium-heavyweight-hoodie', name: 'Premium Heavyweight Hoodie', price: 4999, gender: 'Men', category: 'Hoodies', sizes: ['S', 'M', 'L', 'XL'], 
    images: [getImg('1556821840-3a63f95609a7'), getImg('1583316174775-bd5a5b29074a')], tags: ['new'],
    description: 'The hoodie you’ll never want to take off. Features a double-lined hood, kangaroo pocket, and premium 400gsm cotton fleece for unmatched warmth.'
  },
  { 
    id: 'm4', slug: 'classic-linen-shirt', name: 'Classic Linen Shirt', price: 3999, gender: 'Men', category: 'Shirts', sizes: ['M', 'L', 'XL'], 
    images: [getImg('1603252109303-2751441dd157'), getImg('1507676184212-d4c3045fc11b')], tags: [],
    description: 'Breezy and effortlessly sharp. Our classic button-down is spun from 100% European flax linen, pre-washed for immediate softness.'
  },
  { 
    id: 'm5', slug: 'textured-knit-polo', name: 'Textured Knit Polo', price: 3299, gender: 'Men', category: 'Shirts', sizes: ['S', 'M', 'L'], 
    images: [getImg('1581655353564-df123a1eb820'), getImg('1512436991641-6745cdb1723f')], tags: [],
    description: 'Elevate your casual wear with this vintage-inspired knit polo. Featuring a distinct ribbed texture and open collar design.'
  },
  { 
    id: 'm6', slug: 'everyday-chino-shorts', name: 'Everyday Chino Shorts', price: 2899, gender: 'Men', category: 'Shorts', sizes: ['30', '32', '34', '36'], 
    images: [getImg('1591195853828-11db59a44f6b'), getImg('1530864380905-961d6db0d33f')], tags: ['new'],
    description: 'Tailored for comfort, styled for versatility. These chino shorts sit just above the knee and are woven with a hint of stretch.'
  },
  { 
    id: 'm7', slug: 'vintage-wash-denim', name: 'Vintage Wash Denim', price: 5499, gender: 'Men', category: 'Jeans', sizes: ['30', '32', '34'], 
    images: [getImg('1542272454315-4c01d7abdf4a'), getImg('1605518216938-7c31b7b14ad0')], tags: ['bestseller'],
    description: 'A timeless straight leg cut with an authentic vintage wash. Built to fade and mold uniquely to you over time.'
  },
  { 
    id: 'm8', slug: 'lightweight-windbreaker', name: 'Lightweight Windbreaker', price: 5999, gender: 'Men', category: 'Outerwear', sizes: ['M', 'L', 'XL'], 
    images: [getImg('1559551409-dadc959f76b8'), getImg('1506152983158-b4a74a01c721')], tags: [],
    description: 'Your go-to layer for unpredictable weather. Water-resistant, highly packable, and finished with secure zip pockets.'
  },
  
  // Women (8 items)
  { 
    id: 'w1', slug: 'classic-denim-jacket', name: 'Classic Denim Jacket', price: 5999, gender: 'Women', category: 'Outerwear', sizes: ['XS', 'S', 'M', 'L'], 
    images: [getImg('1544441893-675973e31985'), getImg('1509631179647-0c4429724143')], tags: ['new'],
    description: 'A classic staple reimagined. Crafted from rigid yet comfortable denim, featuring a slightly cropped silhouette.'
  },
  { 
    id: 'w2', slug: 'everyday-sweatshirt', name: 'Everyday Sweatshirt', price: 3999, gender: 'Women', category: 'Sweatshirts', sizes: ['S', 'M', 'L'], 
    images: [getImg('1554568218-0f1715e72254'), getImg('1515886657613-9f3515b0c78f')], tags: ['new', 'bestseller'],
    description: 'The perfect layering piece. This everyday sweatshirt is garment-dyed for a washed, lived-in look right out of the box.'
  },
  { 
    id: 'w3', slug: 'ribbed-knit-midi-dress', name: 'Ribbed Knit Midi Dress', price: 4999, gender: 'Women', category: 'Dresses', sizes: ['XS', 'S', 'M'], 
    images: [getImg('1572804013309-59a88b7e92f1'), getImg('1582142306909-195724d33ffc')], tags: ['bestseller'],
    description: 'Effortlessly elegant. This ribbed midi dress hugs in all the right places while offering supreme stretch and comfort.'
  },
  { 
    id: 'w4', slug: 'high-rise-wide-leg-jeans', name: 'High-Rise Wide Leg Jeans', price: 5499, gender: 'Women', category: 'Jeans', sizes: ['24', '26', '28', '30'], 
    images: [getImg('1541099649105-f69ad21f3246'), getImg('1515347619176-cff9e87903db')], tags: [],
    description: 'A flattering high rise meets a relaxed wide leg. These jeans are as comfortable as they are striking.'
  },
  { 
    id: 'w5', slug: 'silk-camisole', name: 'Silk Camisole', price: 2999, gender: 'Women', category: 'Tops', sizes: ['XS', 'S', 'M', 'L'], 
    images: [getImg('1583391733958-65e298dde11c'), getImg('1603344797008-01127021b77a')], tags: [],
    description: 'Delicate, smooth, and lightweight. Cut from 100% pure silk with adjustable straps for a customized fit.'
  },
  { 
    id: 'w6', slug: 'oversized-button-down', name: 'Oversized Button-Down', price: 3499, gender: 'Women', category: 'Shirts', sizes: ['S', 'M', 'L'], 
    images: [getImg('1598033129183-c4f50c736f10'), getImg('1589156288636-f3ccb9825b90')], tags: ['new'],
    description: 'Borrowed from the boys, styled for you. An oversized crisp poplin shirt that pairs beautifully with denim or leggings.'
  },
  { 
    id: 'w7', slug: 'pleated-mini-skirt', name: 'Pleated Mini Skirt', price: 2899, gender: 'Women', category: 'Skirts', sizes: ['XS', 'S', 'M'], 
    images: [getImg('1620799140408-edc6dcb6d633'), getImg('1581044777550-4cfa60707c03')], tags: [],
    description: 'A playful pleated design with built-in shorts for ultimate freedom of movement.'
  },
  { 
    id: 'w8', slug: 'cropped-cardigan', name: 'Cropped Cardigan', price: 4499, gender: 'Women', category: 'Sweaters', sizes: ['S', 'M', 'L'], 
    images: [getImg('1469334031218-e382a71b716b'), getImg('1529139574466-a303027c1d8b')], tags: [],
    description: 'The quintessential transitional piece. This cropped knit cardigan is super soft and features tonal buttons.'
  },

  // Kids (8 items)
  { 
    id: 'k1', slug: 'graphic-cotton-tee', name: 'Graphic Cotton Tee', price: 1499, gender: 'Kids', category: 'Tees', sizes: ['2Y', '4Y', '6Y', '8Y'], 
    images: [getImg('1519238263530-99abca901d4c'), getImg('1604467794349-0b74285de7e7')], tags: ['new', 'bestseller'],
    description: 'Fun, durable, and super soft. A playful graphic tee made to withstand the wildest playground adventures.'
  },
  { 
    id: 'k2', slug: 'cozy-fleece-pullover', name: 'Cozy Fleece Pullover', price: 2499, gender: 'Kids', category: 'Sweaters', sizes: ['4Y', '6Y', '8Y'], 
    images: [getImg('1519241047957-be31d7379a5d'), getImg('1611428544866-9a288924b22f')], tags: [],
    description: 'Keep them warm and smiling. This plush fleece pullover features a snap-button collar and elasticated cuffs.'
  },
  { 
    id: 'k3', slug: 'denim-overalls', name: 'Denim Overalls', price: 2999, gender: 'Kids', category: 'Jeans', sizes: ['2Y', '4Y', '6Y'], 
    images: [getImg('1519457431-44ccd64a579b'), getImg('1616053322409-cfadbaec0a4b')], tags: ['bestseller'],
    description: 'A childhood classic. Sturdy denim overalls with adjustable straps and plenty of pockets for collecting treasures.'
  },
  { 
    id: 'k4', slug: 'stretchy-play-leggings', name: 'Stretchy Play Leggings', price: 1299, gender: 'Kids', category: 'Pants', sizes: ['2Y', '4Y', '6Y', '8Y'], 
    images: [getImg('1622290291468-a28f7a7dc6a8'), getImg('1514090458281-c53340934d40')], tags: [],
    description: 'Made to move. These stretchy, breathable leggings are the ultimate base layer for active kids.'
  },
  { 
    id: 'k5', slug: 'puffer-vest', name: 'Puffer Vest', price: 2699, gender: 'Kids', category: 'Outerwear', sizes: ['4Y', '6Y', '8Y', '10Y'], 
    images: [getImg('1579603099981-061099b244cb'), getImg('1608688402506-c8da7311b8b8')], tags: ['new'],
    description: 'Lightweight insulation perfect for shifting seasons. Fully lined and easy to zip up over any sweater.'
  },
  { 
    id: 'k6', slug: 'striped-long-sleeve', name: 'Striped Long Sleeve', price: 1799, gender: 'Kids', category: 'Tees', sizes: ['2Y', '4Y', '6Y'], 
    images: [getImg('1503919545889-46765cb18128'), getImg('1566378411037-77b3d3dc3f14')], tags: [],
    description: 'A nautical-inspired staple. Woven from sturdy cotton jersey that gets softer with every wash.'
  },
  { 
    id: 'k7', slug: 'pull-on-shorts', name: 'Pull-on Shorts', price: 1199, gender: 'Kids', category: 'Shorts', sizes: ['2Y', '4Y', '6Y', '8Y'], 
    images: [getImg('1471286174890-9c1122cd79fc'), getImg('1541364983172-5bb182f4ff40')], tags: [],
    description: 'Easy on, easy off. These pull-on shorts feature a comfortable elastic waistband and a soft, breathable weave.'
  },
  { 
    id: 'k8', slug: 'knit-beanie', name: 'Knit Beanie', price: 899, gender: 'Kids', category: 'Accessories', sizes: ['One Size'], 
    images: [getImg('1519014816548-bf5fece59bf0'), getImg('1437140955938-15822f7be41a')], tags: [],
    description: 'Toasty and stretchy. Our signature ribbed knit beanie keeps little heads warm during winter outings.'
  },
]
