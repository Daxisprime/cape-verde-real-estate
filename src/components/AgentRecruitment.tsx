'use client';

import React, { useState } from 'react';
import {
  Users, MapPin, Phone, Mail, Star, TrendingUp,
  CheckCircle, Clock, Send, Download, Upload,
  Building, Award, Target, Globe, MessageCircle,
  Calendar, FileText, DollarSign, UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Agent {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  island: string;
  experience: number;
  propertiesSold: number;
  avgPrice: number;
  status: 'prospect' | 'contacted' | 'interested' | 'onboarding' | 'active';
  lastContact?: string;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecruitmentCampaign {
  id: string;
  name: string;
  description: string;
  targetIsland: string;
  targetAgents: number;
  recruited: number;
  status: 'planning' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
}

export default function AgentRecruitment() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Maria Santos',
      company: 'Atlantic Real Estate',
      email: 'maria@atlanticre.cv',
      phone: '+238 123 4567',
      island: 'Santiago',
      experience: 8,
      propertiesSold: 156,
      avgPrice: 450000,
      status: 'active',
      lastContact: '2024-12-20',
      priority: 'high'
    },
    {
      id: '2',
      name: 'João Pereira',
      company: 'Cape Verde Properties',
      email: 'joao@cvproperties.cv',
      phone: '+238 234 5678',
      island: 'Sal',
      experience: 12,
      propertiesSold: 234,
      avgPrice: 680000,
      status: 'prospect',
      priority: 'high'
    },
    {
      id: '3',
      name: 'Ana Silva',
      company: 'Island Properties CV',
      email: 'ana@islandpropertiescv.cv',
      phone: '+238 345 6789',
      island: 'São Vicente',
      experience: 5,
      propertiesSold: 89,
      avgPrice: 320000,
      status: 'contacted',
      lastContact: '2024-12-18',
      priority: 'medium'
    }
  ]);

  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([
    {
      id: '1',
      name: 'Santiago Launch Campaign',
      description: 'Recruit top 50 agents in Praia and surrounding areas',
      targetIsland: 'Santiago',
      targetAgents: 50,
      recruited: 12,
      status: 'active',
      startDate: '2024-12-01'
    },
    {
      id: '2',
      name: 'Sal Tourism Hub',
      description: 'Focus on agents serving international buyers',
      targetIsland: 'Sal',
      targetAgents: 25,
      recruited: 8,
      status: 'active',
      startDate: '2024-12-15'
    }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [newAgent, setNewAgent] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    island: '',
    experience: '',
    notes: ''
  });

  // Update agent status
  const updateAgentStatus = (agentId: string, status: Agent['status']) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId
        ? { ...agent, status, lastContact: new Date().toISOString().split('T')[0] }
        : agent
    ));
  };

  // Add new agent
  const addAgent = () => {
    if (!newAgent.name || !newAgent.email) return;

    const agent: Agent = {
      id: Date.now().toString(),
      name: newAgent.name,
      company: newAgent.company,
      email: newAgent.email,
      phone: newAgent.phone,
      island: newAgent.island,
      experience: parseInt(newAgent.experience) || 0,
      propertiesSold: 0,
      avgPrice: 0,
      status: 'prospect',
      notes: newAgent.notes,
      priority: 'medium'
    };

    setAgents(prev => [...prev, agent]);
    setNewAgent({
      name: '',
      company: '',
      email: '',
      phone: '',
      island: '',
      experience: '',
      notes: ''
    });
  };

  // Get status color
  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'onboarding': return 'bg-blue-100 text-blue-800';
      case 'interested': return 'bg-orange-100 text-orange-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Agent['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate recruitment stats
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const prospectAgents = agents.filter(a => a.status === 'prospect').length;
  const onboardingAgents = agents.filter(a => a.status === 'onboarding').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Agent Recruitment
          </h2>
          <p className="text-gray-600">Build Cape Verde's premier real estate agent network</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agents</p>
                <p className="text-3xl font-bold text-gray-900">{totalAgents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-3xl font-bold text-green-600">{activeAgents}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prospects</p>
                <p className="text-3xl font-bold text-orange-600">{prospectAgents}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onboarding</p>
                <p className="text-3xl font-bold text-blue-600">{onboardingAgents}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Agent Database</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="outreach">Outreach Tools</TabsTrigger>
          <TabsTrigger value="training">Training Materials</TabsTrigger>
        </TabsList>

        {/* Agent Database */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Directory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agents.map(agent => (
                      <div
                        key={agent.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAgent?.id === agent.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                            <p className="text-sm text-gray-600">{agent.company}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(agent.priority)}>
                              {agent.priority}
                            </Badge>
                            <Badge className={getStatusColor(agent.status)}>
                              {agent.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {agent.island}
                          </div>
                          <div className="flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            {agent.experience} years
                          </div>
                          <div className="flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {agent.propertiesSold} sold
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            €{(agent.avgPrice / 1000).toFixed(0)}k avg
                          </div>
                        </div>

                        {agent.lastContact && (
                          <div className="mt-2 text-xs text-gray-500">
                            Last contact: {agent.lastContact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agent Details / Add Form */}
            <div>
              {selectedAgent ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedAgent.name}</h3>
                      <p className="text-gray-600">{selectedAgent.company}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{selectedAgent.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{selectedAgent.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{selectedAgent.island}</span>
                      </div>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Select
                        value={selectedAgent.status}
                        onValueChange={(value: Agent['status']) => updateAgentStatus(selectedAgent.id, value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button className="w-full" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Call
                      </Button>
                    </div>

                    {selectedAgent.notes && (
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={selectedAgent.notes}
                          readOnly
                          className="mt-1 text-sm"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Agent Name</Label>
                      <Input
                        id="name"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newAgent.company}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Real estate company"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newAgent.email}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="agent@example.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newAgent.phone}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+238 123 456 789"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="island">Island</Label>
                      <Select
                        value={newAgent.island}
                        onValueChange={(value) => setNewAgent(prev => ({ ...prev, island: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select island" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Santiago">Santiago</SelectItem>
                          <SelectItem value="Sal">Sal</SelectItem>
                          <SelectItem value="São Vicente">São Vicente</SelectItem>
                          <SelectItem value="Boa Vista">Boa Vista</SelectItem>
                          <SelectItem value="Santo Antão">Santo Antão</SelectItem>
                          <SelectItem value="Fogo">Fogo</SelectItem>
                          <SelectItem value="Maio">Maio</SelectItem>
                          <SelectItem value="Brava">Brava</SelectItem>
                          <SelectItem value="São Nicolau">São Nicolau</SelectItem>
                          <SelectItem value="Santa Luzia">Santa Luzia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={newAgent.experience}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="5"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newAgent.notes}
                        onChange={(e) => setNewAgent(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional information..."
                        className="mt-1"
                      />
                    </div>

                    <Button onClick={addAgent} className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Agent
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Recruitment Campaigns */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map(campaign => (
              <Card key={campaign.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {campaign.name}
                    <Badge className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {campaign.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-gray-600">{campaign.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{campaign.recruited}/{campaign.targetAgents} agents</span>
                    </div>
                    <Progress value={(campaign.recruited / campaign.targetAgents) * 100} />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Target Island</div>
                        <div className="font-medium">{campaign.targetIsland}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Start Date</div>
                        <div className="font-medium">{campaign.startDate}</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit Campaign
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Outreach Tools */}
        <TabsContent value="outreach" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Initial Outreach', description: 'First contact with prospective agents' },
                  { name: 'Follow-up', description: 'Second touchpoint for interested agents' },
                  { name: 'Demo Invitation', description: 'Invite to platform demonstration' },
                  { name: 'Onboarding Welcome', description: 'Welcome new agents to the platform' }
                ].map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Bulk Email Campaign
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Broadcast
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Demo Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training Materials */}
        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Platform Overview',
                description: 'Introduction to ProCV features and benefits',
                type: 'Video',
                duration: '15 min'
              },
              {
                title: 'Getting Started Guide',
                description: 'Step-by-step onboarding for new agents',
                type: 'PDF',
                duration: '8 pages'
              },
              {
                title: 'Lead Management',
                description: 'How to manage and convert leads effectively',
                type: 'Video',
                duration: '12 min'
              },
              {
                title: 'Analytics Dashboard',
                description: 'Understanding your performance metrics',
                type: 'Interactive',
                duration: '10 min'
              },
              {
                title: 'Marketing Tools',
                description: 'Using social media and listing promotion',
                type: 'PDF',
                duration: '12 pages'
              },
              {
                title: 'Success Stories',
                description: 'Case studies from top-performing agents',
                type: 'Video',
                duration: '20 min'
              }
            ].map((material, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">{material.title}</h3>
                      <p className="text-sm text-gray-600">{material.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{material.type}</Badge>
                      <span className="text-xs text-gray-500">{material.duration}</span>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-3 w-3 mr-2" />
                      Access Material
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
