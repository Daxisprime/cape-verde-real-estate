"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Supported languages
export const languages = {
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  pt: { code: 'pt', name: 'Português', flag: '🇵🇹' },
  cv: { code: 'cv', name: 'Kriolu', flag: '🇨🇻' }
} as const;

export type LanguageCode = keyof typeof languages;

// Translation interface
export interface Translations {
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
}

// Translations data
const translations: Record<LanguageCode, Translations> = {
  en: {
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
    personalizedAdvice: 'Get personalized investment advice from our market experts and discover the best opportunities across Cape Verde\'s growing property market.'
  },
  pt: {
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
    personalizedAdvice: 'Obtenha conselhos de investimento personalizados dos nossos especialistas de mercado e descubra as melhores oportunidades no crescente mercado imobiliário de Cabo Verde.'
  },
  fr: {
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
    personalizedAdvice: 'Obtenez des conseils d\'investissement personnalisés de nos spécialistes du marché et découvrez les meilleures opportunités dans le marché immobilier en croissance du Cap-Vert.'
  },
  es: {
    // Navigation
    buy: 'Comprar',
    rent: 'Alquilar',
    sell: 'Vender',
    commercial: 'Comercial',
    calculators: 'Calculadoras',
    advice: 'Consejos',
    listProperty: 'Listar Propiedad',
    signIn: 'Iniciar Sesión',

    // Hero section
    heroTitle: 'Encuentra Propiedades en Venta en Cabo Verde',
    heroSearchPlaceholder: 'Buscar una Isla, Ciudad o Área',
    map: 'Mapa',
    search: 'Buscar',
    developments: 'Desarrollos',
    agents: 'Agentes',
    soldPrices: 'Precios Vendidos',

    // Property filters
    propertyType: 'Tipo de Propiedad',
    minPrice: 'Precio Mín',
    maxPrice: 'Precio Máx',
    bedrooms: 'Habitaciones',
    moreFilters: 'Más Filtros',

    // Property types
    house: 'Casa',
    apartment: 'Apartamento',
    townhouse: 'Casa Adosada',
    land: 'Terreno',
    commercialProperty: 'Comercial',

    // Info section
    discoverTitle: 'Descubre el Mercado Inmobiliario de Cabo Verde',
    discoverSubtitle: 'Todo lo que necesitas para comprar, vender o alquilar propiedades en las hermosas islas de Cabo Verde',
    propertyAlerts: 'Alertas de Propiedad',
    marketTrends: 'Tendencias del Mercado',
    propertyGuides: 'Guías Inmobiliarias',
    findAgents: 'Encontrar Agentes',
    propertyValuation: 'Valoración Inmobiliaria',
    mortgageCalculator: 'Calculadora Hipotecaria',

    // Regional section
    regionalTitle: 'Propiedades en Venta en Cabo Verde',
    regionalSubtitle: 'Explora propiedades en todas las islas de Cabo Verde',
    propertyTrends: 'Tendencias Inmobiliarias de Cabo Verde',
    avgPropertyPrice: 'Precio Promedio de Propiedades',
    priceGrowth: 'Crecimiento de Precios (Anual)',
    mostPopularIsland: 'Isla Más Popular',
    propertiesListed: 'Propiedades Listadas',
    acrossAllIslands: 'En todas las islas',

    // Property Listings
    featuredProperties: 'Propiedades Destacadas en Cabo Verde',
    viewDetails: 'Ver Detalles',
    viewAllProperties: 'Ver Todas las Propiedades',
    advancedSearch: 'Búsqueda Avanzada',
    featured: 'Destacado',

    // Mortgage Calculator
    mortgageCalculatorTitle: 'Calculadora Hipotecaria de Cabo Verde',
    mortgageDetails: 'Detalles Hipotecarios',
    propertyPrice: 'Precio de la Propiedad',
    downPayment: 'Pago Inicial',
    loanTerm: 'Plazo del Préstamo',
    interestRate: 'Tasa de Interés',
    calculateMortgage: 'Calcular Hipoteca',
    mortgageResults: 'Resultados Hipotecarios',
    monthlyPayment: 'Pago Mensual',
    loanAmount: 'Monto del Préstamo',
    totalInterest: 'Intereses Totales',
    totalPayment: 'Pago Total',
    importantNotes: 'Notas Importantes',
    getPreApproved: 'Obtener Pre-aprobación',
    contactBank: 'Contactar Banco',
    bankingPartners: 'Socios Bancarios de Cabo Verde',

    // Estate Agents
    professionalAgents: 'Agentes Inmobiliarios Profesionales',
    connectAgents: 'Conéctate con profesionales inmobiliarios experimentados en todas las islas de Cabo Verde',
    yearsExperience: 'Años de Experiencia',
    propertiesSold: 'Propiedades Vendidas',
    specialties: 'Especialidades',
    languages: 'Idiomas',
    viewProfile: 'Ver Perfil y Listados',
    verifiedProfessionals: 'Profesionales Verificados',
    islandExpertise: 'Experiencia en Islas',
    multilingualService: 'Servicio Multilingüe',
    registerAgent: 'Registrarse como Agente',

    // Market Insights
    marketInsightsTitle: 'Perspectivas del Mercado Inmobiliario de Cabo Verde',
    stayInformed: 'Mantente informado sobre las últimas tendencias del mercado, oportunidades de inversión y datos inmobiliarios en todas las islas',
    averagePropertyPrice: 'Precio Promedio de Propiedades',
    foreignBuyers: 'Compradores Extranjeros',
    avgRentalYield: 'Rendimiento de Alquiler Promedio',
    islandMarketPerformance: 'Rendimiento del Mercado por Isla',
    latestInsights: 'Últimas Perspectivas del Mercado',
    readFullReport: 'Leer Informe Completo',
    readyToInvest: '¿Listo para Invertir?',
    investmentProperties: 'Propiedades de Inversión',
    marketReports: 'Informes de Mercado',
    personalizedAdvice: 'Obtén consejos de inversión personalizados de nuestros especialistas del mercado y descubre las mejores oportunidades en el creciente mercado inmobiliario de Cabo Verde.'
  },
  cv: {
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
    personalizedAdvice: 'Siña konseilhu personalizadu di investimentu di nos spesialista di merkadu i deskobre di mihór oportunidadi na merkadu di kasa ki ta krexi na Kabu Verdi.'
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
