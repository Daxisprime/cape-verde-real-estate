'use client';

import React, { useState } from 'react';
import {
  Globe, Users, Heart, TrendingUp, MessageCircle,
  Radio, Calendar, MapPin, Target, Send, Eye,
  Facebook, Instagram, Youtube, Share, Megaphone,
  Flag, Plane, Home, Camera, Music, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DiasporaMarket {
  country: string;
  flag: string;
  population: number;
  cities: string[];
  language: string;
  avgIncome: number;
  propertyInterest: 'high' | 'medium' | 'low';
  status: 'planning' | 'active' | 'paused';
  campaigns: number;
  leads: number;
}

interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  targetMarket: string;
  channel: string;
  budget: number;
  reach: number;
  clicks: number;
  leads: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
}

interface ContentPiece {
  id: string;
  title: string;
  type: 'video' | 'article' | 'social_post' | 'success_story';
  language: string;
  status: 'draft' | 'published' | 'scheduled';
  engagement: number;
  shares: number;
  leads: number;
}

export default function DiasporaMarketing() {
  const [markets, setMarkets] = useState<DiasporaMarket[]>([
    {
      country: 'Portugal',
      flag: '🇵🇹',
      population: 150000,
      cities: ['Lisbon', 'Porto', 'Amadora', 'Almada'],
      language: 'Portuguese',
      avgIncome: 45000,
      propertyInterest: 'high',
      status: 'active',
      campaigns: 3,
      leads: 127
    },
    {
      country: 'United States',
      flag: '🇺🇸',
      population: 100000,
      cities: ['Boston', 'Providence', 'New Bedford', 'Los Angeles'],
      language: 'English',
      avgIncome: 65000,
      propertyInterest: 'high',
      status: 'planning',
      campaigns: 1,
      leads: 45
    },
    {
      country: 'France',
      flag: '🇫🇷',
      population: 50000,
      cities: ['Paris', 'Lyon', 'Marseille', 'Nice'],
      language: 'French',
      avgIncome: 42000,
      propertyInterest: 'medium',
      status: 'active',
      campaigns: 2,
      leads: 68
    },
    {
      country: 'Netherlands',
      flag: '🇳🇱',
      population: 25000,
      cities: ['Rotterdam', 'Amsterdam', 'The Hague'],
      language: 'Dutch/English',
      avgIncome: 55000,
      propertyInterest: 'medium',
      status: 'planning',
      campaigns: 0,
      leads: 12
    },
    {
      country: 'Luxembourg',
      flag: '🇱🇺',
      population: 15000,
      cities: ['Luxembourg City', 'Esch-sur-Alzette'],
      language: 'Portuguese/French',
      avgIncome: 75000,
      propertyInterest: 'high',
      status: 'planning',
      campaigns: 0,
      leads: 8
    }
  ]);

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([
    {
      id: '1',
      name: 'Portugal "Volta às Origens"',
      description: 'Return to your roots - Property investment campaign',
      targetMarket: 'Portugal',
      channel: 'Facebook',
      budget: 5000,
      reach: 45000,
      clicks: 1250,
      leads: 67,
      status: 'active',
      startDate: '2024-12-01'
    },
    {
      id: '2',
      name: 'Boston Cape Verdean Community',
      description: 'WhatsApp groups and radio station partnerships',
      targetMarket: 'United States',
      channel: 'WhatsApp/Radio',
      budget: 3000,
      reach: 12000,
      clicks: 450,
      leads: 28,
      status: 'active',
      startDate: '2024-12-15'
    },
    {
      id: '3',
      name: 'Paris Investment Seminar',
      description: 'Educational events about Cape Verde property market',
      targetMarket: 'France',
      channel: 'Events',
      budget: 8000,
      reach: 500,
      clicks: 120,
      leads: 35,
      status: 'completed',
      startDate: '2024-11-20',
      endDate: '2024-11-22'
    }
  ]);

  const [content, setContent] = useState<ContentPiece[]>([
    {
      id: '1',
      title: 'Villa Dream in Sal - Success Story',
      type: 'video',
      language: 'Portuguese',
      status: 'published',
      engagement: 2400,
      shares: 156,
      leads: 23
    },
    {
      id: '2',
      title: 'Investment Guide: Buying Property in Cape Verde',
      type: 'article',
      language: 'English',
      status: 'published',
      engagement: 1800,
      shares: 89,
      leads: 45
    },
    {
      id: '3',
      title: 'From Boston to Mindelo - A Journey Home',
      type: 'success_story',
      language: 'English',
      status: 'published',
      engagement: 3200,
      shares: 234,
      leads: 67
    }
  ]);

  // Calculate total stats
  const totalPopulation = markets.reduce((sum, market) => sum + market.population, 0);
  const totalLeads = markets.reduce((sum, market) => sum + market.leads, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalReach = campaigns.reduce((sum, campaign) => sum + campaign.reach, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Globe className="h-8 w-8 mr-3 text-blue-600" />
            Diaspora Marketing
          </h2>
          <p className="text-gray-600">Connect 700,000+ Cape Verdeans worldwide with homeland properties</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-green-600 hover:bg-green-700">
            <Megaphone className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diaspora Population</p>
                <p className="text-3xl font-bold text-blue-600">{(totalPopulation / 1000).toFixed(0)}k</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-green-600">{activeCampaigns}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-3xl font-bold text-purple-600">{(totalReach / 1000).toFixed(0)}k</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generated Leads</p>
                <p className="text-3xl font-bold text-orange-600">{totalLeads}</p>
              </div>
              <Heart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="markets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="markets">Target Markets</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content Strategy</TabsTrigger>
          <TabsTrigger value="channels">Marketing Channels</TabsTrigger>
        </TabsList>

        {/* Target Markets */}
        <TabsContent value="markets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{market.flag}</span>
                      {market.country}
                    </div>
                    <Badge className={
                      market.status === 'active' ? 'bg-green-100 text-green-800' :
                      market.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {market.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Population</div>
                      <div className="font-semibold">{(market.population / 1000).toFixed(0)}k</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Avg Income</div>
                      <div className="font-semibold">€{(market.avgIncome / 1000).toFixed(0)}k</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Interest Level</div>
                      <Badge className={
                        market.propertyInterest === 'high' ? 'bg-green-100 text-green-800' :
                        market.propertyInterest === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {market.propertyInterest}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-gray-600">Language</div>
                      <div className="font-semibold">{market.language}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Major Cities</div>
                    <div className="flex flex-wrap gap-1">
                      {market.cities.map((city, cityIndex) => (
                        <Badge key={cityIndex} variant="outline" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{market.campaigns}</div>
                      <div className="text-xs text-gray-600">Campaigns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{market.leads}</div>
                      <div className="text-xs text-gray-600">Leads</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Target className="h-3 w-3 mr-1" />
                      Campaign
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <p className="text-gray-600">{campaign.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline">{campaign.channel}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Target</div>
                      <div className="font-semibold flex items-center">
                        {markets.find(m => m.country === campaign.targetMarket)?.flag}
                        <span className="ml-1">{campaign.targetMarket}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Budget</div>
                      <div className="font-semibold">€{campaign.budget.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Reach</div>
                      <div className="font-semibold">{(campaign.reach / 1000).toFixed(0)}k</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Clicks</div>
                      <div className="font-semibold">{campaign.clicks.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Leads</div>
                      <div className="font-semibold text-green-600">{campaign.leads}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Started: {campaign.startDate}
                      {campaign.endDate && ` • Ended: ${campaign.endDate}`}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Strategy */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Content Performance */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {content.map(piece => (
                      <div key={piece.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{piece.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Badge variant="outline" className="text-xs">
                                {piece.type.replace('_', ' ')}
                              </Badge>
                              <span>{piece.language}</span>
                            </div>
                          </div>
                          <Badge className={
                            piece.status === 'published' ? 'bg-green-100 text-green-800' :
                            piece.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {piece.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{piece.engagement}</div>
                            <div className="text-xs text-gray-600">Engagement</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{piece.shares}</div>
                            <div className="text-xs text-gray-600">Shares</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{piece.leads}</div>
                            <div className="text-xs text-gray-600">Leads</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Ideas */}
            <Card>
              <CardHeader>
                <CardTitle>Content Ideas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: 'video', title: 'Virtual Villa Tours', icon: Camera },
                  { type: 'article', title: 'Investment ROI Analysis', icon: TrendingUp },
                  { type: 'story', title: 'Diaspora Success Stories', icon: Heart },
                  { type: 'guide', title: 'Legal Purchase Guide', icon: Flag },
                  { type: 'music', title: 'Morna & Properties', icon: Music },
                  { type: 'event', title: 'Cultural Festival Booths', icon: Calendar }
                ].map((idea, index) => {
                  const IconComponent = idea.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <IconComponent className="h-4 w-4 mr-2 text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">{idea.title}</div>
                          <div className="text-xs text-gray-600">{idea.type}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Create
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Marketing Channels */}
        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share className="h-5 w-5 mr-2" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { platform: 'Facebook', icon: Facebook, reach: '45k', cost: '€0.15/click', status: 'active' },
                  { platform: 'Instagram', icon: Instagram, reach: '23k', cost: '€0.25/click', status: 'active' },
                  { platform: 'YouTube', icon: Youtube, reach: '12k', cost: '€0.05/view', status: 'planning' }
                ].map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <channel.icon className="h-4 w-4 mr-2 text-blue-600" />
                      <div>
                        <div className="font-medium">{channel.platform}</div>
                        <div className="text-xs text-gray-600">{channel.reach} • {channel.cost}</div>
                      </div>
                    </div>
                    <Badge className={channel.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {channel.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Community Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { channel: 'WhatsApp Groups', members: '25k', reach: 'High', cost: 'Free' },
                  { channel: 'Cape Verdean Radio', listeners: '50k', reach: 'Medium', cost: '€500/month' },
                  { channel: 'Cultural Events', attendance: '2k', reach: 'High', cost: '€1k/event' },
                  { channel: 'Diaspora Newspapers', readers: '15k', reach: 'Medium', cost: '€300/ad' }
                ].map((channel, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{channel.channel}</div>
                      <Badge variant="outline" className="text-xs">{channel.reach}</Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {channel.members || channel.listeners || channel.attendance || channel.readers} • {channel.cost}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Partnerships */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Strategic Partnerships
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { partner: 'Cape Verdean Airlines', type: 'In-flight promotions', status: 'negotiating' },
                  { partner: 'Emigrant Associations', type: 'Event sponsorships', status: 'active' },
                  { partner: 'Cape Verdean Restaurants', type: 'Local advertising', status: 'planning' },
                  { partner: 'Travel Agencies', type: 'Property tour packages', status: 'planning' }
                ].map((partnership, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{partnership.partner}</div>
                    <div className="text-xs text-gray-600 mt-1">{partnership.type}</div>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-2 ${
                        partnership.status === 'active' ? 'border-green-200 text-green-700' :
                        partnership.status === 'negotiating' ? 'border-blue-200 text-blue-700' :
                        'border-gray-200 text-gray-700'
                      }`}
                    >
                      {partnership.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Diaspora Marketing Success Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Lead Generation Goals</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Q1 2025 Target:</span>
                  <span className="font-medium">500 leads</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Progress:</span>
                  <span className="font-medium text-green-600">{totalLeads} leads</span>
                </div>
                <Progress value={(totalLeads / 500) * 100} className="h-2" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Market Penetration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Active Markets:</span>
                  <span className="font-medium">{markets.filter(m => m.status === 'active').length}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Reach:</span>
                  <span className="font-medium">{(totalReach / 1000).toFixed(0)}k people</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement Rate:</span>
                  <span className="font-medium">3.2%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Revenue Impact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Diaspora Sales:</span>
                  <span className="font-medium">€2.3M</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Purchase Value:</span>
                  <span className="font-medium">€480k</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketing ROI:</span>
                  <span className="font-medium text-green-600">340%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
