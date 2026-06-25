"use client";

import React, { useState, useEffect } from 'react';
import { Check, Star, Crown, Building, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePayment } from '@/contexts/PaymentContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SUBSCRIPTION_PLANS } from '@/utils/stripe';

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const {
    currentSubscription,
    createSubscription,
    cancelSubscription,
    formatPrice,
    isProcessingPayment
  } = usePayment();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }

    try {
      setSelectedPlan(planId);
      await createSubscription(planId);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (currentSubscription) {
      try {
        await cancelSubscription(currentSubscription.id, false);
      } catch (error) {
        console.error('Cancellation error:', error);
      }
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Building className="h-8 w-8" />;
      case 'professional':
        return <Star className="h-8 w-8" />;
      case 'agency':
        return <Crown className="h-8 w-8" />;
      case 'premium_buyer':
        return <Zap className="h-8 w-8" />;
      default:
        return <Building className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'text-blue-600 bg-blue-100';
      case 'professional':
        return 'text-purple-600 bg-purple-100';
      case 'agency':
        return 'text-yellow-600 bg-yellow-100';
      case 'premium_buyer':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return (currentSubscription as { planId?: string })?.planId === planId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your ProCV Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full potential of Cape Verde's leading property platform with our subscription plans
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Current Subscription</h3>
                    <p className="text-blue-700">
                      You're currently on the{' '}
                      <span className="font-medium">
                        {SUBSCRIPTION_PLANS.find(p => p.id === (currentSubscription as { planId?: string })?.planId)?.name || 'Unknown'} plan
                      </span>
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      {currentSubscription.cancelAtPeriodEnd
                        ? `Cancels on ${new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString()}`
                        : `Renews on ${new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                  {!currentSubscription.cancelAtPeriodEnd && (
                    <Button
                      variant="outline"
                      onClick={handleCancelSubscription}
                      disabled={isProcessingPayment}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${(plan as { popular?: boolean }).popular ? 'border-purple-300 ring-2 ring-purple-200' : 'border-gray-200'} ${
                isCurrentPlan(plan.id) ? 'ring-2 ring-blue-300 border-blue-300' : ''
              }`}
            >
              {(plan as { popular?: boolean }).popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-3 rounded-full ${getPlanColor(plan.id)} mb-4`}>
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price, plan.currency)}
                  <span className="text-base font-normal text-gray-600">/{plan.interval}</span>
                </div>
                {plan.id === 'professional' && (
                  <p className="text-sm text-green-600 font-medium">14-day free trial</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {isCurrentPlan(plan.id) ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={!isAuthenticated || isProcessingPayment || selectedPlan === plan.id}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {selectedPlan === plan.id ? 'Processing...' :
                       !isAuthenticated ? 'Login to Subscribe' :
                       `Subscribe to ${plan.name}`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades and at the next billing cycle for downgrades.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, debit cards, and SEPA bank transfers through our secure Stripe payment processing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                Yes! The Professional Agent plan includes a 14-day free trial. No credit card required to start your trial.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely. You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Need a custom solution?
          </h3>
          <p className="text-gray-600 mb-4">
            Contact our sales team for enterprise pricing and custom integrations.
          </p>
          <Button variant="outline">
            Contact Sales
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
