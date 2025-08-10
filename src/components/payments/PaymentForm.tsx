"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import { usePayment } from '@/contexts/PaymentContext';
import { isStripeAvailable } from '@/utils/stripe';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({
  clientSecret,
  onSuccess,
  onCancel
}: PaymentFormProps) {
  const { confirmPayment, isProcessingPayment } = usePayment();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo mode form state
  const [demoForm, setDemoForm] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/28',
    cvc: '123',
    name: 'John Doe'
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isStripeAvailable()) {
      // Demo mode - simulate payment
      setIsLoading(true);
      setError(null);

      setTimeout(() => {
        onSuccess();
        setIsLoading(false);
      }, 2000);
      return;
    }

    // Real Stripe integration would go here
    setError('Real Stripe integration not configured');
  };

  const handleDemoInputChange = (field: string, value: string) => {
    setDemoForm(prev => ({ ...prev, [field]: value }));
  };

  if (!isStripeAvailable()) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
            <p className="text-sm text-amber-800 font-medium">Demo Payment Mode</p>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            This is a demonstration. Use the test card details below.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                value={demoForm.cardNumber}
                onChange={(e) => handleDemoInputChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="pl-10"
              />
              <CreditCard className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="text"
                value={demoForm.expiry}
                onChange={(e) => handleDemoInputChange('expiry', e.target.value)}
                placeholder="MM/YY"
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                type="text"
                value={demoForm.cvc}
                onChange={(e) => handleDemoInputChange('cvc', e.target.value)}
                placeholder="123"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              type="text"
              value={demoForm.name}
              onChange={(e) => handleDemoInputChange('name', e.target.value)}
              placeholder="John Doe"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Demo Payment...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Demo Payment
              </>
            )}
          </Button>
        </div>
      </form>
    );
  }

  // Real Stripe form would be rendered here
  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-600">Real Stripe integration not configured</p>
      <Button variant="outline" onClick={onCancel} className="mt-4">
        Go Back
      </Button>
    </div>
  );
}
