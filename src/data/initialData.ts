import { Product, Category, StoreSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'flowers-bouquets',
    name: 'Crochet Flowers and Bouquets',
    slug: 'flowers-bouquets',
    description: 'Everlasting blooms crafted petal by petal with soft cotton yarn that never wilt.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    order: 1
  },
  {
    id: 'scarves-wearables',
    name: 'Crochet Scarves and Wearables',
    slug: 'scarves-wearables',
    description: 'Cozy handcrafted scarves, headbands, and accessories for effortless comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
    order: 2
  },
  {
    id: 'bags-pouches',
    name: 'Crochet Bags and Pouches',
    slug: 'bags-pouches',
    description: 'Durable, charming tote bags, shoulder pouches, and coin purses stitched with love.',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    order: 3
  },
  {
    id: 'gifts',
    name: 'Crochet Gifts',
    slug: 'gifts',
    description: 'Heartfelt pocket keepsakes, car hangings, keychains, and thoughtful handmade tokens.',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    order: 4
  },
  {
    id: 'personalized',
    name: 'Personalized Creations',
    slug: 'personalized',
    description: 'Custom initials, bespoke color palettes, and commissioned heirlooms made just for you.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    order: 5
  },
  {
    id: 'other',
    name: 'Other Crochet Products',
    slug: 'other',
    description: 'Unique seasonal creations, bookmarks, coaster sets, and decorative accents.',
    imageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
    order: 6
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'kjk-flw-001',
    name: 'Eternal Lavender & Daisy Handcrafted Bouquet',
    description: 'A delicate handmade bouquet featuring two blooming stems of lavender, three sunny daisy buds, and soft eucalyptus leaves wrapped in artisanal kraft paper and tied with a rustic jute ribbon. Hand-stitched with 100% combed milk cotton yarn.',
    price: 899,
    discountPrice: 799,
    category: 'Crochet Flowers and Bouquets',
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=85'
    ],
    colors: ['Lavender & Cream', 'Blush Pink & White', 'Vintage Peach'],
    variations: ['3-Stem Posy', '5-Stem Bouquet (Full)'],
    stock: 12,
    sku: 'KJK-FLW-001',
    isActive: true,
    isFeatured: true,
    customizationAvailable: true,
    customizationInstructions: 'You can specify custom wrapping ribbon color or request a handwritten mini note card.',
    material: '100% Milk Cotton Yarn, Floral Craft Wire, Kraft Wrapping Paper',
    careInstructions: 'Keep dry; dust gently with a soft brush or cool hairdryer on low setting.',
    dimensions: 'Approx. 32 cm length x 18 cm width',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'kjk-flw-002',
    name: 'Sunflower Posy in Hand-Crocheted Terracotta Pot',
    description: 'A bright, cheerful crochet sunflower sitting snugly inside an earthy brown crochet pot. Perfect for study tables, work desks, and car dashboards that need a burst of perpetual sunshine.',
    price: 499,
    category: 'Crochet Flowers and Bouquets',
    images: [
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85'
    ],
    colors: ['Golden Yellow', 'Warm Honey', 'Autumn Amber'],
    variations: ['Desk Pot (Single Bloom)'],
    stock: 15,
    sku: 'KJK-FLW-002',
    isActive: true,
    isFeatured: true,
    customizationAvailable: false,
    material: 'Super soft acrylic blend yarn, hypo-allergenic fiberfill base',
    careInstructions: 'Spot clean only with a damp cotton cloth.',
    dimensions: 'Approx. 16 cm height x 10 cm pot diameter',
    createdAt: '2026-10-02T11:00:00.000Z',
    updatedAt: '2026-10-02T11:00:00.000Z'
  },
  {
    id: 'kjk-bag-001',
    name: 'Pastel Meadow Granny Square Tote Bag',
    description: 'Iconic granny square shoulder tote meticulously hand-joined with reinforced double crochet straps. Features lovely floral centers in shades of sage green, blush rose, buttercream, and warm sand.',
    price: 1450,
    discountPrice: 1299,
    category: 'Crochet Bags and Pouches',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85'
    ],
    colors: ['Pastel Meadow (Multi)', 'Earthy Forest & Tan', 'Monochrome Oat'],
    variations: ['Standard Shoulder (35x35 cm)', 'Large Daily Tote (42x40 cm)'],
    stock: 6,
    sku: 'KJK-BAG-001',
    isActive: true,
    isFeatured: true,
    customizationAvailable: true,
    customizationInstructions: 'Request an optional soft canvas inner lining or magnetic snap clasp.',
    material: 'Sturdy 4-ply cotton yarn with low-stretch stitched handles',
    careInstructions: 'Gentle hand wash in cold water with mild detergent; dry flat on towel.',
    dimensions: '35 cm x 35 cm body + 26 cm strap drop',
    createdAt: '2026-10-03T12:00:00.000Z',
    updatedAt: '2026-10-03T12:00:00.000Z'
  },
  {
    id: 'kjk-bag-002',
    name: 'Cloud Puff Handcrafted Pouch with Pearl Strap',
    description: 'Ultra-soft bubble puff stitch clutch bag with detachable faux-pearl strap. Ideal for holding your lip gloss, phone, keys, and cards for casual brunches or romantic evenings.',
    price: 1199,
    category: 'Crochet Bags and Pouches',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85'
    ],
    colors: ['Cloud White', 'Powder Blue', 'Lilac Mist'],
    variations: ['Pearl Crossbody Strap', 'Matching Crochet Strap'],
    stock: 8,
    sku: 'KJK-BAG-002',
    isActive: true,
    isFeatured: false,
    customizationAvailable: true,
    customizationInstructions: 'Specify your preferred strap length (100 cm or 120 cm).',
    material: 'Velvet chenille yarn with brass hardware',
    careInstructions: 'Spot clean gently.',
    dimensions: '22 cm length x 15 cm height x 6 cm base depth',
    createdAt: '2026-10-04T14:00:00.000Z',
    updatedAt: '2026-10-04T14:00:00.000Z'
  },
  {
    id: 'kjk-wr-001',
    name: 'Cozy Waffle Textured Infinity Scarf',
    description: 'An exceptionally soft, chunky double-wrapped infinity scarf handcrafted in textured waffle ribbing. Keeps you warm during breezy evenings while looking effortlessly stylish.',
    price: 950,
    category: 'Crochet Scarves and Wearables',
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85'
    ],
    colors: ['Oatmeal Beige', 'Dusty Rose', 'Warm Mocha'],
    variations: ['Double Loop (140 cm loop)'],
    stock: 10,
    sku: 'KJK-WR-001',
    isActive: true,
    isFeatured: true,
    customizationAvailable: false,
    material: 'Anti-pilling premium acrylic wool blend',
    careInstructions: 'Hand wash in cold water; do not wring; lay flat to dry.',
    dimensions: '140 cm circumference x 22 cm width',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-05T09:00:00.000Z'
  },
  {
    id: 'kjk-gft-001',
    name: 'Handcrafted Tulip Blossom Bag Charm & Keychain',
    description: 'Dainty blooming crochet tulip with a leafy vine and gold-toned swivel clasp. Clip it onto your purse, backpack, or car keys for a cheerful everyday companion.',
    price: 299,
    category: 'Crochet Gifts',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=85'
    ],
    colors: ['Crimson Red', 'Blush Pink', 'Buttercup Yellow', 'Soft Lavender'],
    variations: ['Single Tulip', 'Twin Tulip Bell'],
    stock: 25,
    sku: 'KJK-GFT-001',
    isActive: true,
    isFeatured: true,
    customizationAvailable: true,
    customizationInstructions: 'Select custom bell or charm attachments.',
    material: 'Fine mercerized cotton yarn, gold-plated zinc alloy ring',
    careInstructions: 'Avoid prolonged water submersion.',
    dimensions: 'Tulip bud 4.5 cm, total drop 12 cm',
    createdAt: '2026-10-06T15:00:00.000Z',
    updatedAt: '2026-10-06T15:00:00.000Z'
  },
  {
    id: 'kjk-per-001',
    name: 'Personalized Initial Monogram Crochet Keychain',
    description: 'A bespoke 3D stuffed crochet alphabet letter in your choice of pastel yarn, accented with a mini crochet flower bud. Makes a deeply personal birthday, bridesmaid, or friendship gift.',
    price: 399,
    category: 'Personalized Creations',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85'
    ],
    colors: ['Sage & White Bud', 'Blush & Lemon Bud', 'Lavender & Pearl Bud'],
    variations: ['Letter A-Z'],
    stock: 30,
    sku: 'KJK-PER-001',
    isActive: true,
    isFeatured: true,
    customizationAvailable: true,
    customizationInstructions: 'Please enter the exact letter (A-Z) and any custom color pairing in notes during checkout.',
    material: '100% Milk Cotton with anti-allergenic polyfill',
    careInstructions: 'Spot clean gently.',
    dimensions: 'Approx. 7.5 cm height x 5 cm width',
    createdAt: '2026-10-07T16:00:00.000Z',
    updatedAt: '2026-10-07T16:00:00.000Z'
  },
  {
    id: 'kjk-oth-001',
    name: 'Botanical Daisy Crochet Coaster Set (Pack of 4)',
    description: 'Set of 4 absorbent, thick crochet coasters designed as blooming white daisies with golden yellow pistils. Protects your tabletops from hot mugs and cold beverage condensation.',
    price: 449,
    category: 'Other Crochet Products',
    images: [
      'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=85'
    ],
    colors: ['Classic Daisy White', 'Pastel Blossom Mix'],
    variations: ['Pack of 4'],
    stock: 14,
    sku: 'KJK-OTH-001',
    isActive: true,
    isFeatured: false,
    customizationAvailable: false,
    material: 'Natural 100% absorbent cotton yarn',
    careInstructions: 'Machine washable on gentle cycle in laundry bag; lay flat to dry.',
    dimensions: '12 cm diameter per coaster',
    createdAt: '2026-10-08T11:00:00.000Z',
    updatedAt: '2026-10-08T11:00:00.000Z'
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'Knot Just Krochet',
  tagline: 'Handmade Crochet Creations Crafted with Love & Warmth',
  announcement: '✨ Free delivery on all orders over ₹1,499 across India | Made to order with premium yarn',
  contactEmail: 'knotjustkrochetofficial@gmail.com',
  contactPhone: '+91 98765 43210',
  instagramHandle: '@knot_just_krochet',
  standardShippingFee: 80,
  freeShippingThreshold: 1499,
  updatedAt: new Date().toISOString()
};
