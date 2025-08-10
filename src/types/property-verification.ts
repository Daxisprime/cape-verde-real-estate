// Property Verification and Official Data Types
export interface PropertyVerificationStatus {
  id: string;
  propertyId: string;
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  verifiedAt?: string;
  expiresAt?: string;
  verificationLevel: 'government' | 'mls' | 'agent' | 'basic';
  verifiedBy?: {
    entity: string;
    entityType: 'government' | 'mls' | 'certified_agent';
    licenseNumber?: string;
  };
  issues?: PropertyVerificationIssue[];
}

export interface PropertyVerificationIssue {
  id: string;
  type: 'legal' | 'documentation' | 'ownership' | 'zoning' | 'debt';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  resolvedAt?: string;
  recommendedAction?: string;
}

// Cape Verde Land Registry Integration
export interface CapeVerdeLandRegistry {
  propertyId: string;
  registryNumber: string;
  cadastralReference: string;
  legalStatus: 'clear' | 'encumbered' | 'disputed' | 'pending';
  ownershipChain: PropertyOwnershipRecord[];
  legalDocuments: LegalDocument[];
  restrictions?: PropertyRestriction[];
  lastUpdated: string;
  governmentVerified: boolean;
}

export interface PropertyOwnershipRecord {
  id: string;
  ownerName: string;
  ownerTaxId?: string;
  acquisitionDate: string;
  acquisitionType: 'purchase' | 'inheritance' | 'gift' | 'court_order';
  registrationDate: string;
  documentReference: string;
  isCurrentOwner: boolean;
}

export interface LegalDocument {
  id: string;
  type: 'deed' | 'title' | 'survey' | 'permit' | 'tax_clearance' | 'mortgage';
  documentNumber: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'pending' | 'revoked';
  digitalCopyUrl?: string;
  blockchainHash?: string;
}

export interface PropertyRestriction {
  id: string;
  type: 'zoning' | 'environmental' | 'heritage' | 'easement' | 'mortgage' | 'lien';
  description: string;
  issuedBy: string;
  startDate: string;
  endDate?: string;
  impact: 'sale_restricted' | 'development_restricted' | 'access_restricted' | 'informational';
}

// MLS Integration Types
export interface MLSPropertyData {
  mlsId: string;
  propertyId: string;
  listingAgentId: string;
  listingOffice: MLSOffice;
  mlsStatus: 'active' | 'pending' | 'sold' | 'expired' | 'withdrawn';
  listingDate: string;
  lastModified: string;
  daysOnMarket: number;
  priceHistory: MLSPriceHistory[];
  showingInstructions?: string;
  keyBoxType?: string;
  virtualTourUrl?: string;
  professionalPhotos: string[];
  floorPlans?: string[];
  disclosures: MLSDisclosure[];
}

export interface MLSOffice {
  id: string;
  name: string;
  licenseNumber: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  verified: boolean;
}

export interface MLSPriceHistory {
  id: string;
  price: number;
  changeDate: string;
  changeType: 'initial' | 'increase' | 'decrease' | 'final';
  changeAmount?: number;
  reason?: string;
}

export interface MLSDisclosure {
  id: string;
  type: 'lead_paint' | 'asbestos' | 'flood_zone' | 'earthquake' | 'environmental' | 'other';
  required: boolean;
  provided: boolean;
  documentUrl?: string;
  notes?: string;
}

// Real-time Data Synchronization
export interface PropertyDataSync {
  propertyId: string;
  lastSyncDate: string;
  syncSources: DataSource[];
  syncStatus: 'success' | 'partial' | 'failed' | 'pending';
  conflicts?: DataConflict[];
  nextSyncDate: string;
  autoSyncEnabled: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'government' | 'mls' | 'agent' | 'third_party';
  lastUpdate: string;
  reliability: number; // 0-100%
  apiEndpoint?: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
}

export interface DataConflict {
  id: string;
  field: string;
  values: {
    source: string;
    value: string | number | boolean;
    confidence: number;
    lastUpdated: string;
  }[];
  resolution?: 'manual' | 'automated' | 'pending';
  resolvedAt?: string;
}

// Government API Integration
export interface CapeVerdeGovernmentAPI {
  propertySearch: (criteria: PropertySearchCriteria) => Promise<GovernmentPropertyRecord[]>;
  propertyVerification: (propertyId: string) => Promise<PropertyVerificationStatus>;
  ownershipVerification: (ownerTaxId: string) => Promise<OwnershipVerificationResult>;
  documentRetrieval: (documentId: string) => Promise<OfficialDocument>;
  complianceCheck: (propertyId: string) => Promise<ComplianceStatus>;
}

export interface PropertySearchCriteria {
  registryNumber?: string;
  cadastralReference?: string;
  address?: string;
  ownerName?: string;
  ownerTaxId?: string;
  island?: string;
  municipality?: string;
}

export interface GovernmentPropertyRecord {
  registryNumber: string;
  cadastralReference: string;
  address: string;
  island: string;
  municipality: string;
  propertyType: string;
  landArea: number;
  buildingArea?: number;
  zoning: string;
  currentOwner: string;
  taxAssessedValue: number;
  taxStatus: 'current' | 'delinquent' | 'exempt';
  lastUpdated: string;
}

export interface OwnershipVerificationResult {
  isVerified: boolean;
  ownerName: string;
  ownerTaxId: string;
  propertiesOwned: string[];
  verificationDate: string;
  confidenceScore: number;
}

export interface OfficialDocument {
  id: string;
  type: string;
  title: string;
  issuedBy: string;
  issuedDate: string;
  validUntil?: string;
  documentUrl?: string;
  digitalSignature?: string;
  blockchainHash?: string;
}

export interface ComplianceStatus {
  propertyId: string;
  isCompliant: boolean;
  checks: ComplianceCheck[];
  lastCheckDate: string;
  nextCheckDate?: string;
}

export interface ComplianceCheck {
  type: 'tax' | 'zoning' | 'building_permit' | 'environmental' | 'heritage';
  status: 'passed' | 'failed' | 'warning' | 'not_applicable';
  details: string;
  referenceNumber?: string;
  checkDate: string;
}

// Market Data Feed Types
export interface LiveMarketData {
  island: string;
  municipality?: string;
  averagePrice: number;
  medianPrice: number;
  pricePerSqm: number;
  salesVolume: number;
  daysOnMarket: number;
  priceChange: {
    amount: number;
    percentage: number;
    period: '1_month' | '3_months' | '6_months' | '1_year';
  };
  marketTrend: 'rising' | 'falling' | 'stable';
  dataDate: string;
  confidence: number;
}

export interface PropertyPriceEstimate {
  propertyId: string;
  estimatedValue: number;
  confidence: number;
  valuationDate: string;
  methodology: string;
  factors: ValuationFactor[];
  comparableProperties: string[];
  lastMarketSale?: {
    price: number;
    date: string;
    daysOnMarket: number;
  };
}

export interface ValuationFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// Enhanced Property Interface with Verification
export interface VerifiedProperty {
  // Base property information
  id: string;
  title: string;
  description: string;
  price: number;

  // Location and physical details
  address: string;
  island: string;
  municipality: string;
  coordinates?: { lat: number; lng: number };

  // Property characteristics
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  totalArea: number;
  landArea?: number;
  buildingArea?: number;
  yearBuilt?: number;

  // Verification and official data
  verification: PropertyVerificationStatus;
  landRegistry?: CapeVerdeLandRegistry;
  mlsData?: MLSPropertyData;
  governmentData?: GovernmentPropertyRecord;
  dataSync: PropertyDataSync;

  // Market information
  marketData?: LiveMarketData;
  priceEstimate?: PropertyPriceEstimate;

  // Additional features
  images: string[];
  documents: string[];
  features: string[];
  amenities: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isFeatured: boolean;
}
