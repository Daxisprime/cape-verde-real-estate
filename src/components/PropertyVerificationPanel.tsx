"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, Clock, FileText, Building,
  MapPin, Calendar, User, AlertTriangle, CheckCircle, Info,
  ExternalLink, Download, RefreshCw, TrendingUp, Eye, Crown,
  Copy, Hash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PropertyVerificationBadge from './PropertyVerificationBadge';
import { useToast } from '@/hooks/use-toast';
import {
  PropertyVerificationStatus,
  CapeVerdeLandRegistry,
  MLSPropertyData,
  PropertyDataSync,
  LiveMarketData,
  PropertyPriceEstimate,
  ComplianceStatus
} from '@/types/property-verification';
import { propertyVerificationService } from '@/services/property-data-integration';

interface PropertyVerificationPanelProps {
  propertyId: string;
  verification?: PropertyVerificationStatus;
  landRegistry?: CapeVerdeLandRegistry;
  mlsData?: MLSPropertyData;
  dataSync?: PropertyDataSync;
  marketData?: LiveMarketData;
  priceEstimate?: PropertyPriceEstimate;
  onVerificationUpdate?: (verification: PropertyVerificationStatus) => void;
}

export default function PropertyVerificationPanel({
  propertyId,
  verification,
  landRegistry,
  mlsData,
  dataSync,
  marketData,
  priceEstimate,
  onVerificationUpdate
}: PropertyVerificationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const { toast } = useToast();

  const loadComplianceData = useCallback(async () => {
    try {
      // In a real implementation, this would load from the API
      setCompliance({
        propertyId,
        isCompliant: true,
        checks: [
          {
            type: 'tax',
            status: 'passed',
            details: 'Property taxes current through 2024',
            referenceNumber: 'TAX-2024-CV-001',
            checkDate: new Date().toISOString()
          },
          {
            type: 'zoning',
            status: 'passed',
            details: 'Property complies with residential zoning requirements',
            referenceNumber: 'ZON-2024-RES-045',
            checkDate: new Date().toISOString()
          }
        ],
        lastCheckDate: new Date().toISOString(),
        nextCheckDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      console.error('Error loading compliance data:', error);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId && !compliance) {
      loadComplianceData();
    }
  }, [propertyId, compliance, loadComplianceData]);

  const handleRefreshVerification = async () => {
    setIsLoading(true);
    try {
      const updatedVerification = await propertyVerificationService.verifyProperty(propertyId);
      onVerificationUpdate?.(updatedVerification);

      toast({
        title: "Verification Updated",
        description: "Property verification data has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh verification data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Information copied to clipboard.",
    });
  };

  if (!verification) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Not Available</h3>
          <p className="text-gray-600 mb-4">Property verification data is not available for this listing.</p>
          <Button onClick={handleRefreshVerification} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isLoading ? 'Loading...' : 'Start Verification'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-xl">Property Verification</CardTitle>
              <PropertyVerificationBadge verification={verification} size="lg" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshVerification}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        {verification.issues && verification.issues.length > 0 && (
          <CardContent className="pt-0">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Verification Issues Found:</div>
                <ul className="list-disc list-inside space-y-1">
                  {verification.issues.map((issue, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{issue.type}:</span> {issue.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Verification Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="government">Government Data</TabsTrigger>
          <TabsTrigger value="mls">MLS Data</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verification Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Verification Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{verification.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium capitalize">{verification.verificationLevel}</span>
                </div>
                {verification.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified:</span>
                    <span className="font-medium">
                      {new Date(verification.verifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {verification.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">
                      {new Date(verification.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {verification.verifiedBy && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verified By:</span>
                        <span className="font-medium text-right">{verification.verifiedBy.entity}</span>
                      </div>
                      {verification.verifiedBy.licenseNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">License:</span>
                          <div className="flex items-center">
                            <span className="font-medium">{verification.verifiedBy.licenseNumber}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-2"
                              onClick={() => copyToClipboard(verification.verifiedBy!.licenseNumber!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dataSync?.syncSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        source.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className="font-medium">{source.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{source.reliability}% reliable</div>
                      <div className="text-xs text-gray-500">
                        {new Date(source.lastUpdate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {dataSync && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Sync:</span>
                      <span>{new Date(dataSync.lastSyncDate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Next Sync:</span>
                      <span>{new Date(dataSync.nextSyncDate).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Government Data Tab */}
        <TabsContent value="government" className="space-y-4">
          {landRegistry ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Cape Verde Land Registry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Registry Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registry Number:</span>
                        <div className="flex items-center">
                          <span className="font-medium">{landRegistry.registryNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 ml-2"
                            onClick={() => copyToClipboard(landRegistry.registryNumber)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cadastral Reference:</span>
                        <span className="font-medium">{landRegistry.cadastralReference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Legal Status:</span>
                        <Badge className={
                          landRegistry.legalStatus === 'clear' ? 'bg-green-100 text-green-800' :
                          landRegistry.legalStatus === 'encumbered' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {landRegistry.legalStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Current Ownership</h4>
                    {landRegistry.ownershipChain.filter(owner => owner.isCurrentOwner).map((owner) => (
                      <div key={owner.id} className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Owner:</span>
                          <span className="font-medium">{owner.ownerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Since:</span>
                          <span>{new Date(owner.acquisitionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Acquisition:</span>
                          <span className="capitalize">{owner.acquisitionType.replace('_', ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {landRegistry.restrictions && landRegistry.restrictions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Property Restrictions</h4>
                      <div className="space-y-2">
                        {landRegistry.restrictions.map((restriction) => (
                          <Alert key={restriction.id}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="font-medium">{restriction.type.replace('_', ' ')}</div>
                              <div className="text-sm mt-1">{restriction.description}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Issued by: {restriction.issuedBy}
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Government Data Not Available</h3>
                <p className="text-gray-600">Land registry data is not available for this property.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* MLS Data Tab */}
        <TabsContent value="mls" className="space-y-4">
          {mlsData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  MLS Professional Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Listing Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">MLS ID:</span>
                        <span className="font-medium">{mlsData.mlsId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={
                          mlsData.mlsStatus === 'active' ? 'bg-green-100 text-green-800' :
                          mlsData.mlsStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {mlsData.mlsStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days on Market:</span>
                        <span className="font-medium">{mlsData.daysOnMarket} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Listed:</span>
                        <span>{new Date(mlsData.listingDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Listing Office</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Office:</span>
                        <span className="font-medium">{mlsData.listingOffice.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">License:</span>
                        <span className="font-medium">{mlsData.listingOffice.licenseNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{mlsData.listingOffice.phone}</span>
                      </div>
                      {mlsData.listingOffice.verified && (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-green-600 font-medium">Verified Office</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {mlsData.priceHistory.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Price History</h4>
                      <div className="space-y-2">
                        {mlsData.priceHistory.map((price) => (
                          <div key={price.id} className="flex justify-between items-center text-sm">
                            <span>{new Date(price.changeDate).toLocaleDateString()}</span>
                            <div className="flex items-center">
                              <span className="font-medium">€{price.price.toLocaleString()}</span>
                              <Badge variant="outline" className="ml-2 capitalize">
                                {price.changeType}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">MLS Data Not Available</h3>
                <p className="text-gray-600">This property is not listed in the MLS system.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Market Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Price:</span>
                    <span className="font-medium">€{marketData.averagePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per m²:</span>
                    <span className="font-medium">€{marketData.pricePerSqm.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sales Volume:</span>
                    <span className="font-medium">{marketData.salesVolume} properties</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days on Market:</span>
                    <span className="font-medium">{marketData.daysOnMarket} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Trend:</span>
                    <Badge className={
                      marketData.marketTrend === 'rising' ? 'bg-green-100 text-green-800' :
                      marketData.marketTrend === 'falling' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {marketData.marketTrend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {priceEstimate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Price Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Value:</span>
                    <span className="font-bold text-lg">€{priceEstimate.estimatedValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">{Math.round(priceEstimate.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Methodology:</span>
                    <span className="font-medium text-right">{priceEstimate.methodology}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valuation Date:</span>
                    <span>{new Date(priceEstimate.valuationDate).toLocaleDateString()}</span>
                  </div>

                  {priceEstimate.lastMarketSale && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="font-medium">Last Market Sale</h5>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span>€{priceEstimate.lastMarketSale.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span>{new Date(priceEstimate.lastMarketSale.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          {compliance ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Overall Compliance</span>
                  <Badge className={
                    compliance.isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }>
                    {compliance.isCompliant ? 'Compliant' : 'Non-Compliant'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {compliance.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {check.status === 'passed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : check.status === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium capitalize">{check.type.replace('_', ' ')} Check</div>
                          <div className="text-sm text-gray-600">{check.details}</div>
                          {check.referenceNumber && (
                            <div className="text-xs text-gray-500">Ref: {check.referenceNumber}</div>
                          )}
                        </div>
                      </div>
                      <Badge className={
                        check.status === 'passed' ? 'bg-green-100 text-green-800' :
                        check.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {check.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Check:</span>
                  <span>{new Date(compliance.lastCheckDate).toLocaleDateString()}</span>
                </div>
                {compliance.nextCheckDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Check:</span>
                    <span>{new Date(compliance.nextCheckDate).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Data Loading</h3>
                <p className="text-gray-600">Loading compliance information...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
