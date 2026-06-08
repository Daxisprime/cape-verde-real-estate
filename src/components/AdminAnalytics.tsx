'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Eye, TrendingUp, DollarSign, MapPin, Clock,
  Smartphone, Monitor, Tablet, Globe, ArrowUp, ArrowDown,
  Calendar, Activity, BarChart3, PieChart, RefreshCw,
  Download, Filter, Search, AlertCircle, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TrafficData {
  overview: {
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    newVisitors: number;
    returningVisitors: number;
    conversionRate: number;
  };
  realTime: {
    activeUsers: number;
    activeSessions: number;
    pageViewsPerMinute: number;
    topActivePages: Array<{ page: string; activeUsers: number }>;
    recentActivity: Array<{
      timestamp: string;
      action: string;
      page: string;
      location: string;
      device: string;
    }>;
  };
  geography: {
    countries: Array<{ country: string; users: number; percentage: number; flag: string }>;
    cities: Array<{ city: string; country: string; users: number; percentage: number }>;
    islands: Array<{ island: string; users: number; percentage: number }>;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
    browsers: Array<{ browser: string; users: number; percentage: number }>;
    os: Array<{ os: string; users: number; percentage: number }>;
  };
  traffic: {
    hourly: Array<{ hour: string; visitors: number; pageViews: number }>;
    daily: Array<{ date: string; visitors: number; pageViews: number; revenue: number }>;
    sources: Array<{ source: string; visitors: number; percentage: number; change: number }>;
  };
  engagement: {
    topPages: Array<{ page: string; views: number; avgTime: number; bounceRate: number }>;
    searchQueries: Array<{ query: string; count: number; results: number }>;
    propertyViews: Array<{ propertyId: string; title: string; views: number; inquiries: number }>;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    subscriptions: Array<{ plan: string; count: number; revenue: number }>;
    transactions: Array<{ date: string; amount: number; type: string; user: string }>;
    projectedRevenue: number;
  };
}

export default function AdminAnalytics() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock analytics data - memoized to prevent re-creation on every render
  const mockData: TrafficData = useMemo(() => ({
    overview: {
      totalVisitors: 24789,
      uniqueVisitors: 18643,
      pageViews: 127543,
      bounceRate: 28.3,
      avgSessionDuration: 312,
      newVisitors: 15247,
      returningVisitors: 9542,
      conversionRate: 4.7
    },
    realTime: {
      activeUsers: 127,
      activeSessions: 189,
      pageViewsPerMinute: 34,
      topActivePages: [
        { page: '/', activeUsers: 45 },
        { page: '/properties', activeUsers: 28 },
        { page: '/property/luxury-villa-sal', activeUsers: 23 },
        { page: '/dashboard', activeUsers: 18 },
        { page: '/search', activeUsers: 13 }
      ],
      recentActivity: [
        { timestamp: '2024-12-25 14:32:15', action: 'Property View', page: '/property/beachfront-villa', location: 'Praia, CV', device: 'Mobile' },
        { timestamp: '2024-12-25 14:31:48', action: 'User Registration', page: '/register', location: 'Mindelo, CV', device: 'Desktop' },
        { timestamp: '2024-12-25 14:31:22', action: 'Search', page: '/search?q=villa', location: 'Lisbon, PT', device: 'Mobile' },
        { timestamp: '2024-12-25 14:30:55', action: 'Property Favorite', page: '/property/modern-apartment', location: 'Boston, US', device: 'Desktop' },
        { timestamp: '2024-12-25 14:30:33', action: 'Contact Agent', page: '/agent/maria-santos', location: 'Sal, CV', device: 'Tablet' }
      ]
    },
    geography: {
      countries: [
        { country: 'Cape Verde', users: 12456, percentage: 50.2, flag: '🇨🇻' },
        { country: 'Portugal', users: 4789, percentage: 19.3, flag: '🇵🇹' },
        { country: 'United States', users: 2847, percentage: 11.5, flag: '🇺🇸' },
        { country: 'France', users: 1923, percentage: 7.8, flag: '🇫🇷' },
        { country: 'Spain', users: 1456, percentage: 5.9, flag: '🇪🇸' },
        { country: 'Other', users: 1318, percentage: 5.3, flag: '🌍' }
      ],
      cities: [
        { city: 'Praia', country: 'Cape Verde', users: 6789, percentage: 27.4 },
        { city: 'Mindelo', country: 'Cape Verde', users: 2847, percentage: 11.5 },
        { city: 'Lisbon', country: 'Portugal', users: 2456, percentage: 9.9 },
        { city: 'Boston', country: 'United States', users: 1847, percentage: 7.4 },
        { city: 'Paris', country: 'France', users: 1234, percentage: 5.0 }
      ],
      islands: [
        { island: 'Santiago', users: 8945, percentage: 72.1 },
        { island: 'São Vicente', users: 1847, percentage: 14.8 },
        { island: 'Sal', users: 1234, percentage: 9.9 },
        { island: 'Boa Vista', users: 430, percentage: 3.2 }
      ]
    },
    devices: {
      desktop: 8945,
      mobile: 12456,
      tablet: 3388,
      browsers: [
        { browser: 'Chrome', users: 15678, percentage: 63.2 },
        { browser: 'Safari', users: 4789, percentage: 19.3 },
        { browser: 'Firefox', users: 2456, percentage: 9.9 },
        { browser: 'Edge', users: 1866, percentage: 7.6 }
      ],
      os: [
        { os: 'Android', users: 8945, percentage: 36.1 },
        { os: 'iOS', users: 6789, percentage: 27.4 },
        { os: 'Windows', users: 5678, percentage: 22.9 },
        { os: 'macOS', users: 2456, percentage: 9.9 },
        { os: 'Linux', users: 921, percentage: 3.7 }
      ]
    },
    traffic: {
      hourly: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        visitors: Math.floor(Math.random() * 300) + 100,
        pageViews: Math.floor(Math.random() * 1200) + 400
      })),
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        visitors: Math.floor(Math.random() * 800) + 400,
        pageViews: Math.floor(Math.random() * 3000) + 1500,
        revenue: Math.floor(Math.random() * 5000) + 2000
      })),
      sources: [
        { source: 'Direct', visitors: 8945, percentage: 36.1, change: +12.5 },
        { source: 'Google Search', visitors: 6789, percentage: 27.4, change: +8.3 },
        { source: 'Facebook', visitors: 3456, percentage: 13.9, change: -2.1 },
        { source: 'Instagram', visitors: 2234, percentage: 9.0, change: +15.7 },
        { source: 'LinkedIn', visitors: 1567, percentage: 6.3, change: +5.2 },
        { source: 'Other', visitors: 1798, percentage: 7.3, change: -1.8 }
      ]
    },
    engagement: {
      topPages: [
        { page: '/', views: 45678, avgTime: 234, bounceRate: 25.3 },
        { page: '/properties', views: 34567, avgTime: 456, bounceRate: 15.7 },
        { page: '/property/luxury-villa-sal', views: 23456, avgTime: 678, bounceRate: 8.9 },
        { page: '/search', views: 18934, avgTime: 345, bounceRate: 32.1 },
        { page: '/dashboard', views: 12345, avgTime: 789, bounceRate: 12.4 }
      ],
      searchQueries: [
        { query: 'villa sal', count: 2456, results: 23 },
        { query: 'apartment praia', count: 1847, results: 67 },
        { query: 'beachfront property', count: 1234, results: 15 },
        { query: 'investment property', count: 987, results: 45 },
        { query: 'luxury penthouse', count: 756, results: 8 }
      ],
      propertyViews: [
        { propertyId: '1', title: 'Luxury Beachfront Villa', views: 5678, inquiries: 89 },
        { propertyId: '2', title: 'Modern City Apartment', views: 4567, inquiries: 67 },
        { propertyId: '3', title: 'Investment Property', views: 3456, inquiries: 45 },
        { propertyId: '4', title: 'Traditional House', views: 2345, inquiries: 23 },
        { propertyId: '5', title: 'Resort Condo', views: 1234, inquiries: 12 }
      ]
    },
    revenue: {
      totalRevenue: 156789,
      monthlyRevenue: 23456,
      subscriptions: [
        { plan: 'Basic Agent', count: 45, revenue: 1350 },
        { plan: 'Professional Agent', count: 23, revenue: 1150 },
        { plan: 'Agency', count: 8, revenue: 800 },
        { plan: 'Premium Buyer', count: 156, revenue: 1560 }
      ],
      transactions: [
        { date: '2024-12-25', amount: 1250, type: 'Agent Subscription', user: 'maria@example.com' },
        { date: '2024-12-24', amount: 29.99, type: 'Premium Buyer', user: 'john@example.com' },
        { date: '2024-12-24', amount: 99.99, type: 'Agency Plan', user: 'agency@example.com' },
        { date: '2024-12-23', amount: 49.99, type: 'Professional Agent', user: 'agent@example.com' }
      ],
      projectedRevenue: 289543
    }
  }), []);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
      setLastUpdate(new Date());
    }, 1000);
  }, [timeRange, mockData]);

  // Auto-refresh real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      if (data) {
        setData(prev => ({
          ...prev!,
          realTime: {
            ...prev!.realTime,
            activeUsers: Math.floor(Math.random() * 40) + 100,
            pageViewsPerMinute: Math.floor(Math.random() * 15) + 25
          }
        }));
        setLastUpdate(new Date());
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [data]);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Cape Verde Real Estate Traffic & Performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">
                  {data?.realTime.activeUsers}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-3xl font-bold text-blue-600">
                  {data?.overview.totalVisitors.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+12.5%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-3xl font-bold text-purple-600">
                  {data?.overview.pageViews.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+8.7%</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(data?.revenue.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+15.3%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

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
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="text-2xl font-bold text-green-600">
                      {data?.realTime.activeUsers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Sessions</span>
                    <span className="text-lg font-medium">{data?.realTime.activeSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Views/Minute</span>
                    <span className="text-lg font-medium">{data?.realTime.pageViewsPerMinute}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Active Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.realTime.topActivePages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{page.page}</span>
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
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.realTime.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{activity.action}</span>
                        <Badge variant="outline" className="text-xs">{activity.device}</Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {activity.page} • {activity.location}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{activity.timestamp}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
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
                      <span className="text-sm font-medium">{source.source}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">{source.visitors.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">{source.percentage}%</span>
                      <div className={`flex items-center text-xs ${source.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {source.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {Math.abs(source.change)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.geography.countries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{country.flag}</span>
                        <span className="text-sm font-medium">{country.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{country.users.toLocaleString()}</span>
                        <Badge variant="outline">{country.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cape Verde Islands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.geography.islands.map((island, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{island.island}</span>
                        <span className="text-sm">{island.users.toLocaleString()}</span>
                      </div>
                      <Progress value={island.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      <span className="text-sm">Mobile</span>
                    </div>
                    <span className="text-sm font-medium">{data?.devices.mobile.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      <span className="text-sm">Desktop</span>
                    </div>
                    <span className="text-sm font-medium">{data?.devices.desktop.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tablet className="h-4 w-4 mr-2" />
                      <span className="text-sm">Tablet</span>
                    </div>
                    <span className="text-sm font-medium">{data?.devices.tablet.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browsers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.devices.browsers.map((browser, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{browser.browser}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{browser.users.toLocaleString()}</span>
                        <Badge variant="outline">{browser.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operating Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.devices.os.map((os, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{os.os}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{os.users.toLocaleString()}</span>
                        <Badge variant="outline">{os.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Property Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.engagement.propertyViews.map((property, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{property.title}</div>
                        <div className="text-xs text-gray-500">{property.inquiries} inquiries</div>
                      </div>
                      <span className="text-sm font-medium">{property.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Search Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.engagement.searchQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">"{query.query}"</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{query.count}</span>
                        <Badge variant="outline" className="text-xs">{query.results} results</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(data?.revenue.totalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="text-lg font-medium">
                      {formatCurrency(data?.revenue.monthlyRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Projected (Annual)</span>
                    <span className="text-lg font-medium">
                      {formatCurrency(data?.revenue.projectedRevenue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.revenue.subscriptions.map((sub, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{sub.plan}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{sub.count} users</span>
                        <Badge className="bg-green-100 text-green-800">
                          {formatCurrency(sub.revenue)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.revenue.transactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{transaction.type}</div>
                      <div className="text-xs text-gray-500">{transaction.user}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(transaction.amount)}</div>
                      <div className="text-xs text-gray-500">{transaction.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
