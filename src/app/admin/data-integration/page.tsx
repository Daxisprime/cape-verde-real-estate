"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Database, RefreshCw as Sync, AlertTriangle, CheckCircle,
  TrendingUp, Activity, RefreshCw, Settings, Download,
  Crown, Building, BarChart3, Clock, ExternalLink,
  Play, Pause, Info, Calendar, Users, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  status: string;
  syncInfo: {
    lastSyncDate: string;
    nextScheduledSync: string;
    syncFrequency: string;
    autoSyncEnabled: boolean;
    totalProperties: number;
    verifiedProperties: number;
    pendingVerification: number;
    lastSyncResults: {
      government: { successful: number; failed: number };
      mls: { successful: number; failed: number };
      verification: { successful: number; failed: number };
    };
    dataSources: Array<{
      id: string;
      name: string;
      status: string;
      lastContact: string;
      reliability: number;
    }>;
  };
  systemHealth: {
    overall: string;
    apiConnections: string;
    dataQuality: string;
    lastHealthCheck: string;
  };
}

export default function DataIntegrationAdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedSyncType, setSelectedSyncType] = useState('full');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/data-sync/status');
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch synchronization status.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchSyncStatus();
  }, [isAuthenticated, user, router, fetchSyncStatus]);

  const handleStartSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/data-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syncType: selectedSyncType,
          propertyIds: null // Sync all properties
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Sync Started",
          description: `Data synchronization (${selectedSyncType}) started successfully.`,
        });

        // Refresh status after sync
        setTimeout(() => {
          fetchSyncStatus();
        }, 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to start data synchronization.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'operational':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading data integration dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Database className="h-8 w-8 mr-3 text-blue-600" />
                Property Data Integration
              </h1>
              <p className="text-gray-600 mt-1">
                Manage property verification and data synchronization with Cape Verde government and MLS systems
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={fetchSyncStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Select value={selectedSyncType} onValueChange={setSelectedSyncType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Sync</SelectItem>
                  <SelectItem value="government">Government Only</SelectItem>
                  <SelectItem value="mls">MLS Only</SelectItem>
                  <SelectItem value="verification">Verification Only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleStartSync} disabled={isSyncing}>
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Sync
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* System Health Alert */}
        {syncStatus?.systemHealth && (
          <Alert className={`mb-6 ${
            syncStatus.systemHealth.overall === 'healthy' ? 'border-green-200' : 'border-yellow-200'
          }`}>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">System Status: </span>
                  <Badge className={getStatusColor(syncStatus.systemHealth.overall)}>
                    {syncStatus.systemHealth.overall}
                  </Badge>
                  <span className="ml-4 text-sm">
                    API Connections: {syncStatus.systemHealth.apiConnections} •
                    Data Quality: {syncStatus.systemHealth.dataQuality}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Last check: {new Date(syncStatus.systemHealth.lastHealthCheck).toLocaleString()}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Stats */}
        {syncStatus?.syncInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Verified Properties</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {syncStatus.syncInfo.verifiedProperties}
                    </p>
                    <p className="text-xs text-gray-500">
                      of {syncStatus.syncInfo.totalProperties} total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Verification</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {syncStatus.syncInfo.pendingVerification}
                    </p>
                    <p className="text-xs text-gray-500">properties</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Sync className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Last Sync</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(syncStatus.syncInfo.lastSyncDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(syncStatus.syncInfo.lastSyncDate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Next Sync</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(syncStatus.syncInfo.nextScheduledSync).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Auto-sync: {syncStatus.syncInfo.autoSyncEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sync Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Last Sync Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {syncStatus?.syncInfo.lastSyncResults && Object.entries(syncStatus.syncInfo.lastSyncResults).map(([source, results]) => (
                    <div key={source} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize flex items-center">
                          {source === 'government' && <Crown className="h-4 w-4 mr-2" />}
                          {source === 'mls' && <Building className="h-4 w-4 mr-2" />}
                          {source === 'verification' && <Shield className="h-4 w-4 mr-2" />}
                          {source}
                        </span>
                        <div className="text-sm">
                          <span className="text-green-600">{results.successful} success</span>
                          {results.failed > 0 && (
                            <span className="text-red-600 ml-2">{results.failed} failed</span>
                          )}
                        </div>
                      </div>
                      <Progress
                        value={(results.successful / (results.successful + results.failed)) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Verification Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Verification Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {syncStatus?.syncInfo && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Verified Properties</span>
                          <span>{syncStatus.syncInfo.verifiedProperties}/{syncStatus.syncInfo.totalProperties}</span>
                        </div>
                        <Progress
                          value={(syncStatus.syncInfo.verifiedProperties / syncStatus.syncInfo.totalProperties) * 100}
                          className="h-3"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round((syncStatus.syncInfo.verifiedProperties / syncStatus.syncInfo.totalProperties) * 100)}%
                          </div>
                          <div className="text-sm text-green-700">Verification Rate</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {syncStatus.syncInfo.pendingVerification}
                          </div>
                          <div className="text-sm text-blue-700">Pending</div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {syncStatus?.syncInfo.dataSources.map((source) => (
                <Card key={source.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        {source.name.includes('Government') && <Crown className="h-5 w-5 mr-2" />}
                        {source.name.includes('MLS') && <Building className="h-5 w-5 mr-2" />}
                        {source.name.includes('Market') && <BarChart3 className="h-5 w-5 mr-2" />}
                        <span className="text-base">{source.name}</span>
                      </div>
                      <Badge className={getStatusColor(source.status)}>
                        {source.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reliability:</span>
                      <span className="font-medium">{source.reliability}%</span>
                    </div>
                    <Progress value={source.reliability} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Contact:</span>
                      <span>{new Date(source.lastContact).toLocaleString()}</span>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Verification summary would go here */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Property verification details and management tools would be displayed here.
                      This includes individual property verification status, issue tracking, and bulk verification operations.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Generate Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Verification Summary Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Data Source Reliability Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Sync Performance Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    System Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Agents:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">API Calls Today:</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Updates:</span>
                      <span className="font-medium">89</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
