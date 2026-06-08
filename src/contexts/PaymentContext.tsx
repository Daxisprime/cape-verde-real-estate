"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  PropertyPayment,
  SubscriptionPlan,
  PaymentIntent,
  SUBSCRIPTION_PLANS,
  formatPrice,
  calculatePropertyDeposit,
  getStripe,
  isStripeAvailable,
  createDemoPaymentIntent
} from '@/utils/stripe';

// Subscription types
interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  plan: SubscriptionPlan;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionResult {
  subscription: Subscription;
  plan: SubscriptionPlan;
  success: boolean;
}

interface PaymentContextType {
  // Stripe instance
  stripe: Stripe | null;

  // Payment state
  isProcessingPayment: boolean;
  currentPaymentIntent: PaymentIntent | null;

  // Subscription state
  currentSubscription: Subscription | null;
  subscriptionPlans: SubscriptionPlan[];

  // Actions
  createPropertyPayment: (payment: PropertyPayment) => Promise<PaymentIntent>;
  createSubscription: (planId: string, paymentMethodId?: string) => Promise<SubscriptionResult>;
  cancelSubscription: (subscriptionId: string, immediately?: boolean) => Promise<{success: boolean; message: string}>;
  confirmPayment: (clientSecret: string, elements: StripeElements) => Promise<boolean>;

  // Utilities
  formatPrice: (amount: number, currency?: string) => string;
  calculateDeposit: (propertyPrice: number) => number;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentPaymentIntent, setCurrentPaymentIntent] = useState<PaymentIntent | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);

  // Initialize Stripe
  React.useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await getStripe();
        setStripe(stripeInstance);
        if (!stripeInstance) {
          console.log('🔄 Running in demo mode - payment features will be simulated');
        } else {
          console.log('✅ Stripe initialized successfully');
        }
      } catch (error) {
        console.warn('⚠️ Stripe initialization failed:', error);
        setStripe(null);
      }
    };

    initializeStripe();
  }, []);

  const loadCurrentSubscription = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/payments/subscriptions?userId=${user?.id}`);
      const data = await response.json();

      if (data.currentSubscription) {
        setCurrentSubscription(data.currentSubscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  }, [user]);

  // Load user's current subscription
  React.useEffect(() => {
    if (user) {
      loadCurrentSubscription();
    }
  }, [user, loadCurrentSubscription]);

  const createPropertyPayment = async (payment: PropertyPayment): Promise<PaymentIntent> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsProcessingPayment(true);

    try {
      // Handle demo mode
      if (!isStripeAvailable()) {
        console.log('🔄 Creating demo payment intent');
        const demoPaymentIntent = createDemoPaymentIntent(payment.amount, payment.currency);
        setCurrentPaymentIntent(demoPaymentIntent);

        toast({
          title: "Demo Payment Initialized",
          description: `Demo payment of ${formatPrice(payment.amount, payment.currency)} created (Stripe not available).`,
        });

        return demoPaymentIntent;
      }

      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: payment.amount,
          currency: payment.currency,
          propertyId: payment.propertyId,
          userId: user.id,
          paymentType: payment.paymentType,
          metadata: {
            propertyTitle: payment.propertyTitle,
            agentId: payment.agentId,
            buyerId: payment.buyerId
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment');
      }

      const paymentIntent = await response.json();
      setCurrentPaymentIntent(paymentIntent);

      toast({
        title: "Payment Initialized",
        description: `Payment of ${formatPrice(payment.amount, payment.currency)} has been prepared.`,
      });

      return paymentIntent;

    } catch (error) {
      console.error('Payment creation error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to create payment",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const createSubscription = async (planId: string, paymentMethodId?: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsProcessingPayment(true);

    try {
      const response = await fetch('/api/payments/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          paymentMethodId,
          trialDays: planId === 'professional' ? 14 : 0 // 14-day trial for professional plan
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }

      const subscription = await response.json();

      toast({
        title: "Subscription Created",
        description: `Your ${subscription.plan.name} subscription has been activated.`,
      });

      // Reload subscription data
      await loadCurrentSubscription();

      return subscription;

    } catch (error) {
      console.error('Subscription creation error:', error);
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to create subscription",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string, immediately = false) => {
    setIsProcessingPayment(true);

    try {
      const response = await fetch(
        `/api/payments/subscriptions?subscriptionId=${subscriptionId}&immediately=${immediately}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      const result = await response.json();

      toast({
        title: "Subscription Cancelled",
        description: immediately
          ? "Your subscription has been cancelled immediately."
          : "Your subscription will cancel at the end of the billing period.",
      });

      // Reload subscription data
      await loadCurrentSubscription();

      return result;

    } catch (error) {
      console.error('Subscription cancellation error:', error);
      toast({
        title: "Cancellation Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const confirmPayment = async (clientSecret: string, elements: StripeElements): Promise<boolean> => {
    if (!stripe || !user) {
      throw new Error('Stripe not initialized or user not authenticated');
    }

    setIsProcessingPayment(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          receipt_email: user.email,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });

        setCurrentPaymentIntent(null);
        return true;
      }

      return false;

    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Payment confirmation failed",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const value: PaymentContextType = {
    stripe,
    isProcessingPayment,
    currentPaymentIntent,
    currentSubscription,
    subscriptionPlans: SUBSCRIPTION_PLANS,
    createPropertyPayment,
    createSubscription,
    cancelSubscription,
    confirmPayment,
    formatPrice,
    calculateDeposit: calculatePropertyDeposit
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
