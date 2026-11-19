import type { StoreType, ZapProduct, ZapShop } from '@/lib/zappro';

export const DEMO_SLUG = 'demo-praia';

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

const demoShops: Record<StoreType, ZapShop> = {
  retail: {
    id: 'demo-praia-retail',
    slug: DEMO_SLUG,
    name: 'Sabor da Praia',
    whatsapp_number: '238 991 23 45',
    store_type: 'retail',
    logo_url: null,
    banner_url: '/hero-praia-capital.jpg',
    currency: 'CVE',
    description: 'Burgers, grelhados & sumos naturais — delivered across Praia.',
    delivery_zones: [
      { zone: 'Plateau', fee: 200 },
      { zone: 'Achada Santo António', fee: 250 },
      { zone: 'Palmarejo', fee: 300 },
      { zone: 'Pickup', fee: 0 },
    ],
  },
  showcase: {
    id: 'demo-praia-showcase',
    slug: DEMO_SLUG,
    name: 'Praia Motors & Imóveis',
    whatsapp_number: '238 998 76 54',
    store_type: 'showcase',
    logo_url: null,
    banner_url: '/hero-sal-pier.jpg',
    currency: 'CVE',
    description: 'Verified vehicles and properties across Santiago and Sal.',
    delivery_zones: [],
  },
};

const demoProducts: Record<StoreType, ZapProduct[]> = {
  retail: [
    {
      id: 'demo-r1',
      title: 'Smash Burger Duplo',
      description: 'Two smashed patties, cheddar, pickles and house sauce on a toasted brioche bun.',
      price: 950,
      image_url: unsplash('photo-1568901346375-23c9450c58cd'),
      category: 'Burgers',
      options: [
        { name: 'Size', choices: ['M', 'L (+150)'] },
        { name: 'Extra', choices: ['No extra', 'Spicy Sauce (+100)', 'Extra Bacon (+200)'] },
      ],
    },
    {
      id: 'demo-r2',
      title: 'Frango Grelhado',
      description: 'Half grilled chicken with piri-piri, fries and fresh salad.',
      price: 850,
      image_url: unsplash('photo-1598103442097-8b74394b95c6'),
      category: 'Grelhados',
      options: [{ name: 'Side', choices: ['Fries', 'Rice', 'Salad'] }],
    },
    {
      id: 'demo-r3',
      title: 'Pizza Margherita',
      description: 'Wood-fired base, tomato, mozzarella and fresh basil.',
      price: 1100,
      image_url: unsplash('photo-1513104890138-7c749659a591'),
      category: 'Pizza',
      options: [],
    },
    {
      id: 'demo-r4',
      title: 'Salada Tropical',
      description: 'Mixed greens, mango, avocado, toasted seeds and lime dressing.',
      price: 650,
      image_url: unsplash('photo-1512621776951-a57141f2eefd'),
      category: 'Saudável',
      options: [],
    },
    {
      id: 'demo-r5',
      title: 'Batata Frita da Casa',
      description: 'Crispy hand-cut fries with garlic aioli.',
      price: 300,
      image_url: unsplash('photo-1573080496219-bb080dd4f877'),
      category: 'Snacks',
      options: [],
    },
    {
      id: 'demo-r6',
      title: 'Sumo Natural de Papaia',
      description: 'Freshly blended papaya juice, 350ml, no added sugar.',
      price: 300,
      image_url: unsplash('photo-1600271886742-f049cd451bba'),
      category: 'Bebidas',
      options: [{ name: 'Size', choices: ['350ml', '500ml (+100)'] }],
    },
  ],
  showcase: [
    {
      id: 'demo-s1',
      title: 'T3 Ocean View — Palmarejo',
      description: '3 bed · 2 bath · 128 m² · Sea-view balcony, private parking, 24h security.',
      price: 18500000,
      image_url: unsplash('photo-1502672260266-1c1ef2d93688'),
      category: 'Real Estate',
      options: [],
    },
    {
      id: 'demo-s2',
      title: 'Toyota Hilux 2.4 D-4D 4x4',
      description: '2022 · Manual · Diesel · 38,000 km · Single owner, full dealer service history.',
      price: 4500000,
      image_url: unsplash('photo-1533473359331-0135ef1b58bf'),
      category: 'Vehicles',
      options: [],
    },
    {
      id: 'demo-s3',
      title: 'Villa with Pool — Santa Maria, Sal',
      description: '4 bed · 3 bath · 260 m² plot · Private pool, 400m from the beach.',
      price: 32000000,
      image_url: unsplash('photo-1564013799919-ab600027ffc6'),
      category: 'Real Estate',
      options: [],
    },
    {
      id: 'demo-s4',
      title: 'Seafront Apartment — Mindelo',
      description: '2 bed · 1 bath · 86 m² · Fully furnished, walking distance to the marina.',
      price: 12900000,
      image_url: '/hero-mindelo-bay.jpg',
      category: 'Real Estate',
      options: [],
    },
  ],
};

export function getDemoStore(mode: StoreType) {
  return { shop: demoShops[mode], products: demoProducts[mode] };
}
