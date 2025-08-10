import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js';

// Stripe configuration for demo mode
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const IS_DEMO_MODE = !STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('Example') || STRIPE_PUBLISHABLE_KEY.includes('demo');

// Only import Stripe if not in demo mode
let stripePromise: Promise<Stripe | null> | null = null;
let loadStripe: ((key: string, options?: StripeConstructorOptions) => Promise<Stripe | null>) | null = null;

if (!IS_DEMO_MODE && typeof window !== 'undefined') {
  try {
    import('@stripe/stripe-js').then((stripeModule) => {
      loadStripe = stripeModule.loadStripe;
    }).catch((error) => {
      console.warn('Stripe module not available:', error);
    });
  } catch (error) {
    console.warn('Stripe module not available:', error);
  }
}

// Initialize Stripe with proper error handling
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    if (IS_DEMO_MODE || !loadStripe) {
      console.log('🔄 Running in demo mode - Stripe features will be simulated');
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY!)
        .then((stripe: Stripe | null) => {
          if (!stripe) {
            console.warn('⚠️ Stripe failed to initialize');
          }
          return stripe;
        })
        .catch((error: Error) => {
          console.warn('⚠️ Stripe loading failed:', error);
          return null;
        });
    }
  }
  return stripePromise;
};

// Demo mode check (removed duplicate - defined at end of file)

// Subscription plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  recommended?: boolean;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic_agent',
    name: 'Basic Agent',
    description: 'Perfect for individual agents starting out',
    price: 29.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Up to 10 property listings',
      'Basic analytics',
      'Email support',
      'Mobile app access',
      'Lead capture forms'
    ]
  },
  {
    id: 'professional',
    name: 'Professional Agent',
    description: 'Advanced features for established agents',
    price: 49.99,
    currency: 'EUR',
    interval: 'month',
    popular: true,
    features: [
      'Unlimited property listings',
      'Advanced analytics & insights',
      'Priority support',
      'AI-powered valuations',
      'VR tour integration',
      'Custom branding',
      'Lead management tools'
    ]
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'Complete solution for real estate agencies',
    price: 99.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Multiple agent accounts',
      'Team collaboration tools',
      'White-label solution',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced reporting'
    ]
  },
  {
    id: 'premium_buyer',
    name: 'Premium Buyer',
    description: 'Enhanced experience for property buyers',
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Unlimited property alerts',
      'AI-powered recommendations',
      'Priority viewing slots',
      'Market insights',
      'Investment analysis tools',
      'Mortgage pre-approval assistance'
    ]
  }
];

// Property payment types
export interface PropertyPayment {
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  agentId: string;
  buyerId: string;
  paymentType: 'deposit' | 'full_payment' | 'holding_fee';
  amount: number;
  currency: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  supportedPaymentMethods: string[];
  fees?: {
    platformFee: number;
    stripeFee: number;
  };
}

// Utility functions
export const formatPrice = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100); // Convert from cents
};

export const calculatePropertyDeposit = (propertyPrice: number): number => {
  return Math.floor(propertyPrice * 0.1); // 10% deposit
};

// Demo mode utilities
export const createDemoPaymentIntent = (amount: number, currency: string): PaymentIntent => {
  return {
    id: `pi_demo_${Date.now()}`,
    clientSecret: `pi_demo_${Date.now()}_secret_demo`,
    amount,
    currency,
    status: 'requires_payment_method',
    supportedPaymentMethods: ['card', 'sepa_debit'],
    fees: {
      platformFee: Math.floor(amount * 0.025),
      stripeFee: Math.floor(amount * 0.029) + 30
    }
  };
};

export const isStripeAvailable = (): boolean => {
  return !IS_DEMO_MODE;
};

export default getStripe;
