"use client";

import React, { useState } from 'react';
// Elements component handled conditionally
import { X, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { usePayment } from '@/contexts/PaymentContext';
import { PaymentIntent } from '@/utils/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getStripe, isStripeAvailable } from '@/utils/stripe';
import PaymentForm from './PaymentForm';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  agentId: string;
  agentName: string;
}

interface PropertyPaymentModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  paymentType: 'deposit' | 'full_payment';
}

export default function PropertyPaymentModal({
  property,
  isOpen,
  onClose,
  paymentType
}: PropertyPaymentModalProps) {
  const { user } = useAuth();
  const { formatPrice, calculateDeposit, createPropertyPayment, isProcessingPayment } = usePayment();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'overview' | 'payment'>('overview');
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  if (!isOpen) return null;

  const paymentAmount = paymentType === 'deposit'
    ? calculateDeposit(property.price * 100) // Convert to cents
    : property.price * 100; // Convert to cents

  const handleStartPayment = async () => {
    try {
      const payment = await createPropertyPayment({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        agentId: property.agentId,
        buyerId: user?.id || '',
        paymentType,
        amount: paymentAmount,
        currency: 'EUR'
      });

      setPaymentIntent(payment);
      setCurrentStep('payment');
    } catch (error) {
      console.error('Error starting payment:', error);
    }
  };

  const handlePaymentSuccess = () => {
    onClose();
    setCurrentStep('overview');
    setPaymentIntent(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {paymentType === 'deposit' ? 'Property Deposit' : 'Property Purchase'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {currentStep === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Property Details */}
            <Card>
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{property.title}</h3>
                    <p className="text-gray-600">{property.location}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {formatPrice(property.price * 100, 'EUR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Property Price:</span>
                  <span className="font-semibold">{formatPrice(property.price * 100, 'EUR')}</span>
                </div>

                {paymentType === 'deposit' && (
                  <>
                    <div className="flex justify-between text-blue-600">
                      <span>Deposit Amount (10%):</span>
                      <span className="font-semibold">{formatPrice(paymentAmount, 'EUR')}</span>
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This deposit secures your interest in the property. The remaining balance will be due upon final purchase.
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">{formatPrice(paymentAmount, 'EUR')}</span>
                </div>

                {/* Security Notice */}
                <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-green-800">Secure Payment</div>
                    <div className="text-green-700">
                      Your payment is processed securely through Stripe with industry-standard encryption.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    {paymentType === 'deposit'
                      ? 'This deposit is non-refundable but will be credited towards the final purchase price.'
                      : 'This payment represents the full purchase price of the property.'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>All payments are processed securely through Stripe.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>You will receive a payment confirmation and receipt via email.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>For questions about this transaction, contact the property agent: {property.agentName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartPayment}
                disabled={isProcessingPayment}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isProcessingPayment ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'payment' && paymentIntent && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {isStripeAvailable() ? 'Complete Your Payment' : 'Demo Payment Mode'}
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-800">Amount:</span>
                  <span className="text-xl font-bold text-blue-900">
                    {formatPrice(paymentAmount, 'EUR')}
                  </span>
                </div>
              </div>
            </div>

            {isStripeAvailable() ? (
              <div>
                <PaymentForm
                  clientSecret={paymentIntent.clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => {
                    setCurrentStep('overview');
                    setPaymentIntent(null);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2">Demo Mode Active</h4>
                  <p className="text-sm text-amber-700">
                    This is a demonstration of the payment system. In production, this would connect to Stripe for secure payment processing.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep('overview');
                      setPaymentIntent(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setTimeout(() => {
                        handlePaymentSuccess();
                        toast({
                          title: "Demo Payment Complete",
                          description: "Demo payment processed successfully!",
                        });
                      }, 1000);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Simulate Payment Success
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
