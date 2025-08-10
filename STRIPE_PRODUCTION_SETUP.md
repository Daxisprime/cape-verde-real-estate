# 💳 Stripe Live Payment Setup Guide

This guide will help you configure live Stripe payments for Visa cards and other payment methods in Cape Verde.

## 🎯 Overview

ProCV supports secure payment processing for:
- **Property transactions** (deposits, full payments)
- **Agent subscriptions** (monthly/yearly plans)
- **Premium user features**

## 💳 Supported Payment Methods

### Primary Payment Methods
- **Visa** ✅
- **Mastercard** ✅
- **American Express** ✅

### European Payment Methods (EUR transactions)
- **SEPA Direct Debit** ✅
- **iDEAL** (Netherlands) ✅
- **Bancontact** (Belgium) ✅
- **EPS** (Austria) ✅
- **Giropay** (Germany) ✅
- **Przelewy24** (Poland) ✅
- **SOFORT** (Europe) ✅

## 🔧 Stripe Account Setup

### Step 1: Create Stripe Account

1. **Sign up**: https://dashboard.stripe.com/register
2. **Choose business type**: Individual or Company
3. **Business location**: Cape Verde (CV)
4. **Business category**: Real Estate

### Step 2: Business Verification

```
Business Information Required:
✅ Business name: ProCV Real Estate Platform
✅ Business address: Your Cape Verde address
✅ Tax ID: Cape Verde tax identification
✅ Bank account: Cape Verde bank account for payouts
✅ Identity verification: Government-issued ID
```

### Step 3: Enable Live Payments

1. Complete business verification
2. Add bank account for payouts
3. Review and accept Stripe's terms
4. Activate live payments

## 🔑 API Keys Configuration

### Get Your Live API Keys

1. **Go to**: https://dashboard.stripe.com/apikeys
2. **Copy**:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### Set Environment Variables

Update your `.env.local` file:

```bash
# Live Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY_HERE

# Payment Configuration
NEXT_PUBLIC_PAYMENT_CURRENCY=EUR
NEXT_PUBLIC_PAYMENT_COUNTRY=CV
NEXT_PUBLIC_ENABLE_LIVE_PAYMENTS=true

# Supported Payment Methods
NEXT_PUBLIC_PAYMENT_METHODS=card,sepa_debit,ideal
```

### Chat Server Environment

Update `chat-server/.env.production`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

## 🔗 Webhook Configuration

### Step 1: Create Webhook Endpoint

1. **Go to**: https://dashboard.stripe.com/webhooks
2. **Add endpoint**: `https://your-domain.com/api/payments/webhook`
3. **Select events**:
   ```
   ✅ payment_intent.succeeded
   ✅ payment_intent.payment_failed
   ✅ invoice.payment_succeeded
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ```

### Step 2: Configure Webhook Secret

1. Copy webhook signing secret
2. Add to environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```

## 🌍 Cape Verde Payment Compliance

### Currency Configuration

```javascript
// Supported currencies for Cape Verde
const supportedCurrencies = {
  primary: 'EUR',     // Euro (recommended)
  secondary: 'CVE',   // Cape Verde Escudo
  international: 'USD' // US Dollar
};
```

### Tax Configuration

```javascript
// Cape Verde tax configuration
const taxConfig = {
  vatRate: 0.15,      // 15% VAT in Cape Verde
  platformFee: 0.025, // 2.5% platform fee
  stripeFee: 0.029    // 2.9% + €0.30 Stripe fee
};
```

### Regulatory Compliance

- **PCI DSS Compliance**: Automatic with Stripe
- **GDPR Compliance**: Data protection for EU customers
- **Cape Verde Banking**: Compliant with local regulations

## 💰 Payment Flow Configuration

### Property Transactions

```javascript
// Example property payment
const propertyPayment = {
  amount: 50000000,        // €500,000 in cents
  currency: 'eur',
  paymentType: 'property_deposit',
  metadata: {
    propertyId: 'prop_123',
    buyerId: 'user_456',
    agentId: 'agent_789',
    country: 'CV'
  }
};
```

### Subscription Plans

```javascript
// Agent subscription plans
const subscriptionPlans = [
  {
    id: 'basic_agent',
    name: 'Basic Agent',
    price: 2999,        // €29.99/month
    currency: 'eur',
    interval: 'month'
  },
  {
    id: 'professional_agent',
    name: 'Professional Agent',
    price: 4999,        // €49.99/month
    currency: 'eur',
    interval: 'month'
  }
];
```

## 🛡️ Security Best Practices

### API Key Security

```bash
# ❌ NEVER expose secret keys in frontend
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_...  # WRONG!

# ✅ Only publishable keys in frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # CORRECT!

# ✅ Secret keys only on server
STRIPE_SECRET_KEY=sk_live_...  # Server-side only
```

### Webhook Security

```javascript
// Always verify webhook signatures
const signature = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### Payment Validation

```javascript
// Validate payment amounts
const validatePayment = (amount, currency) => {
  // Minimum €1.00
  if (amount < 100) throw new Error('Minimum payment €1.00');

  // Maximum €50,000 (adjust as needed)
  if (amount > 5000000) throw new Error('Maximum payment €50,000');

  // Supported currencies
  const allowed = ['eur', 'cve', 'usd'];
  if (!allowed.includes(currency)) throw new Error('Currency not supported');
};
```

## 📊 Testing Live Payments

### Test Card Numbers

```javascript
// Use these ONLY in test mode
const testCards = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  declined: '4000000000000002'
};
```

### Live Testing Checklist

- [ ] ✅ **Small live payment** (€1.00)
- [ ] ✅ **Visa card payment**
- [ ] ✅ **Mastercard payment**
- [ ] ✅ **SEPA payment** (if supported)
- [ ] ✅ **Webhook delivery**
- [ ] ✅ **Payment confirmation email**
- [ ] ✅ **Database updates**

## 🚨 Common Issues & Solutions

### Issue 1: Card Declined

```
Error: Your card was declined.
Solution:
- Check card details
- Verify sufficient funds
- Contact card issuer
- Try different payment method
```

### Issue 2: Authentication Required

```
Error: Your payment requires authentication.
Solution:
- 3D Secure authentication
- Redirect user to bank
- Complete authentication flow
```

### Issue 3: Currency Not Supported

```
Error: Currency CVE not supported for this payment method.
Solution:
- Use EUR for card payments
- CVE only for local bank transfers
- USD as fallback option
```

## 💡 Optimization Tips

### Performance

```javascript
// Preload Stripe.js
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Use payment request buttons for faster checkout
const paymentRequest = stripe.paymentRequest({
  country: 'CV',
  currency: 'eur',
  total: {
    label: 'Property Deposit',
    amount: 5000000, // €50,000
  }
});
```

### User Experience

```javascript
// Show supported payment methods
const displayPaymentMethods = {
  'card': { icon: '💳', name: 'Credit/Debit Card' },
  'sepa_debit': { icon: '🏦', name: 'Bank Transfer' },
  'ideal': { icon: '🇳🇱', name: 'iDEAL' }
};
```

## 📞 Support & Resources

### Stripe Support
- **Dashboard**: https://dashboard.stripe.com
- **Documentation**: https://stripe.com/docs
- **Support**: support@stripe.com

### ProCV Support
- **Email**: payments@procv.cv
- **Documentation**: See `/docs/payments`
- **Emergency**: +238 xxx xxxx

## ✅ Go-Live Checklist

- [ ] ✅ **Stripe account verified**
- [ ] ✅ **Live API keys configured**
- [ ] ✅ **Webhooks set up**
- [ ] ✅ **Test payments successful**
- [ ] ✅ **Cape Verde compliance verified**
- [ ] ✅ **Customer support prepared**
- [ ] ✅ **Monitoring and alerts configured**

---

**🎉 Ready to accept live payments!** Your Cape Verde real estate platform can now process secure Visa payments and other international payment methods.

For technical support, contact the development team or Stripe support directly.
