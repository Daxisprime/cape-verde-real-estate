"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, MessageSquare, Eye, Clock, TrendingUp,
  TrendingDown, Activity, MapPin, Heart, Search, Bot
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalProperties: number;
    totalViews: number;
    chatSessions: number;
    aiInteractions: number;
  };
  userEngagement: {
    averageSessionTime: string;
    bounceRate: number;
    returnUserRate: number;
    mobileUsers: number;
    desktopUsers: number;
  };
  chatAnalytics: {
    totalMessages: number;
    averageResponseTime: string;
    agentSatisfactionScore: number;
    aiSatisfactionScore: number;
    humanVsAI: {
      human: number;
      ai: number;
    };
    topQuestions: Array<{
      question: string;
      count: number;
    }>;
  };
  propertyAnalytics: {
    topViewedProperties: Array<{
      id: string;
      title: string;
      views: number;
      inquiries: number;
      location: string;
    }>;
    searchTrends: Array<{
      term: string;
      count: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    conversionRate: number;
  };
  realtimeMetrics: {
    onlineUsers: number;
    activeChatSessions: number;
    newInquiries: number;
    serverLoad: number;
  };
}

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch real analytics data
      // For demo, we'll use mock data
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 2847,
          activeUsers: 567,
          totalProperties: 1243,
          totalViews: 15623,
          chatSessions: 342,
          aiInteractions: 1289
        },
        userEngagement: {
          averageSessionTime: '4m 32s',
          bounceRate: 23,
          returnUserRate: 67,
          mobileUsers: 68,
          desktopUsers: 32
        },
        chatAnalytics: {
          totalMessages: 2156,
          averageResponseTime: '1m 24s',
          agentSatisfactionScore: 4.6,
          aiSatisfactionScore: 4.3,
          humanVsAI: {
            human: 35,
            ai: 65
          },
          topQuestions: [
            { question: 'Property prices in Santiago', count: 89 },
            { question: 'Beachfront villas availability', count: 67 },
            { question: 'Mortgage options for foreigners', count: 54 },
            { question: 'Best neighborhoods in Sal', count: 43 },
            { question: 'Investment opportunities', count: 38 }
          ]
        },
        propertyAnalytics: {
          topViewedProperties: [
            { id: '1', title: 'Modern Beachfront Villa', views: 234, inquiries: 23, location: 'Santa Maria, Sal' },
            { id: '2', title: 'Smart City Apartment', views: 189, inquiries: 18, location: 'Praia, Santiago' },
            { id: '3', title: 'Luxury Ocean Penthouse', views: 167, inquiries: 15, location: 'Mindelo, São Vicente' },
            { id: '4', title: 'Eco-Smart House', views: 145, inquiries: 12, location: 'Ribeira Grande, Santo Antão' },
            { id: '5', title: 'Resort Condo', views: 134, inquiries: 11, location: 'Sal Rei, Boa Vista' }
          ],
          searchTrends: [
            { term: 'beachfront villa', count: 156, trend: 'up' },
            { term: 'apartment santiago', count: 134, trend: 'up' },
            { term: 'investment property', count: 98, trend: 'stable' },
            { term: 'luxury penthouse', count: 87, trend: 'down' },
            { term: 'vacation rental', count: 76, trend: 'up' }
          ],
          conversionRate: 12.4
        },
        realtimeMetrics: {
          onlineUsers: 89,
          activeChatSessions: 23,
          newInquiries: 7,
          serverLoad: 34
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return <div className={`p-6 ${className}`}>Error loading analytics data</div>;
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights into user engagement and platform performance</p>
        </div>
        <div className="flex items-center space-x-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedTimeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Metrics Bar */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{analyticsData.realtimeMetrics.onlineUsers}</div>
              <div className="text-sm opacity-90">Users Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analyticsData.realtimeMetrics.activeChatSessions}</div>
              <div className="text-sm opacity-90">Active Chats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analyticsData.realtimeMetrics.newInquiries}</div>
              <div className="text-sm opacity-90">New Inquiries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analyticsData.realtimeMetrics.serverLoad}%</div>
              <div className="text-sm opacity-90">Server Load</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{analyticsData.overview.activeUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{analyticsData.overview.totalProperties.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Properties</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Property Views</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{analyticsData.overview.chatSessions.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Chat Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-indigo-600" />
              <div>
                <div className="text-2xl font-bold">{analyticsData.overview.aiInteractions.toLocaleString()}</div>
                <div className="text-sm text-gray-500">AI Interactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="chat">Chat Analytics</TabsTrigger>
          <TabsTrigger value="properties">Property Performance</TabsTrigger>
          <TabsTrigger value="trends">Search Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Session Time</span>
                  <Badge variant="outline">{analyticsData.userEngagement.averageSessionTime}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Bounce Rate</span>
                    <span>{analyticsData.userEngagement.bounceRate}%</span>
                  </div>
                  <Progress value={analyticsData.userEngagement.bounceRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Return User Rate</span>
                    <span>{analyticsData.userEngagement.returnUserRate}%</span>
                  </div>
                  <Progress value={analyticsData.userEngagement.returnUserRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Mobile Users</span>
                    <span>{analyticsData.userEngagement.mobileUsers}%</span>
                  </div>
                  <Progress value={analyticsData.userEngagement.mobileUsers} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Desktop Users</span>
                    <span>{analyticsData.userEngagement.desktopUsers}%</span>
                  </div>
                  <Progress value={analyticsData.userEngagement.desktopUsers} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chat Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Messages</span>
                  <Badge>{analyticsData.chatAnalytics.totalMessages.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Response Time</span>
                  <Badge variant="outline">{analyticsData.chatAnalytics.averageResponseTime}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Agent Satisfaction</span>
                    <span>{analyticsData.chatAnalytics.agentSatisfactionScore}/5.0</span>
                  </div>
                  <Progress value={analyticsData.chatAnalytics.agentSatisfactionScore * 20} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>AI Satisfaction</span>
                    <span>{analyticsData.chatAnalytics.aiSatisfactionScore}/5.0</span>
                  </div>
                  <Progress value={analyticsData.chatAnalytics.aiSatisfactionScore * 20} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Human vs AI Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Human Agents</span>
                    <span>{analyticsData.chatAnalytics.humanVsAI.human}%</span>
                  </div>
                  <Progress value={analyticsData.chatAnalytics.humanVsAI.human} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>AI Assistant</span>
                    <span>{analyticsData.chatAnalytics.humanVsAI.ai}%</span>
                  </div>
                  <Progress value={analyticsData.chatAnalytics.humanVsAI.ai} className="h-2" />
                </div>
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Top Questions</h4>
                  {analyticsData.chatAnalytics.topQuestions.slice(0, 3).map((q, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="truncate">{q.question}</span>
                      <Badge variant="secondary">{q.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.propertyAnalytics.topViewedProperties.map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{property.views} views</div>
                      <div className="text-sm text-gray-500">{property.inquiries} inquiries</div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Overall Conversion Rate</span>
                    <Badge className="bg-blue-600">{analyticsData.propertyAnalytics.conversionRate}%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.propertyAnalytics.searchTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{trend.term}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{trend.count} searches</Badge>
                      {trend.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {trend.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      {trend.trend === 'stable' && <div className="h-4 w-4 bg-gray-300 rounded-full" />}
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
