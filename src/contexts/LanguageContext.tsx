"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Supported languages
export const languages = {
  en: { code: 'en', name: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8', label: 'EN' },
  pt: { code: 'pt', name: 'Portugu\u00EAs', flag: '\uD83C\uDDF5\uD83C\uDDF9', label: 'PT' },
  fr: { code: 'fr', name: 'Fran\u00E7ais', flag: '\uD83C\uDDEB\uD83C\uDDF7', label: 'FR' },
  cv: { code: 'cv', name: 'Kriolu', flag: '\uD83C\uDDE8\uD83C\uDDFB', label: 'KB' }
} as const;

export type LanguageCode = keyof typeof languages;

// Translation interface
export interface Translations {
  // Navigation - UI
  realEstate: string;
  markets: string;
  postAd: string;
  myStore: string;
  signOut: string;
  home: string;
  allCat: string;
  location: string;
  priceRange: string;
  mapView: string;
  listView: string;
  searchPlaceholder: string;
  buySlogan: string;
  rentSlogan: string;
  marketSlogan: string;

  // Navigation
  buy: string;
  rent: string;
  sell: string;
  commercial: string;
  calculators: string;
  advice: string;
  listProperty: string;
  signIn: string;

  // Hero section
  heroTitle: string;
  heroSearchPlaceholder: string;
  map: string;
  search: string;
  developments: string;
  agents: string;
  soldPrices: string;

  // Property filters
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  moreFilters: string;

  // Property types
  house: string;
  apartment: string;
  townhouse: string;
  land: string;
  commercialProperty: string;

  // Info section
  discoverTitle: string;
  discoverSubtitle: string;
  propertyAlerts: string;
  marketTrends: string;
  propertyGuides: string;
  findAgents: string;
  propertyValuation: string;
  mortgageCalculator: string;

  // Regional section
  regionalTitle: string;
  regionalSubtitle: string;
  propertyTrends: string;
  avgPropertyPrice: string;
  priceGrowth: string;
  mostPopularIsland: string;
  propertiesListed: string;
  acrossAllIslands: string;

  // Property Listings
  featuredProperties: string;
  viewDetails: string;
  viewAllProperties: string;
  advancedSearch: string;
  featured: string;

  // Mortgage Calculator
  mortgageCalculatorTitle: string;
  mortgageDetails: string;
  propertyPrice: string;
  downPayment: string;
  loanTerm: string;
  interestRate: string;
  calculateMortgage: string;
  mortgageResults: string;
  monthlyPayment: string;
  loanAmount: string;
  totalInterest: string;
  totalPayment: string;
  importantNotes: string;
  getPreApproved: string;
  contactBank: string;
  bankingPartners: string;

  // Estate Agents
  professionalAgents: string;
  connectAgents: string;
  yearsExperience: string;
  propertiesSold: string;
  specialties: string;
  languages: string;
  viewProfile: string;
  verifiedProfessionals: string;
  islandExpertise: string;
  multilingualService: string;
  registerAgent: string;

  // Market Insights
  marketInsightsTitle: string;
  stayInformed: string;
  averagePropertyPrice: string;
  foreignBuyers: string;
  avgRentalYield: string;
  islandMarketPerformance: string;
  latestInsights: string;
  readFullReport: string;
  readyToInvest: string;
  investmentProperties: string;
  marketReports: string;
  personalizedAdvice: string;

  // Categories - Property Types
  villa: string;
  duplex: string;
  studio: string;
  penthouse: string;

  // Categories - Market
  catVehicles: string;
  catElectronics: string;
  catHomeFurniture: string;
  catBuildingMaterials: string;
  catRestaurants: string;
  catFashion: string;
  catBabiesKids: string;
  catPets: string;
  catMaintenance: string;
  catProfessionalServices: string;

  // Form labels
  photos: string;
  category: string;
  title: string;
  description: string;
  priceCVE: string;
  island: string;
  municipality: string;
  dealType: string;
  forSale: string;
  forRent: string;
  bathrooms: string;
  areaM2: string;
  pinLocation: string;
  postAdButton: string;
  promoteAd: string;
  sellButton: string;

  // Sell/Edit page
  createNewListing: string;
  editListing: string;
  updateDetails: string;
  postDescription: string;
  back: string;
  loadingData: string;

  // Results view
  availableProperties: string;
  properties: string;
  list: string;
  loadingMap: string;

  // Marketplace & Drawers
  featuredProperties: string;
  featuredItems: string;
  featured: string;
  itemsFound: string;
  noItemsFound: string;
  beFirstToPost: string;
  postFirstAd: string;
  contactAgent: string;
  contactSeller: string;
  sendMessage: string;
  sending: string;
  inquirySent: string;
  name: string;
  email: string;
  phoneOptional: string;
  message: string;
  callAgent: string;
  location: string;
  price: string;

  // Hero section - tabs & filters
  forSaleTab: string;
  toRent: string;
  goods: string;
  localServices: string;
  filters: string;
  islandOrNeighborhood: string;
  searchItemsOrServices: string;
  inRealEstate: string;
  inGeneralMarkets: string;
  type: string;
  any: string;
  condition: string;
  newItem: string;
  usedItem: string;

  // My Store page
  viewMyStore: string;
  editProfile: string;
  cancel: string;
  saveChanges: string;
  changePhoto: string;
  activateBusinessAccount: string;
  activateBusinessDesc: string;
  businessAccountActive: string;
  storeConfigured: string;
  editData: string;
  deactivate: string;
  manageStorefront: string;
  manageStorefrontDesc: string;
  close: string;
  edit: string;
  storeName: string;
  storeDescription: string;
  logoUrl: string;
  bannerUrl: string;
  saveStorefront: string;
  myStores: string;
  activeStores: string;
  createNewStore: string;
  noStoresYet: string;
  createSeparateStorefronts: string;
  storeTitle: string;
  customUrl: string;
  locationLabel: string;
  categoryLabel: string;
  selectCategory: string;
  descriptionLabel: string;
  describeStoreFocus: string;
  createStore: string;
  myWallet: string;
  walletDesc: string;
  voucherPlaceholder: string;
  redeem: string;
  boostListing: string;
  boostListingDesc: string;
  cost: string;
  currentBalance: string;
  balanceAfter: string;
  payWithBalance: string;
  myActiveListings: string;
  postNew: string;
  noListingsFound: string;
  postYourFirstAd: string;
  highlight: string;
  boost: string;
  sold: string;
  relistAd: string;
  deleteLabel: string;
  deletePermanently: string;
  deleteConfirmDesc: string;
  expandBusiness: string;
  expandBusinessDesc: string;
  unlockPremiumStores: string;
  maybeLater: string;
  planFree: string;
  configureBusinessStore: string;
  personalizeIdentity: string;
  businessName: string;
  storeLogo: string;
  chooseFile: string;
  bioDescription: string;
  describeYourBusiness: string;
  saveOrActivate: string;
  paywallTitle: string;
  paywallDesc: string;
  viewSubscriptionPlans: string;
  unlockAdditionalStores: string;
  unlockAdditionalStoresDesc: string;
  premiumPlan: string;
  upTo5Stores: string;
  customUrlsPerStore: string;
  customBranding: string;
  advancedStatsPerStore: string;
  upgradeNow: string;
  property: string;
  itemService: string;
}

// Translations data
const translations: Record<LanguageCode, Translations> = {
  en: {
    // UI Navigation
    realEstate: "Real Estate",
    markets: "Markets",
    postAd: "Post an Ad",
    myStore: "My Store",
    signOut: "Sign Out",
    home: "Home",
    allCat: "All Subcategories",
    location: "LOCATION",
    priceRange: "PRICE RANGE (CVE)",
    mapView: "\uD83D\uDDFA\uFE0F Map",
    listView: "\uD83D\uDCCB List",
    searchPlaceholder: "Search apartments, land, or markets...",
    buySlogan: "Discover properties for sale across Cabo Verde",
    rentSlogan: "Discover properties for rent across Cabo Verde",
    marketSlogan: "Discover Markets and services across Cabo Verde",

    // Navigation
    buy: 'Buy',
    rent: 'Rent',
    sell: 'Sell',
    commercial: 'Commercial',
    calculators: 'Calculators',
    advice: 'Advice',
    listProperty: 'List Property',
    signIn: 'Sign In',

    // Hero section
    heroTitle: 'Find Property for Sale in Cape Verde',
    heroSearchPlaceholder: 'Search for an Island, City or Area',
    map: 'Map',
    search: 'Search',
    developments: 'Developments',
    agents: 'Agents',
    soldPrices: 'Sold Prices',

    // Property filters
    propertyType: 'Property Type',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    bedrooms: 'Bedrooms',
    moreFilters: 'More Filters',

    // Property types
    house: 'House',
    apartment: 'Apartment',
    townhouse: 'Townhouse',
    land: 'Land',
    commercialProperty: 'Commercial',

    // Info section
    discoverTitle: 'Discover Cape Verde Property Market',
    discoverSubtitle: 'Everything you need to buy, sell, or rent property across Cape Verde\'s beautiful islands',
    propertyAlerts: 'Property Alerts',
    marketTrends: 'Market Trends',
    propertyGuides: 'Property Guides',
    findAgents: 'Find Estate Agents',
    propertyValuation: 'Property Valuation',
    mortgageCalculator: 'Mortgage Calculator',

    // Regional section
    regionalTitle: 'Property for Sale in Cape Verde',
    regionalSubtitle: 'Explore properties across all islands of Cape Verde',
    propertyTrends: 'Cape Verde Property Trends',
    avgPropertyPrice: 'Average Property Price',
    priceGrowth: 'Price Growth (YoY)',
    mostPopularIsland: 'Most Popular Island',
    propertiesListed: 'Properties Listed',
    acrossAllIslands: 'Across all islands',

    // Property Listings
    featuredProperties: 'Featured Properties in Cape Verde',
    viewDetails: 'View Details',
    viewAllProperties: 'View All Properties',
    advancedSearch: 'Advanced Search',
    featured: 'Featured',

    // Mortgage Calculator
    mortgageCalculatorTitle: 'Cape Verde Mortgage Calculator',
    mortgageDetails: 'Mortgage Details',
    propertyPrice: 'Property Price',
    downPayment: 'Down Payment',
    loanTerm: 'Loan Term',
    interestRate: 'Interest Rate',
    calculateMortgage: 'Calculate Mortgage',
    mortgageResults: 'Mortgage Results',
    monthlyPayment: 'Monthly Payment',
    loanAmount: 'Loan Amount',
    totalInterest: 'Total Interest',
    totalPayment: 'Total Payment',
    importantNotes: 'Important Notes',
    getPreApproved: 'Get Pre-approved',
    contactBank: 'Contact Bank',
    bankingPartners: 'Cape Verde Banking Partners',

    // Estate Agents
    professionalAgents: 'Professional Estate Agents',
    connectAgents: 'Connect with experienced real estate professionals across all Cape Verde islands',
    yearsExperience: 'Years Experience',
    propertiesSold: 'Properties Sold',
    specialties: 'Specialties',
    languages: 'Languages',
    viewProfile: 'View Profile & Listings',
    verifiedProfessionals: 'Verified Professionals',
    islandExpertise: 'Island Expertise',
    multilingualService: 'Multilingual Service',
    registerAgent: 'Register as an Agent',

    // Market Insights
    marketInsightsTitle: 'Cape Verde Property Market Insights',
    stayInformed: 'Stay informed with the latest market trends, investment opportunities, and property data across all islands',
    averagePropertyPrice: 'Average Property Price',
    foreignBuyers: 'Foreign Buyers',
    avgRentalYield: 'Avg. Rental Yield',
    islandMarketPerformance: 'Island-by-Island Market Performance',
    latestInsights: 'Latest Market Insights',
    readFullReport: 'Read Full Report',
    readyToInvest: 'Ready to Invest?',
    investmentProperties: 'Investment Properties',
    marketReports: 'Market Reports',
    personalizedAdvice: 'Get personalized investment advice from our market experts and discover the best opportunities across Cape Verde\'s growing property market.',

    // Categories - Property Types
    villa: 'Villa',
    duplex: 'Duplex',
    studio: 'Studio',
    penthouse: 'Penthouse',

    // Categories - Market
    catVehicles: 'Vehicles & Automotive',
    catElectronics: 'Electronics & Computers',
    catHomeFurniture: 'Home, Furniture & Appliances',
    catBuildingMaterials: 'Building Materials & Tools',
    catRestaurants: 'Restaurants & Menus (Takeaway)',
    catFashion: 'Fashion, Clothing & Retail',
    catBabiesKids: 'Babies & Kids Items',
    catPets: 'Pets & Animal Supplies',
    catMaintenance: 'Maintenance & Repair Services',
    catProfessionalServices: 'Professional & Event Services',

    // Form labels
    photos: 'Photos',
    category: 'Category',
    title: 'Title',
    description: 'Description',
    priceCVE: 'Price (CVE)',
    island: 'Island',
    municipality: 'Municipality',
    dealType: 'Deal Type',
    forSale: 'For Sale',
    forRent: 'For Rent',
    bathrooms: 'Bathrooms',
    areaM2: 'Area (m\u00B2)',
    pinLocation: 'Pin Location (Optional)',
    postAdButton: 'Post Ad',
    promoteAd: 'Promote Ad',
    sellButton: '+ SELL',

    // Sell/Edit page
    createNewListing: 'Create New Listing',
    editListing: 'Edit Listing',
    updateDetails: 'Update your listing details below.',
    postDescription: 'Post a property, item, or service to the marketplace.',
    back: 'Back',
    loadingData: 'Loading listing data...',

    // Results view
    availableProperties: 'Available Properties',
    properties: 'Properties',
    list: 'List',
    loadingMap: 'Loading Map...',

    // Marketplace & Drawers
    featuredProperties: 'Featured Properties',
    featuredItems: 'Featured Items',
    featured: 'Featured',
    itemsFound: 'items found',
    noItemsFound: 'No items found',
    beFirstToPost: 'Be the first to post an ad! List your items, vehicles, services, or anything else for the community.',
    postFirstAd: 'Post Your First Ad',
    contactAgent: 'Contact Agent',
    contactSeller: 'Contact Seller',
    sendMessage: 'Send Message',
    sending: 'Sending...',
    inquirySent: 'Inquiry sent successfully!',
    name: 'Name',
    email: 'Email',
    phoneOptional: 'Phone (optional)',
    message: 'Message',
    callAgent: 'Call Agent',
    location: 'Location',
    price: 'Price',

    // Hero section - tabs & filters
    forSaleTab: 'For Sale',
    toRent: 'To Rent',
    goods: 'Goods',
    localServices: 'Local Services',
    filters: 'Filters',
    islandOrNeighborhood: 'Island or neighborhood...',
    searchItemsOrServices: 'Search items or services...',
    inRealEstate: 'in Real Estate',
    inGeneralMarkets: 'in General Markets',
    type: 'Type',
    any: 'Any',
    condition: 'Condition',
    newItem: 'New',
    usedItem: 'Used',

    // My Store page
    viewMyStore: 'View My Store',
    editProfile: 'Edit Profile',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    changePhoto: 'Change Photo',
    activateBusinessAccount: 'Activate Business Account',
    activateBusinessDesc: 'Turn your profile into a professional store with custom brand name, logo and banner. Completely free!',
    businessAccountActive: 'Business Account Active',
    storeConfigured: 'Store configured',
    editData: 'Edit Details',
    deactivate: 'Deactivate',
    manageStorefront: 'Manage Storefront',
    manageStorefrontDesc: 'Customize your store public page with logo, banner and description.',
    close: 'Close',
    edit: 'Edit',
    storeName: 'Store Name',
    storeDescription: 'Description',
    logoUrl: 'Logo URL',
    bannerUrl: 'Banner URL',
    saveStorefront: 'Save Storefront',
    myStores: 'My Stores',
    activeStores: 'active stores',
    createNewStore: 'Create New Store',
    noStoresYet: 'No stores created yet.',
    createSeparateStorefronts: 'Create separate storefronts for different categories.',
    storeTitle: 'Store Title',
    customUrl: 'Custom URL (Slug)',
    locationLabel: 'Location',
    categoryLabel: 'Category',
    selectCategory: 'Select...',
    descriptionLabel: 'Description',
    describeStoreFocus: 'Describe your store focus...',
    createStore: 'Create Store',
    myWallet: 'My Wallet',
    walletDesc: 'Use your balance to boost ads and activate premium features.',
    voucherPlaceholder: 'Voucher code (e.g. XXXX-XXXX-XXXX)',
    redeem: 'Redeem',
    boostListing: 'Boost Listing',
    boostListingDesc: 'Your listing will be placed at the top of results.',
    cost: 'Cost',
    currentBalance: 'Current balance',
    balanceAfter: 'Balance after',
    payWithBalance: 'Pay with Balance',
    myActiveListings: 'My Active Listings',
    postNew: '+ Post New',
    noListingsFound: 'No listings found in this category.',
    postYourFirstAd: 'Post your first ad',
    highlight: 'Highlight',
    boost: 'Boost',
    sold: 'Sold',
    relistAd: 'Relist Ad',
    deleteLabel: 'Delete',
    deletePermanently: 'Delete Permanently',
    deleteConfirmDesc: 'This listing will be removed forever.',
    expandBusiness: 'Expand Your Business!',
    expandBusinessDesc: 'Your current account has reached the free store limit. Unlock additional custom stores to separate your products (e.g. Real Estate vs. Furniture) for just',
    unlockPremiumStores: 'Unlock Premium Stores',
    maybeLater: 'Maybe later',
    planFree: 'Boss Plan (Free)',
    configureBusinessStore: 'Configure Professional Store',
    personalizeIdentity: 'Personalize your business identity',
    businessName: 'Business Name',
    storeLogo: 'Store Logo',
    chooseFile: 'Choose File',
    bioDescription: 'Bio / Description',
    describeYourBusiness: 'Describe your business in a few words...',
    saveOrActivate: 'Activate Business Account',
    paywallTitle: 'Your store has generated over 15 client leads!',
    paywallDesc: 'Congratulations on your success! To continue posting ads and receiving client contacts, upgrade to a monthly subscription for unlimited access.',
    viewSubscriptionPlans: 'View Subscription Plans',
    unlockAdditionalStores: 'Unlock Additional Stores!',
    unlockAdditionalStoresDesc: 'Your current account allows 1 store. Upgrade to the Premium Multi-Store plan to expand your brand in Cape Verde with multiple themed stores.',
    premiumPlan: 'Premium Plan',
    upTo5Stores: 'Up to 5 independent stores',
    customUrlsPerStore: 'Custom URLs for each store',
    customBranding: 'Customizable colors and branding',
    advancedStatsPerStore: 'Advanced stats per store',
    upgradeNow: 'Upgrade Now',
    property: 'Property',
    itemService: 'Item / Service',
  },
  pt: {
    // UI Navigation
    realEstate: "Imobili\u00E1ria",
    markets: "Mercados",
    postAd: "Publicar An\u00FAncio",
    myStore: "Meu Neg\u00F3cio",
    signOut: "Sair",
    home: "In\u00EDcio",
    allCat: "Todas as Subcategorias",
    location: "LOCALIZA\u00C7\u00C3O",
    priceRange: "FAIXA DE PRE\u00C7O (CVE)",
    mapView: "\uD83D\uDDFA\uFE0F Mapa",
    listView: "\uD83D\uDCCB Lista",
    searchPlaceholder: "Pesquisar apartamentos, terrenos ou mercados...",
    buySlogan: "Descubra propriedades para venda em Cabo Verde",
    rentSlogan: "Descubra propriedades para alugar em Cabo Verde",
    marketSlogan: "Descubra mercados e servi\u00E7os em Cabo Verde",

    // Navigation
    buy: 'Comprar',
    rent: 'Arrendar',
    sell: 'Vender',
    commercial: 'Comercial',
    calculators: 'Calculadoras',
    advice: 'Conselho',
    listProperty: 'Anunciar Propriedade',
    signIn: 'Entrar',

    // Hero section
    heroTitle: 'Encontre Propriedades à Venda em Cabo Verde',
    heroSearchPlaceholder: 'Pesquisar por Ilha, Cidade ou Área',
    map: 'Mapa',
    search: 'Pesquisar',
    developments: 'Empreendimentos',
    agents: 'Agentes',
    soldPrices: 'Preços Vendidos',

    // Property filters
    propertyType: 'Tipo de Propriedade',
    minPrice: 'Preço Mínimo',
    maxPrice: 'Preço Máximo',
    bedrooms: 'Quartos',
    moreFilters: 'Mais Filtros',

    // Property types
    house: 'Casa',
    apartment: 'Apartamento',
    townhouse: 'Moradia',
    land: 'Terreno',
    commercialProperty: 'Comercial',

    // Info section
    discoverTitle: 'Descubra o Mercado Imobiliário de Cabo Verde',
    discoverSubtitle: 'Tudo o que precisa para comprar, vender ou arrendar propriedades nas belas ilhas de Cabo Verde',
    propertyAlerts: 'Alertas de Propriedade',
    marketTrends: 'Tendências do Mercado',
    propertyGuides: 'Guias de Propriedade',
    findAgents: 'Encontrar Agentes Imobiliários',
    propertyValuation: 'Avaliação de Propriedade',
    mortgageCalculator: 'Calculadora de Hipoteca',

    // Regional section
    regionalTitle: 'Propriedades à Venda em Cabo Verde',
    regionalSubtitle: 'Explore propriedades em todas as ilhas de Cabo Verde',
    propertyTrends: 'Tendências Imobiliárias de Cabo Verde',
    avgPropertyPrice: 'Preço Médio de Propriedade',
    priceGrowth: 'Crescimento de Preços (Anual)',
    mostPopularIsland: 'Ilha Mais Popular',
    propertiesListed: 'Propriedades Listadas',
    acrossAllIslands: 'Em todas as ilhas',

    // Property Listings
    featuredProperties: 'Propriedades em Destaque em Cabo Verde',
    viewDetails: 'Ver Detalhes',
    viewAllProperties: 'Ver Todas as Propriedades',
    advancedSearch: 'Pesquisa Avançada',
    featured: 'Destaque',

    // Mortgage Calculator
    mortgageCalculatorTitle: 'Calculadora de Hipoteca de Cabo Verde',
    mortgageDetails: 'Detalhes da Hipoteca',
    propertyPrice: 'Preço da Propriedade',
    downPayment: 'Entrada',
    loanTerm: 'Prazo do Empréstimo',
    interestRate: 'Taxa de Juros',
    calculateMortgage: 'Calcular Hipoteca',
    mortgageResults: 'Resultados da Hipoteca',
    monthlyPayment: 'Pagamento Mensal',
    loanAmount: 'Valor do Empréstimo',
    totalInterest: 'Juros Totais',
    totalPayment: 'Pagamento Total',
    importantNotes: 'Notas Importantes',
    getPreApproved: 'Obter Pré-aprovação',
    contactBank: 'Contactar Banco',
    bankingPartners: 'Parceiros Bancários de Cabo Verde',

    // Estate Agents
    professionalAgents: 'Agentes Imobiliários Profissionais',
    connectAgents: 'Conecte-se com profissionais imobiliários experientes em todas as ilhas de Cabo Verde',
    yearsExperience: 'Anos de Experiência',
    propertiesSold: 'Propriedades Vendidas',
    specialties: 'Especialidades',
    languages: 'Idiomas',
    viewProfile: 'Ver Perfil e Listagens',
    verifiedProfessionals: 'Profissionais Verificados',
    islandExpertise: 'Expertise das Ilhas',
    multilingualService: 'Serviço Multilíngue',
    registerAgent: 'Registar como Agente',

    // Market Insights
    marketInsightsTitle: 'Insights do Mercado Imobiliário de Cabo Verde',
    stayInformed: 'Mantenha-se informado com as últimas tendências do mercado, oportunidades de investimento e dados imobiliários de todas as ilhas',
    averagePropertyPrice: 'Preço Médio de Propriedade',
    foreignBuyers: 'Compradores Estrangeiros',
    avgRentalYield: 'Rendimento Médio de Arrendamento',
    islandMarketPerformance: 'Performance do Mercado por Ilha',
    latestInsights: 'Últimos Insights do Mercado',
    readFullReport: 'Ler Relatório Completo',
    readyToInvest: 'Pronto para Investir?',
    investmentProperties: 'Propriedades de Investimento',
    marketReports: 'Relatórios de Mercado',
    personalizedAdvice: 'Obtenha conselhos de investimento personalizados dos nossos especialistas de mercado e descubra as melhores oportunidades no crescente mercado imobiliário de Cabo Verde.',

    // Categories - Property Types
    villa: 'Vivenda',
    duplex: 'Duplex',
    studio: 'Estúdio',
    penthouse: 'Cobertura',

    // Categories - Market
    catVehicles: 'Veículos e Automóvel',
    catElectronics: 'Eletrónicos e Computadores',
    catHomeFurniture: 'Casa, Móveis e Eletrodomésticos',
    catBuildingMaterials: 'Materiais de Construção e Ferramentas',
    catRestaurants: 'Restaurantes e Menus (Takeaway)',
    catFashion: 'Moda, Roupa e Retalho',
    catBabiesKids: 'Bebés e Crianças',
    catPets: 'Animais e Acessórios',
    catMaintenance: 'Manutenção e Reparação',
    catProfessionalServices: 'Serviços Profissionais e Eventos',

    // Form labels
    photos: 'Fotos',
    category: 'Categoria',
    title: 'Título',
    description: 'Descrição',
    priceCVE: 'Preço (CVE)',
    island: 'Ilha',
    municipality: 'Município',
    dealType: 'Tipo de Negócio',
    forSale: 'Venda',
    forRent: 'Arrendamento',
    bathrooms: 'Casas de Banho',
    areaM2: 'Área (m²)',
    pinLocation: 'Localização no Mapa (Opcional)',
    postAdButton: 'Publicar Anúncio',
    promoteAd: 'Promover Anúncio',
    sellButton: '+ VENDER',

    // Sell/Edit page
    createNewListing: 'Criar Novo Anúncio',
    editListing: 'Editar Anúncio',
    updateDetails: 'Atualize os detalhes do seu anúncio abaixo.',
    postDescription: 'Publique uma propriedade, artigo ou serviço no mercado.',
    back: 'Voltar',
    loadingData: 'A carregar dados...',

    // Results view
    availableProperties: 'Propriedades Disponíveis',
    properties: 'Propriedades',
    list: 'Lista',
    loadingMap: 'A carregar mapa...',

    // Marketplace & Drawers
    featuredProperties: 'Imóveis em Destaque',
    featuredItems: 'Artigos em Destaque',
    featured: 'Destaque',
    itemsFound: 'artigos encontrados',
    noItemsFound: 'Nenhum artigo encontrado',
    beFirstToPost: 'Seja o primeiro a publicar! Anuncie os seus artigos, veículos, serviços ou qualquer outra coisa para a comunidade.',
    postFirstAd: 'Publicar Primeiro Anúncio',
    contactAgent: 'Contactar Agente',
    contactSeller: 'Contactar Vendedor',
    sendMessage: 'Enviar Mensagem',
    sending: 'A enviar...',
    inquirySent: 'Mensagem enviada com sucesso!',
    name: 'Nome',
    email: 'Email',
    phoneOptional: 'Telefone (opcional)',
    message: 'Mensagem',
    callAgent: 'Ligar Agente',
    location: 'Localização',
    price: 'Preço',

    // Hero section - tabs & filters
    forSaleTab: 'Venda',
    toRent: 'Arrendamento',
    goods: 'Produtos',
    localServices: 'Serviços Locais',
    filters: 'Filtros',
    islandOrNeighborhood: 'Ilha ou bairro...',
    searchItemsOrServices: 'Pesquisar artigos ou serviços...',
    inRealEstate: 'em Imobiliária',
    inGeneralMarkets: 'em Mercados',
    type: 'Tipo',
    any: 'Qualquer',
    condition: 'Condição',
    newItem: 'Novo',
    usedItem: 'Usado',

    // My Store page
    viewMyStore: 'Ver Minha Loja',
    editProfile: 'Editar Perfil',
    cancel: 'Cancelar',
    saveChanges: 'Guardar Alterações',
    changePhoto: 'Alterar Foto',
    activateBusinessAccount: 'Ativar Conta de Empresa',
    activateBusinessDesc: 'Transforme o seu perfil numa loja profissional com nome de marca, logotipo e banner personalizados. Totalmente gratuito!',
    businessAccountActive: 'Conta de Empresa Ativa',
    storeConfigured: 'Loja configurada',
    editData: 'Editar Dados',
    deactivate: 'Desativar',
    manageStorefront: 'Gerir Montra',
    manageStorefrontDesc: 'Personalize a página pública da sua loja com logotipo, banner e descrição.',
    close: 'Fechar',
    edit: 'Editar',
    storeName: 'Nome da Loja',
    storeDescription: 'Descrição',
    logoUrl: 'URL do Logotipo',
    bannerUrl: 'URL do Banner',
    saveStorefront: 'Guardar Montra',
    myStores: 'Minhas Lojas',
    activeStores: 'lojas ativas',
    createNewStore: 'Criar Nova Loja',
    noStoresYet: 'Nenhuma loja criada ainda.',
    createSeparateStorefronts: 'Crie montras separadas para diferentes categorias.',
    storeTitle: 'Título da Loja',
    customUrl: 'URL Personalizado (Slug)',
    locationLabel: 'Localização',
    categoryLabel: 'Categoria',
    selectCategory: 'Selecionar...',
    descriptionLabel: 'Descrição',
    describeStoreFocus: 'Descreva o foco da sua loja...',
    createStore: 'Criar Loja',
    myWallet: 'Minha Carteira',
    walletDesc: 'Use o saldo para impulsionar anúncios e ativar funcionalidades premium.',
    voucherPlaceholder: 'Código do voucher (ex: XXXX-XXXX-XXXX)',
    redeem: 'Resgatar',
    boostListing: 'Impulsionar Anúncio',
    boostListingDesc: 'O seu anúncio será colocado no topo dos resultados.',
    cost: 'Custo',
    currentBalance: 'Saldo atual',
    balanceAfter: 'Saldo após',
    payWithBalance: 'Pagar com Saldo',
    myActiveListings: 'Meus Anúncios Ativos',
    postNew: '+ Publicar Novo',
    noListingsFound: 'Nenhum anúncio encontrado nesta categoria.',
    postYourFirstAd: 'Publique o seu primeiro anúncio',
    highlight: 'Destacar',
    boost: 'Impulsionar',
    sold: 'Vendido',
    relistAd: 'Republicar',
    deleteLabel: 'Eliminar',
    deletePermanently: 'Eliminar Permanentemente',
    deleteConfirmDesc: 'Este anúncio será removido para sempre.',
    expandBusiness: 'Expandir o Seu Negócio!',
    expandBusinessDesc: 'A sua conta atual atingiu o limite de lojas gratuitas. Desbloqueie lojas personalizadas adicionais para separar os seus produtos (Ex: Imobiliário vs. Móveis) por apenas',
    unlockPremiumStores: 'Desbloquear Lojas Premium',
    maybeLater: 'Talvez depois',
    planFree: 'Plano Patrão (Grátis)',
    configureBusinessStore: 'Configurar Loja Profissional',
    personalizeIdentity: 'Personalize a identidade da sua empresa',
    businessName: 'Nome da Empresa',
    storeLogo: 'Logotipo da Loja',
    chooseFile: 'Escolher Ficheiro',
    bioDescription: 'Bio / Descrição',
    describeYourBusiness: 'Descreva a sua empresa em poucas palavras...',
    saveOrActivate: 'Ativar Conta de Empresa',
    paywallTitle: 'A sua loja gerou mais de 15 leads de clientes!',
    paywallDesc: 'Parabéns pelo sucesso! Para continuar a publicar anúncios e receber contactos de clientes, atualize para uma subscrição mensal que lhe dá acesso ilimitado.',
    viewSubscriptionPlans: 'Ver Planos de Subscrição',
    unlockAdditionalStores: 'Desbloqueie Lojas Adicionais!',
    unlockAdditionalStoresDesc: 'A sua conta atual permite 1 loja. Atualize para o plano Premium Multi-Store para expandir a sua marca em Cabo Verde com múltiplas lojas temáticas.',
    premiumPlan: 'Plano Premium',
    upTo5Stores: 'Até 5 lojas independentes',
    customUrlsPerStore: 'URLs personalizados para cada loja',
    customBranding: 'Cores e branding customizáveis',
    advancedStatsPerStore: 'Estatísticas avançadas por loja',
    upgradeNow: 'Atualizar Agora',
    property: 'Propriedade',
    itemService: 'Artigo / Serviço',
  },
  fr: {
    // UI Navigation
    realEstate: "Immobilier",
    markets: "March\u00E9s",
    postAd: "Publier une Annonce",
    myStore: "Mon Magasin",
    signOut: "D\u00E9connexion",
    home: "Accueil",
    allCat: "Toutes les sous-cat\u00E9gories",
    location: "LOCALISATION",
    priceRange: "FOURCHETTE DE PRIX (CVE)",
    mapView: "\uD83D\uDDFA\uFE0F Carte",
    listView: "\uD83D\uDCCB Liste",
    searchPlaceholder: "Rechercher des appartements, terrains ou march\u00E9s...",
    buySlogan: "D\u00E9couvrez des propri\u00E9t\u00E9s \u00E0 vendre au Cap-Vert",
    rentSlogan: "D\u00E9couvrez des propri\u00E9t\u00E9s \u00E0 louer au Cap-Vert",
    marketSlogan: "D\u00E9couvrez les march\u00E9s et services au Cap-Vert",

    // Navigation
    buy: 'Acheter',
    rent: 'Louer',
    sell: 'Vendre',
    commercial: 'Commercial',
    calculators: 'Calculatrices',
    advice: 'Conseils',
    listProperty: 'Lister Propriété',
    signIn: 'Se Connecter',

    // Hero section
    heroTitle: 'Trouvez des Propriétés à Vendre au Cap-Vert',
    heroSearchPlaceholder: 'Rechercher une Île, Ville ou Zone',
    map: 'Carte',
    search: 'Rechercher',
    developments: 'Développements',
    agents: 'Agents',
    soldPrices: 'Prix Vendus',

    // Property filters
    propertyType: 'Type de Propriété',
    minPrice: 'Prix Min',
    maxPrice: 'Prix Max',
    bedrooms: 'Chambres',
    moreFilters: 'Plus de Filtres',

    // Property types
    house: 'Maison',
    apartment: 'Appartement',
    townhouse: 'Maison de Ville',
    land: 'Terrain',
    commercialProperty: 'Commercial',

    // Info section
    discoverTitle: 'Découvrez le Marché Immobilier du Cap-Vert',
    discoverSubtitle: 'Tout ce dont vous avez besoin pour acheter, vendre ou louer des propriétés à travers les belles îles du Cap-Vert',
    propertyAlerts: 'Alertes Propriété',
    marketTrends: 'Tendances du Marché',
    propertyGuides: 'Guides Immobilier',
    findAgents: 'Trouver des Agents',
    propertyValuation: 'Évaluation Immobilière',
    mortgageCalculator: 'Calculatrice Hypothécaire',

    // Regional section
    regionalTitle: 'Propriétés à Vendre au Cap-Vert',
    regionalSubtitle: 'Explorez les propriétés à travers toutes les îles du Cap-Vert',
    propertyTrends: 'Tendances Immobilières du Cap-Vert',
    avgPropertyPrice: 'Prix Moyen des Propriétés',
    priceGrowth: 'Croissance des Prix (An)',
    mostPopularIsland: 'Île la Plus Populaire',
    propertiesListed: 'Propriétés Listées',
    acrossAllIslands: 'Sur toutes les îles',

    // Property Listings
    featuredProperties: 'Propriétés en Vedette au Cap-Vert',
    viewDetails: 'Voir Détails',
    viewAllProperties: 'Voir Toutes les Propriétés',
    advancedSearch: 'Recherche Avancée',
    featured: 'En Vedette',

    // Mortgage Calculator
    mortgageCalculatorTitle: 'Calculatrice Hypothécaire du Cap-Vert',
    mortgageDetails: 'Détails Hypothécaires',
    propertyPrice: 'Prix de la Propriété',
    downPayment: 'Acompte',
    loanTerm: 'Durée du Prêt',
    interestRate: 'Taux d\'Intérêt',
    calculateMortgage: 'Calculer Hypothèque',
    mortgageResults: 'Résultats Hypothécaires',
    monthlyPayment: 'Paiement Mensuel',
    loanAmount: 'Montant du Prêt',
    totalInterest: 'Intérêts Totaux',
    totalPayment: 'Paiement Total',
    importantNotes: 'Notes Importantes',
    getPreApproved: 'Obtenir Pré-approbation',
    contactBank: 'Contacter Banque',
    bankingPartners: 'Partenaires Bancaires du Cap-Vert',

    // Estate Agents
    professionalAgents: 'Agents Immobiliers Professionnels',
    connectAgents: 'Connectez-vous avec des professionnels immobiliers expérimentés sur toutes les îles du Cap-Vert',
    yearsExperience: 'Années d\'Expérience',
    propertiesSold: 'Propriétés Vendues',
    specialties: 'Spécialités',
    languages: 'Langues',
    viewProfile: 'Voir Profil et Annonces',
    verifiedProfessionals: 'Professionnels Vérifiés',
    islandExpertise: 'Expertise des Îles',
    multilingualService: 'Service Multilingue',
    registerAgent: 'S\'inscrire comme Agent',

    // Market Insights
    marketInsightsTitle: 'Aperçus du Marché Immobilier du Cap-Vert',
    stayInformed: 'Restez informé des dernières tendances du marché, opportunités d\'investissement et données immobilières sur toutes les îles',
    averagePropertyPrice: 'Prix Moyen des Propriétés',
    foreignBuyers: 'Acheteurs Étrangers',
    avgRentalYield: 'Rendement Locatif Moyen',
    islandMarketPerformance: 'Performance du Marché par Île',
    latestInsights: 'Derniers Aperçus du Marché',
    readFullReport: 'Lire le Rapport Complet',
    readyToInvest: 'Prêt à Investir?',
    investmentProperties: 'Propriétés d\'Investissement',
    marketReports: 'Rapports de Marché',
    personalizedAdvice: 'Obtenez des conseils d\'investissement personnalisés de nos spécialistes du marché et découvrez les meilleures opportunités dans le marché immobilier en croissance du Cap-Vert.',

    villa: 'Villa',
    duplex: 'Duplex',
    studio: 'Studio',
    penthouse: 'Penthouse',
    catVehicles: 'Véhicules et Automobile',
    catElectronics: 'Électronique et Informatique',
    catHomeFurniture: 'Maison, Meubles et Appareils',
    catBuildingMaterials: 'Matériaux de Construction et Outils',
    catRestaurants: 'Restaurants et Menus (À emporter)',
    catFashion: 'Mode, Vêtements et Commerce',
    catBabiesKids: 'Bébés et Enfants',
    catPets: 'Animaux et Accessoires',
    catMaintenance: 'Maintenance et Réparation',
    catProfessionalServices: 'Services Professionnels et Événements',
    photos: 'Photos',
    category: 'Catégorie',
    title: 'Titre',
    description: 'Description',
    priceCVE: 'Prix (CVE)',
    island: 'Île',
    municipality: 'Municipalité',
    dealType: 'Type de Transaction',
    forSale: 'À Vendre',
    forRent: 'À Louer',
    bathrooms: 'Salles de Bain',
    areaM2: 'Surface (m²)',
    pinLocation: 'Emplacement sur la Carte (Optionnel)',
    postAdButton: 'Publier Annonce',
    promoteAd: 'Promouvoir Annonce',
    sellButton: '+ VENDRE',
    createNewListing: 'Créer une Nouvelle Annonce',
    editListing: 'Modifier Annonce',
    updateDetails: 'Mettez à jour les détails de votre annonce.',
    postDescription: 'Publiez une propriété, un article ou un service.',
    back: 'Retour',
    loadingData: 'Chargement des données...',
    availableProperties: 'Propriétés Disponibles',
    properties: 'Propriétés',
    list: 'Liste',
    loadingMap: 'Chargement de la carte...',

    featuredProperties: 'Propriétés en Vedette',
    featuredItems: 'Articles en Vedette',
    featured: 'Vedette',
    itemsFound: 'articles trouvés',
    noItemsFound: 'Aucun article trouvé',
    beFirstToPost: 'Soyez le premier à publier! Listez vos articles, véhicules, services ou autre pour la communauté.',
    postFirstAd: 'Publier Votre Première Annonce',
    contactAgent: 'Contacter Agent',
    contactSeller: 'Contacter Vendeur',
    sendMessage: 'Envoyer Message',
    sending: 'Envoi...',
    inquirySent: 'Demande envoyée avec succès!',
    name: 'Nom',
    email: 'Email',
    phoneOptional: 'Téléphone (optionnel)',
    message: 'Message',
    callAgent: 'Appeler Agent',
    location: 'Emplacement',
    price: 'Prix',

    // Hero section - tabs & filters
    forSaleTab: 'À Vendre',
    toRent: 'À Louer',
    goods: 'Produits',
    localServices: 'Services Locaux',
    filters: 'Filtres',
    islandOrNeighborhood: 'Île ou quartier...',
    searchItemsOrServices: 'Rechercher articles ou services...',
    inRealEstate: 'en Immobilier',
    inGeneralMarkets: 'en Marchés',
    type: 'Type',
    any: 'Tous',
    condition: 'État',
    newItem: 'Neuf',
    usedItem: 'Occasion',

    // My Store page
    viewMyStore: 'Voir Ma Boutique',
    editProfile: 'Modifier le Profil',
    cancel: 'Annuler',
    saveChanges: 'Enregistrer',
    changePhoto: 'Changer la Photo',
    activateBusinessAccount: 'Activer le Compte Professionnel',
    activateBusinessDesc: 'Transformez votre profil en boutique professionnelle avec un nom de marque, un logo et une bannière personnalisés. Totalement gratuit!',
    businessAccountActive: 'Compte Professionnel Actif',
    storeConfigured: 'Boutique configurée',
    editData: 'Modifier',
    deactivate: 'Désactiver',
    manageStorefront: 'Gérer la Vitrine',
    manageStorefrontDesc: 'Personnalisez la page publique de votre boutique avec un logo, une bannière et une description.',
    close: 'Fermer',
    edit: 'Modifier',
    storeName: 'Nom de la Boutique',
    storeDescription: 'Description',
    logoUrl: 'URL du Logo',
    bannerUrl: 'URL de la Bannière',
    saveStorefront: 'Enregistrer la Vitrine',
    myStores: 'Mes Boutiques',
    activeStores: 'boutiques actives',
    createNewStore: 'Créer une Boutique',
    noStoresYet: 'Aucune boutique créée.',
    createSeparateStorefronts: 'Créez des vitrines séparées pour différentes catégories.',
    storeTitle: 'Titre de la Boutique',
    customUrl: 'URL Personnalisée (Slug)',
    locationLabel: 'Localisation',
    categoryLabel: 'Catégorie',
    selectCategory: 'Sélectionner...',
    descriptionLabel: 'Description',
    describeStoreFocus: 'Décrivez le focus de votre boutique...',
    createStore: 'Créer la Boutique',
    myWallet: 'Mon Portefeuille',
    walletDesc: 'Utilisez votre solde pour booster des annonces et activer des fonctionnalités premium.',
    voucherPlaceholder: 'Code voucher (ex: XXXX-XXXX-XXXX)',
    redeem: 'Échanger',
    boostListing: 'Booster l\'Annonce',
    boostListingDesc: 'Votre annonce sera placée en haut des résultats.',
    cost: 'Coût',
    currentBalance: 'Solde actuel',
    balanceAfter: 'Solde après',
    payWithBalance: 'Payer avec le Solde',
    myActiveListings: 'Mes Annonces Actives',
    postNew: '+ Publier',
    noListingsFound: 'Aucune annonce trouvée dans cette catégorie.',
    postYourFirstAd: 'Publiez votre première annonce',
    highlight: 'Mettre en Avant',
    boost: 'Booster',
    sold: 'Vendu',
    relistAd: 'Republier',
    deleteLabel: 'Supprimer',
    deletePermanently: 'Supprimer Définitivement',
    deleteConfirmDesc: 'Cette annonce sera supprimée pour toujours.',
    expandBusiness: 'Développez Votre Business!',
    expandBusinessDesc: 'Votre compte actuel a atteint la limite de boutiques gratuites. Débloquez des boutiques personnalisées supplémentaires pour séparer vos produits pour seulement',
    unlockPremiumStores: 'Débloquer les Boutiques Premium',
    maybeLater: 'Peut-être plus tard',
    planFree: 'Plan Boss (Gratuit)',
    configureBusinessStore: 'Configurer la Boutique Pro',
    personalizeIdentity: 'Personnalisez l\'identité de votre entreprise',
    businessName: 'Nom de l\'Entreprise',
    storeLogo: 'Logo de la Boutique',
    chooseFile: 'Choisir un Fichier',
    bioDescription: 'Bio / Description',
    describeYourBusiness: 'Décrivez votre entreprise en quelques mots...',
    saveOrActivate: 'Activer le Compte Pro',
    paywallTitle: 'Votre boutique a généré plus de 15 prospects!',
    paywallDesc: 'Félicitations! Pour continuer à publier et recevoir des contacts, passez à un abonnement mensuel pour un accès illimité.',
    viewSubscriptionPlans: 'Voir les Plans',
    unlockAdditionalStores: 'Débloquez des Boutiques Supplémentaires!',
    unlockAdditionalStoresDesc: 'Votre compte actuel permet 1 boutique. Passez au plan Premium Multi-Store pour développer votre marque au Cap-Vert.',
    premiumPlan: 'Plan Premium',
    upTo5Stores: 'Jusqu\'à 5 boutiques indépendantes',
    customUrlsPerStore: 'URLs personnalisées par boutique',
    customBranding: 'Couleurs et branding personnalisables',
    advancedStatsPerStore: 'Statistiques avancées par boutique',
    upgradeNow: 'Mettre à Niveau',
    property: 'Propriété',
    itemService: 'Article / Service',
  },
  cv: {
    // UI Navigation
    realEstate: "Imobili\u00E1ria",
    markets: "Merkadus",
    postAd: "Po An\u00FAnsiu",
    myStore: "Nha Neg\u00F3siu",
    signOut: "Sa\u00ED",
    home: "In\u00EDsiu",
    allCat: "Tudu Subkategoria",
    location: "LOKALIZASION",
    priceRange: "PRESU (CVE)",
    mapView: "\uD83D\uDDFA\uFE0F Mapa",
    listView: "\uD83D\uDCCB Lista",
    searchPlaceholder: "Djobe apartamentu, t\u00E9ra \u00F4 merkadu...",
    buySlogan: "Djobe kaza pa kumpra na Kabu Verdi",
    rentSlogan: "Djobe kaza pa aluga na Kabu Verdi",
    marketSlogan: "Djobe merkadus ku serb\u00EDsus na Kabu Verdi",

    // Navigation
    buy: 'Kumpra',
    rent: 'Aluga',
    sell: 'Bende',
    commercial: 'Komersial',
    calculators: 'Kalkuladora',
    advice: 'Konseilhu',
    listProperty: 'Ponhe Kasa',
    signIn: 'Entra',

    // Hero section
    heroTitle: 'Buska Kasa pa Bende na Kabu Verdi',
    heroSearchPlaceholder: 'Buska pa Ilha, Sidadi o Zona',
    map: 'Mapa',
    search: 'Buska',
    developments: 'Projetu',
    agents: 'Agenti',
    soldPrices: 'Presu Bendidu',

    // Property filters
    propertyType: 'Tipu di Kasa',
    minPrice: 'Presu Minimu',
    maxPrice: 'Presu Maksimu',
    bedrooms: 'Kuartu',
    moreFilters: 'Mas Filtru',

    // Property types
    house: 'Kasa',
    apartment: 'Apartamentu',
    townhouse: 'Vivenda',
    land: 'Terrenu',
    commercialProperty: 'Komersial',

    // Info section
    discoverTitle: 'Konxe Merkadu di Kasa na Kabu Verdi',
    discoverSubtitle: 'Tudu kusa ki bu preziza pa kumpra, bende o aluga kasa na ilha bonitu di Kabu Verdi',
    propertyAlerts: 'Alerta di Kasa',
    marketTrends: 'Tendénsia di Merkadu',
    propertyGuides: 'Gia di Kasa',
    findAgents: 'Buska Agenti di Kasa',
    propertyValuation: 'Avaliason di Kasa',
    mortgageCalculator: 'Kalkuladora di Ipoteka',

    // Regional section
    regionalTitle: 'Kasa pa Bende na Kabu Verdi',
    regionalSubtitle: 'Explora kasa na tudu ilha di Kabu Verdi',
    propertyTrends: 'Tendénsia di Kasa na Kabu Verdi',
    avgPropertyPrice: 'Presu Médiu di Kasa',
    priceGrowth: 'Kresimentu di Presu (Anu)',
    mostPopularIsland: 'Ilha Mas Popular',
    propertiesListed: 'Kasa Listadu',
    acrossAllIslands: 'Na tudu ilha',

    // Property Listings
    featuredProperties: 'Kasa Spesial na Kabu Verdi',
    viewDetails: 'Odja Detalhi',
    viewAllProperties: 'Odja Tudu Kasa',
    advancedSearch: 'Buska Avansadu',
    featured: 'Spesial',

    // Mortgage Calculator
    mortgageCalculatorTitle: 'Kalkuladora di Ipoteka di Kabu Verdi',
    mortgageDetails: 'Detalhi di Ipoteka',
    propertyPrice: 'Presu di Kasa',
    downPayment: 'Entrada',
    loanTerm: 'Tempu di Emprestimu',
    interestRate: 'Taxa di Jurus',
    calculateMortgage: 'Kalkula Ipoteka',
    mortgageResults: 'Rezultadu di Ipoteka',
    monthlyPayment: 'Pagamentu Mensal',
    loanAmount: 'Valor di Emprestimu',
    totalInterest: 'Jurus Total',
    totalPayment: 'Pagamentu Total',
    importantNotes: 'Nota Importanti',
    getPreApproved: 'Siña Pre-aprovadu',
    contactBank: 'Kontakta Banku',
    bankingPartners: 'Parseru Bankáriu di Kabu Verdi',

    // Estate Agents
    professionalAgents: 'Agenti di Kasa Profisional',
    connectAgents: 'Konekta ku agenti di kasa eksperenti na tudu ilha di Kabu Verdi',
    yearsExperience: 'Anu di Eksperiénsia',
    propertiesSold: 'Kasa Bendidu',
    specialties: 'Spesialidadi',
    languages: 'Lingua',
    viewProfile: 'Odja Perfil i Lista',
    verifiedProfessionals: 'Profisional Verifikadu',
    islandExpertise: 'Konxedori di Ilha',
    multilingualService: 'Servisu Multilíngui',
    registerAgent: 'Rejista komu Agenti',

    // Market Insights
    marketInsightsTitle: 'Insaiti di Merkadu di Kasa na Kabu Verdi',
    stayInformed: 'Fika informadu ku últimu tendénsia di merkadu, oportunidadi di investimentu i dadus di kasa na tudu ilha',
    averagePropertyPrice: 'Presu Médiu di Kasa',
    foreignBuyers: 'Kumprador Stranjer',
    avgRentalYield: 'Rendimentu Médiu di Aluga',
    islandMarketPerformance: 'Performans di Merkadu pa Ilha',
    latestInsights: 'Últimu Insaiti di Merkadu',
    readFullReport: 'Le Relatóriu Kompletu',
    readyToInvest: 'Prontu pa Investi?',
    investmentProperties: 'Kasa di Investimentu',
    marketReports: 'Relatóriu di Merkadu',
    personalizedAdvice: 'Siña konseilhu personalizadu di investimentu di nos spesialista di merkadu i deskobre di mihór oportunidadi na merkadu di kasa ki ta krexi na Kabu Verdi.',

    villa: 'Vivenda',
    duplex: 'Duplex',
    studio: 'Estúdiu',
    penthouse: 'Kobertura',
    catVehicles: 'Veíkulu i Otomóvel',
    catElectronics: 'Eletróniku i Komputador',
    catHomeFurniture: 'Kasa, Móvel i Apareilhu',
    catBuildingMaterials: 'Material di Konstrusão i Feramenta',
    catRestaurants: 'Restauranti i Menu (Takeaway)',
    catFashion: 'Moda, Ropa i Komersu',
    catBabiesKids: 'Bebé i Kriansa',
    catPets: 'Animal i Asesóriu',
    catMaintenance: 'Manutensão i Reparasão',
    catProfessionalServices: 'Servisu Profisional i Eventu',
    photos: 'Foto',
    category: 'Kategoria',
    title: 'Títulu',
    description: 'Deskrisão',
    priceCVE: 'Presu (CVE)',
    island: 'Ilha',
    municipality: 'Munisípiu',
    dealType: 'Tipu di Negósiu',
    forSale: 'Pa Bende',
    forRent: 'Pa Aluga',
    bathrooms: 'Kasa di Banhu',
    areaM2: 'Área (m²)',
    pinLocation: 'Lokalizasão na Mapa (Opsional)',
    postAdButton: 'Publika Anúnsiu',
    promoteAd: 'Promove Anúnsiu',
    sellButton: '+ BENDE',
    createNewListing: 'Kria Novu Anúnsiu',
    editListing: 'Edita Anúnsiu',
    updateDetails: 'Atualiza detalhi di bu anúnsiu.',
    postDescription: 'Publika propriedadi, artigu o servisu na merkadu.',
    back: 'Volta',
    loadingData: 'Ta karega dadus...',
    availableProperties: 'Kasa Disponível',
    properties: 'Propriedadi',
    list: 'Lista',
    loadingMap: 'Ta karega mapa...',

    featuredProperties: 'Kasa Spesial',
    featuredItems: 'Artigu Spesial',
    featured: 'Spesial',
    itemsFound: 'artigu encontradu',
    noItemsFound: 'Nenhun artigu encontradu',
    beFirstToPost: 'Siña primeiru a publika! Ponhe bu artigu, veíkulu, servisu o kalker kusa pa komunidadi.',
    postFirstAd: 'Publika Primeiru Anúnsiu',
    contactAgent: 'Kontakta Agenti',
    contactSeller: 'Kontakta Vendedor',
    sendMessage: 'Manda Mensajen',
    sending: 'Ta manda...',
    inquirySent: 'Mensajen mandadu ku susesu!',
    name: 'Nomi',
    email: 'Email',
    phoneOptional: 'Telefoni (opsional)',
    message: 'Mensajen',
    callAgent: 'Liga pa Agenti',
    location: 'Lokalizasão',
    price: 'Presu',

    // Hero section - tabs & filters
    forSaleTab: 'Pa Bende',
    toRent: 'Pa Aluga',
    goods: 'Produtu',
    localServices: 'Servisu Lokal',
    filters: 'Filtru',
    islandOrNeighborhood: 'Ilha o bairu...',
    searchItemsOrServices: 'Buska artigu o servisu...',
    inRealEstate: 'na Imobiliária',
    inGeneralMarkets: 'na Merkadu',
    type: 'Tipu',
    any: 'Kalker',
    condition: 'Kondisão',
    newItem: 'Novu',
    usedItem: 'Uzadu',

    // My Store page
    viewMyStore: 'Ber Nha Loja',
    editProfile: 'Edita Perfil',
    cancel: 'Kansela',
    saveChanges: 'Guarda Mudansas',
    changePhoto: 'Troka Foto',
    activateBusinessAccount: 'Ativa Konta di Empreza',
    activateBusinessDesc: 'Transforma bu perfil numa loja profisional ku nomi di marka, logotipu i banner personalizadu. Totalmenti grátis!',
    businessAccountActive: 'Konta di Empreza Ativa',
    storeConfigured: 'Loja konfiguradu',
    editData: 'Edita Dadus',
    deactivate: 'Dezativa',
    manageStorefront: 'Jeri Montra',
    manageStorefrontDesc: 'Personaliza pájina públiku di bu loja ku logotipu, banner i descrição.',
    close: 'Fitxa',
    edit: 'Edita',
    storeName: 'Nomi di Loja',
    storeDescription: 'Descrição',
    logoUrl: 'URL di Logotipu',
    bannerUrl: 'URL di Banner',
    saveStorefront: 'Guarda Montra',
    myStores: 'Nhas Lojas',
    activeStores: 'lojas ativas',
    createNewStore: 'Kria Loja Novu',
    noStoresYet: 'Ningum loja kriadu ainda.',
    createSeparateStorefronts: 'Kria montras separadu pa diferenti kategorias.',
    storeTitle: 'Títulu di Loja',
    customUrl: 'URL Personalizadu (Slug)',
    locationLabel: 'Lokalizasão',
    categoryLabel: 'Kategoria',
    selectCategory: 'Selecion...',
    descriptionLabel: 'Descrição',
    describeStoreFocus: 'Deskrebe foku di bu loja...',
    createStore: 'Kria Loja',
    myWallet: 'Nha Karteira',
    walletDesc: 'Uza bu saldu pa impulsiona anúnsius i ativa funsionalidadis premium.',
    voucherPlaceholder: 'Kódigu di voucher (ex: XXXX-XXXX-XXXX)',
    redeem: 'Resgata',
    boostListing: 'Impulsiona Anúnsiu',
    boostListingDesc: 'Bu anúnsiu ta ser kolokadu na topu di resultadus.',
    cost: 'Kustu',
    currentBalance: 'Saldu atual',
    balanceAfter: 'Saldu dipôs',
    payWithBalance: 'Paga ku Saldu',
    myActiveListings: 'Nhas Anúnsius Ativus',
    postNew: '+ Publika Novu',
    noListingsFound: 'Ningum anúnsiu nkontradu nesta kategoria.',
    postYourFirstAd: 'Publika bu primeiru anúnsiu',
    highlight: 'Destaka',
    boost: 'Impulsiona',
    sold: 'Vendidu',
    relistAd: 'Republika',
    deleteLabel: 'Elimina',
    deletePermanently: 'Elimina Permanentementi',
    deleteConfirmDesc: 'Es anúnsiu ta ser removidu pa sempri.',
    expandBusiness: 'Espandi Bu Negósiu!',
    expandBusinessDesc: 'Bu konta atual txiga na limiti di lojas grátis. Desblokeia lojas personalizadus adisional pa separa bus produtus por apena',
    unlockPremiumStores: 'Desblokeia Lojas Premium',
    maybeLater: 'Talves dipôs',
    planFree: 'Planu Patrão (Grátis)',
    configureBusinessStore: 'Konfigura Loja Profisional',
    personalizeIdentity: 'Personaliza identidadi di bu empreza',
    businessName: 'Nomi di Empreza',
    storeLogo: 'Logotipu di Loja',
    chooseFile: 'Skolhe Fixeru',
    bioDescription: 'Bio / Descrição',
    describeYourBusiness: 'Deskrebe bu empreza na pokus palavras...',
    saveOrActivate: 'Ativa Konta di Empreza',
    paywallTitle: 'Bu loja jera más di 15 leads di klientis!',
    paywallDesc: 'Parabéns! Pa kontinua publika anúnsius i resebe kontaktus, atualiza pa subskrição mensal ku asesu ilimitadu.',
    viewSubscriptionPlans: 'Ber Planus di Subskrição',
    unlockAdditionalStores: 'Desblokeia Lojas Adisional!',
    unlockAdditionalStoresDesc: 'Bu konta atual permiti 1 loja. Atualiza pa planu Premium Multi-Store pa espandi bu marka na Kabu Verdi.',
    premiumPlan: 'Planu Premium',
    upTo5Stores: 'Té 5 lojas independentis',
    customUrlsPerStore: 'URLs personalizadus pa kada loja',
    customBranding: 'Koris i branding personalizável',
    advancedStatsPerStore: 'Estatístikas avansadus por loja',
    upgradeNow: 'Atualiza Agora',
    property: 'Propriedadi',
    itemService: 'Artigu / Servisu',
  }
};

// Language context
interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en'); // Default to English
  const [isLoaded, setIsLoaded] = useState(false);

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('proCV_language', lang);
    }
  };

  // Initialize language from localStorage on client side
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('proCV_language') as LanguageCode;
      if (savedLang && languages[savedLang]) {
        setCurrentLanguage(savedLang);
      }
    }
    setIsLoaded(true);
  }, []);

  const value = {
    currentLanguage,
    setLanguage,
    t: translations[currentLanguage],
    languages
  };

  // Only render children after client-side hydration to prevent mismatch
  if (!isLoaded) {
    return (
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
