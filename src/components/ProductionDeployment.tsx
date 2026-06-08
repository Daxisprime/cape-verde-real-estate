'use client';

import React, { useState } from 'react';
import {
  Server, Globe, Shield, Database, Mail, CreditCard,
  CheckCircle, XCircle, Clock, AlertTriangle, Settings,
  Upload, Download, RefreshCw, Eye, Copy, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  required: boolean;
  category: 'infrastructure' | 'security' | 'services' | 'monitoring';
}

interface DeploymentConfig {
  domain: string;
  environment: 'staging' | 'production';
  region: string;
  sslEnabled: boolean;
  cdnEnabled: boolean;
  backupsEnabled: boolean;
  monitoringEnabled: boolean;
}

export default function ProductionDeployment() {
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    // Infrastructure
    {
      id: 'domain-setup',
      name: 'Domain Registration',
      description: 'Register procv.cv domain and configure DNS',
      status: 'pending',
      required: true,
      category: 'infrastructure'
    },
    {
      id: 'ssl-cert',
      name: 'SSL Certificate',
      description: 'Configure HTTPS with Let\'s Encrypt or CloudFlare',
      status: 'pending',
      required: true,
      category: 'security'
    },
    {
      id: 'cdn-setup',
      name: 'CDN Configuration',
      description: 'Global content delivery for diaspora users',
      status: 'pending',
      required: false,
      category: 'infrastructure'
    },
    {
      id: 'server-config',
      name: 'Server Configuration',
      description: 'Set up scalable cloud hosting (Vercel/Netlify/AWS)',
      status: 'pending',
      required: true,
      category: 'infrastructure'
    },

    // Database
    {
      id: 'db-migration',
      name: 'Database Migration',
      description: 'Migrate from mock data to PostgreSQL',
      status: 'pending',
      required: true,
      category: 'infrastructure'
    },
    {
      id: 'db-backups',
      name: 'Database Backups',
      description: 'Automated daily backups with point-in-time recovery',
      status: 'pending',
      required: true,
      category: 'infrastructure'
    },

    // Services
    {
      id: 'email-service',
      name: 'Email Service',
      description: 'SendGrid integration for transactional emails',
      status: 'pending',
      required: true,
      category: 'services'
    },
    {
      id: 'payment-setup',
      name: 'Payment Processing',
      description: 'Stripe integration for subscriptions and payments',
      status: 'pending',
      required: true,
      category: 'services'
    },
    {
      id: 'analytics-setup',
      name: 'Analytics Integration',
      description: 'Google Analytics and custom tracking',
      status: 'pending',
      required: false,
      category: 'monitoring'
    },

    // Security
    {
      id: 'security-headers',
      name: 'Security Headers',
      description: 'CORS, CSP, and security middleware',
      status: 'completed',
      required: true,
      category: 'security'
    },
    {
      id: 'rate-limiting',
      name: 'Rate Limiting',
      description: 'API protection and DDoS prevention',
      status: 'completed',
      required: true,
      category: 'security'
    },
    {
      id: 'env-vars',
      name: 'Environment Variables',
      description: 'Secure secrets management',
      status: 'pending',
      required: true,
      category: 'security'
    },

    // Monitoring
    {
      id: 'error-tracking',
      name: 'Error Monitoring',
      description: 'Sentry or LogRocket for error tracking',
      status: 'pending',
      required: false,
      category: 'monitoring'
    },
    {
      id: 'uptime-monitoring',
      name: 'Uptime Monitoring',
      description: 'StatusPage or Pingdom monitoring',
      status: 'pending',
      required: false,
      category: 'monitoring'
    }
  ]);

  const [config, setConfig] = useState<DeploymentConfig>({
    domain: 'procv.cv',
    environment: 'production',
    region: 'europe-west',
    sslEnabled: true,
    cdnEnabled: true,
    backupsEnabled: true,
    monitoringEnabled: true
  });

  const [isDeploying, setIsDeploying] = useState(false);

  // Calculate progress
  const completedSteps = deploymentSteps.filter(step => step.status === 'completed').length;
  const totalSteps = deploymentSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

  // Update step status
  const updateStepStatus = (stepId: string, status: DeploymentStep['status']) => {
    setDeploymentSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status } : step
    ));
  };

  // Simulate deployment step
  const runDeploymentStep = async (stepId: string) => {
    updateStepStatus(stepId, 'in-progress');

    // Simulate deployment time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));

    // 90% success rate for demo
    const success = Math.random() > 0.1;
    updateStepStatus(stepId, success ? 'completed' : 'failed');
  };

  // Run full deployment
  const runFullDeployment = async () => {
    setIsDeploying(true);

    const requiredSteps = deploymentSteps.filter(step => step.required && step.status === 'pending');

    for (const step of requiredSteps) {
      await runDeploymentStep(step.id);
    }

    setIsDeploying(false);
  };

  // Get status icon
  const getStatusIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: DeploymentStep['category']) => {
    switch (category) {
      case 'infrastructure':
        return <Server className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'services':
        return <Settings className="h-4 w-4" />;
      case 'monitoring':
        return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Globe className="h-8 w-8 mr-3 text-blue-600" />
            Production Deployment
          </h2>
          <p className="text-gray-600">Deploy ProCV to production and go live</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={progress === 100 ? 'default' : 'secondary'}>
            {Math.round(progress)}% Ready
          </Badge>
          <Button
            onClick={runFullDeployment}
            disabled={isDeploying}
            className="bg-green-600 hover:bg-green-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isDeploying ? 'Deploying...' : 'Deploy to Production'}
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalSteps}</div>
              <div className="text-sm text-gray-600">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedSteps}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {deploymentSteps.filter(s => s.status === 'in-progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {deploymentSteps.filter(s => s.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="domain">Domain</Label>
              <div className="relative mt-1">
                <Input
                  id="domain"
                  value={config.domain}
                  onChange={(e) => setConfig(prev => ({ ...prev, domain: e.target.value }))}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => navigator.clipboard.writeText(config.domain)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={config.region}
                onChange={(e) => setConfig(prev => ({ ...prev, region: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ssl">SSL/HTTPS</Label>
              <Switch
                id="ssl"
                checked={config.sslEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, sslEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="cdn">CDN</Label>
              <Switch
                id="cdn"
                checked={config.cdnEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, cdnEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="backups">Backups</Label>
              <Switch
                id="backups"
                checked={config.backupsEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, backupsEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="monitoring">Monitoring</Label>
              <Switch
                id="monitoring"
                checked={config.monitoringEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, monitoringEnabled: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Steps */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Steps</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {deploymentSteps.map(step => (
            <Card key={step.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(step.status)}
                    {getCategoryIcon(step.category)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{step.name}</span>
                        {step.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                      </div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {step.category}
                    </Badge>
                    <Button
                      onClick={() => runDeploymentStep(step.id)}
                      disabled={isDeploying || step.status === 'in-progress'}
                      variant="outline"
                      size="sm"
                    >
                      {step.status === 'in-progress' ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : step.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        'Run'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {['infrastructure', 'security', 'services', 'monitoring'].map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            {deploymentSteps
              .filter(step => step.category === category)
              .map(step => (
                <Card key={step.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(step.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{step.name}</span>
                            {step.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                          </div>
                          <div className="text-sm text-gray-600">{step.description}</div>
                        </div>
                      </div>

                      <Button
                        onClick={() => runDeploymentStep(step.id)}
                        disabled={isDeploying || step.status === 'in-progress'}
                        variant="outline"
                        size="sm"
                      >
                        {step.status === 'in-progress' ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : step.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          'Run'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Configure these environment variables in your production environment:
            </AlertDescription>
          </Alert>

          <div className="mt-4 space-y-3">
            {[
              { key: 'NEXT_PUBLIC_APP_URL', value: `https://${config.domain}`, description: 'Production URL' },
              { key: 'DATABASE_URL', value: 'postgresql://...', description: 'PostgreSQL connection string' },
              { key: 'JWT_SECRET', value: '***hidden***', description: 'JWT signing secret' },
              { key: 'SENDGRID_API_KEY', value: '***hidden***', description: 'Email service API key' },
              { key: 'STRIPE_SECRET_KEY', value: '***hidden***', description: 'Payment processing key' },
              { key: 'STRIPE_WEBHOOK_SECRET', value: '***hidden***', description: 'Stripe webhook secret' }
            ].map(env => (
              <div key={env.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-mono text-sm font-medium">{env.key}</div>
                  <div className="text-xs text-gray-600">{env.description}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{env.value}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(env.key)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Post-Deployment */}
      <Card>
        <CardHeader>
          <CardTitle>Post-Deployment Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              'Verify all pages load correctly',
              'Test authentication flows',
              'Check email delivery',
              'Test payment processing',
              'Verify analytics tracking',
              'Check mobile responsiveness',
              'Test performance and speed',
              'Verify SSL certificate',
              'Check error monitoring',
              'Test backup restoration'
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
