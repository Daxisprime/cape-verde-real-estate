"use client";

import { useState, useEffect } from 'react';
import {
  BarChart3, Users, DollarSign, Eye, TrendingUp, Calendar,
  Globe, MapPin, MessageSquare, Heart, Search, Download,
  Filter, RefreshCw, AlertCircle, CheckCircle, Clock,
  Smartphone, Monitor, Tablet, Chrome, Globe as Firefox, Globe as Safari,
  ArrowUp, ArrowDown, Activity, PieChart, LineChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import AdminAnalytics from '@/components/AdminAnalytics';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalPageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    totalRevenue: number;
    conversionRate: number;
    newUsers: number;
  };
  traffic: {
    hourly: Array<{ hour: string; visitors: number; pageViews: number }>;
    daily: Array<{ date: string; visitors: number; pageViews: number; revenue: number }>;
    sources: Array<{ source: string; visitors: number; percentage: number }>;
  };
  users: {
    demographics: Array<{ country: string; users: number; percentage: number }>;
    devices: Array<{ device: string; users: number; percentage: number }>;
    browsers: Array<{ browser: string; users: number; percentage: number }>;
  };
  content: {
    topPages: Array<{ page: string; views: number; avgTime: number; bounceRate: number }>;
    properties: Array<{ id: string; title: string; views: number; inquiries: number; favorites: number }>;
  };
  payments: {
    totalRevenue: number;
    totalTransactions: number;
    avgTransactionValue: number;
    paymentMethods: Array<{ method: string; count: number; amount: number }>;
    subscriptions: Array<{ plan: string; active: number; revenue: number }>;
  };
  realTime: {
    activeUsers: number;
    activeSessions: number;
    pageViewsPerMinute: number;
    topActivePages: Array<{ page: string; activeUsers: number }>;
  };
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    overview: {
      totalUsers: 15847,
      activeUsers: 2841,
      totalPageViews: 89562,
      bounceRate: 32.5,
      avgSessionDuration: 245, // seconds
      totalRevenue: 127500,
      conversionRate: 3.2,
      newUsers: 1247
    },
    traffic: {
      hourly: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        visitors: Math.floor(Math.random() * 200) + 50,
        pageViews: Math.floor(Math.random() * 800) + 200
      })),
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        visitors: Math.floor(Math.random() * 500) + 200,
        pageViews: Math.floor(Math.random() * 2000) + 800,
        revenue: Math.floor(Math.random() * 5000) + 1000
      })),
      sources: [
        { source: 'Direct', visitors: 5847, percentage: 36.9 },
        { source: 'Google Search', visitors: 4521, percentage: 28.5 },
        { source: 'Social Media', visitors: 2841, percentage: 17.9 },
        { source: 'Referrals', visitors: 1847, percentage: 11.7 },
        { source: 'Email', visitors: 791, percentage: 5.0 }
      ]
    },
    users: {
      demographics: [
        { country: 'Cape Verde', users: 8847, percentage: 55.8 },
        { country: 'Portugal', users: 2841, percentage: 17.9 },
        { country: 'France', users: 1547, percentage: 9.8 },
        { country: 'United States', users: 1247, percentage: 7.9 },
        { country: 'Spain', users: 891, percentage: 5.6 },
        { country: 'Other', users: 474, percentage: 3.0 }
      ],
      devices: [
        { device: 'Mobile', users: 9847, percentage: 62.1 },
        { device: 'Desktop', users: 4521, percentage: 28.5 },
        { device: 'Tablet', users: 1479, percentage: 9.4 }
      ],
      browsers: [
        { browser: 'Chrome', users: 10247, percentage: 64.6 },
        { browser: 'Safari', users: 3241, percentage: 20.4 },
        { browser: 'Firefox', users: 1547, percentage: 9.8 },
        { browser: 'Edge', users: 812, percentage: 5.2 }
      ]
    },
    content: {
      topPages: [
        { page: '/', views: 25841, avgTime: 185, bounceRate: 28.5 },
        { page: '/property/1', views: 15247, avgTime: 320, bounceRate: 15.2 },
        { page: '/search', views: 12847, avgTime: 225, bounceRate: 35.8 },
        { page: '/property/2', views: 9847, avgTime: 298, bounceRate: 18.7 },
        { page: '/analytics', views: 7241, avgTime: 445, bounceRate: 22.1 }
      ],
      properties: [
        { id: '1', title: 'Modern Beachfront Villa', views: 15247, inquiries: 89, favorites: 234 },
        { id: '2', title: 'Smart City Center Apartment', views: 9847, inquiries: 67, favorites: 156 },
        { id: '3', title: 'Luxury Ocean View Penthouse', views: 8541, inquiries: 45, favorites: 201 },
        { id: '4', title: 'Eco-Smart Traditional House', views: 6247, inquiries: 32, favorites: 98 },
        { id: '5', title: 'AI-Optimized Resort Condo', views: 5841, inquiries: 28, favorites: 87 }
      ]
    },
    payments: {
      totalRevenue: 127500,
      totalTransactions: 89,
      avgTransactionValue: 1432,
      paymentMethods: [
        { method: 'Visa', count: 45, amount: 65000 },
        { method: 'Mastercard', count: 28, amount: 38500 },
        { method: 'SEPA', count: 12, amount: 18000 },
        { method: 'PayPal', count: 4, amount: 6000 }
      ],
      subscriptions: [
        { plan: 'Professional Agent', active: 23, revenue: 114770 },
        { plan: 'Basic Agent', active: 45, revenue: 134550 },
        { plan: 'Premium Buyer', active: 156, revenue: 155844 },
        { plan: 'Agency', active: 8, revenue: 79920 }
      ]
    },
    realTime: {
      activeUsers: 89,
      activeSessions: 127,
      pageViewsPerMinute: 23,
      topActivePages: [
        { page: '/', activeUsers: 34 },
        { page: '/property/1', activeUsers: 18 },
        { page: '/search', activeUsers: 15 },
        { page: '/analytics', activeUsers: 12 },
        { page: '/dashboard', activeUsers: 10 }
      ]
    }
  };

  useEffect(() => {
    // Simulate data loading
    setIsLoading(true);
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
      setLastUpdate(new Date());
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]); // mockData is static constant, safe to exclude

  // Auto-refresh real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      if (data) {
        setData(prev => ({
          ...prev!,
          realTime: {
            ...prev!.realTime,
            activeUsers: Math.floor(Math.random() * 20) + 80,
            pageViewsPerMinute: Math.floor(Math.random() * 10) + 20
          }
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [data]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
      setLastUpdate(new Date());
    }, 500);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome': return Chrome;
      case 'firefox': return Firefox;
      case 'safari': return Safari;
      default: return Globe;
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You need administrator privileges to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Analytics</h1>
              <p className="text-gray-600">
                Pro•cv platform insights and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Last updated: {lastUpdate.toLocaleString()}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Real-time Active Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-green-600">
                        {data?.realTime.activeUsers}
                      </p>
                      <p className="text-xs text-gray-500">Right now</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {data?.overview.totalUsers.toLocaleString()}
                      </p>
                      <div className="flex items-center mt-1">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">+12.5%</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Page Views */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Page Views</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {data?.overview.totalPageViews.toLocaleString()}
                      </p>
                      <div className="flex items-center mt-1">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">+8.7%</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(data?.overview.totalRevenue || 0)}
                      </p>
                      <div className="flex items-center mt-1">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">+15.3%</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Tabs */}
            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-7">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="traffic">Traffic</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="realtime">Real-time</TabsTrigger>
              </TabsList>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <AdminAnalytics />
              </TabsContent>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Bounce Rate</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{data?.overview.bounceRate}%</span>
                          <ArrowDown className="h-3 w-3 text-green-500 ml-1" />
                        </div>
                      </div>
                      <Progress value={data?.overview.bounceRate} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Session Duration</span>
                        <span className="text-sm font-medium">
                          {formatDuration(data?.overview.avgSessionDuration || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{data?.overview.conversionRate}%</span>
                          <ArrowUp className="h-3 w-3 text-green-500 ml-1" />
                        </div>
                      </div>
                      <Progress value={data?.overview.conversionRate} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">New Users</span>
                        <span className="text-sm font-medium">
                          {data?.overview.newUsers.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Traffic Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data?.traffic.sources.map((source, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-600 mr-3"></div>
                              <span className="text-sm">{source.source}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{source.visitors.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">{source.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Traffic Tab */}
              <TabsContent value="traffic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Traffic Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end space-x-2">
                      {data?.traffic.daily.slice(-14).map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-600 rounded-t"
                            style={{ height: `${(day.visitors / 500) * 100}%` }}
                          ></div>
                          <div className="text-xs text-gray-500 mt-2 transform -rotate-45">
                            {new Date(day.date).getDate()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Countries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data?.users.demographics.map((country, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{country.country}</span>
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-2">
                                {country.users.toLocaleString()}
                              </span>
                              <Badge variant="outline">{country.percentage}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Device Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data?.users.devices.map((device, index) => {
                          const DeviceIcon = getDeviceIcon(device.device);
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <DeviceIcon className="h-4 w-4 mr-2" />
                                <span className="text-sm">{device.device}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">
                                  {device.users.toLocaleString()}
                                </span>
                                <Badge variant="outline">{device.percentage}%</Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Browsers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data?.users.browsers.map((browser, index) => {
                          const BrowserIcon = getBrowserIcon(browser.browser);
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <BrowserIcon className="h-4 w-4 mr-2" />
                                <span className="text-sm">{browser.browser}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">
                                  {browser.users.toLocaleString()}
                                </span>
                                <Badge variant="outline">{browser.percentage}%</Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data?.content.topPages.map((page, index) => (
                          <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium">{page.page}</div>
                                <div className="text-xs text-gray-500">
                                  Avg. time: {formatDuration(page.avgTime)} •
                                  Bounce: {page.bounceRate}%
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{page.views.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">views</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data?.content.properties.map((property, index) => (
                          <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium">{property.title}</div>
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                  <span className="flex items-center">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {property.inquiries} inquiries
                                  </span>
                                  <span className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {property.favorites} favorites
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{property.views.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">views</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(data?.payments.totalRevenue || 0)}
                          </div>
                          <div className="text-sm text-gray-600">Total Revenue</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {data?.payments.totalTransactions}
                          </div>
                          <div className="text-sm text-gray-600">Transactions</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-medium">
                          {formatCurrency(data?.payments.avgTransactionValue || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Avg. Transaction Value</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data?.payments.paymentMethods.map((method, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{method.method}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {formatCurrency(method.amount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {method.count} transactions
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {data?.payments.subscriptions.map((sub, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="text-sm font-medium">{sub.plan}</div>
                          <div className="text-2xl font-bold text-blue-600 mt-1">
                            {sub.active}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(sub.revenue)} revenue
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Real-time Tab */}
              <TabsContent value="realtime" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-green-600" />
                        Live Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold text-green-600">
                          {data?.realTime.activeUsers}
                        </div>
                        <div className="text-sm text-gray-600">Active users right now</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {data?.realTime.activeSessions}
                        </div>
                        <div className="text-sm text-gray-600">Active sessions</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-600">
                          {data?.realTime.pageViewsPerMinute}
                        </div>
                        <div className="text-sm text-gray-600">Page views per minute</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Most Active Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data?.realTime.topActivePages.map((page, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{page.page}</span>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              <span className="text-sm font-medium">{page.activeUsers}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm">Website Online</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm">Database Connected</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm">Payments Processing</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm">Chat Server Online</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-sm">AI Assistant (Demo)</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm">SSL Certificate Valid</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
