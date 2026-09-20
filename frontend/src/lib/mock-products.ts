export type Product = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  gender: 'Women' | 'Kids'
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
    images: [getImg('1622290291468-a28f7a7dc6a8'), getImg('1514090458281-c53340934d40')], tags: ['new', 'bestseller'],
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
    images: [getImg('1503342394128-c104d54dba01'), getImg('1503919545889-46765cb18128')], tags: ['new'],
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
