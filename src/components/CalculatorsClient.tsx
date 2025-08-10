'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Mortgage Calculator Component
export function MortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState('300000');
  const [deposit, setDeposit] = useState('60000');
  const [loanTerm, setLoanTerm] = useState('25');
  const [interestRate, setInterestRate] = useState('4.5');

  const calculateMortgage = () => {
    const principal = parseFloat(propertyPrice) - parseFloat(deposit);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numPayments = parseFloat(loanTerm) * 12;

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                          (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - principal;

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      loanAmount: principal
    };
  };

  const results = calculateMortgage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Mortgage Calculator</h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="property-price">Property Price (€)</Label>
            <Input
              id="property-price"
              type="number"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="deposit">Deposit (€)</Label>
            <Input
              id="deposit"
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              {((parseFloat(deposit) / parseFloat(propertyPrice)) * 100).toFixed(1)}% of property price
            </p>
          </div>

          <div>
            <Label htmlFor="loan-term">Loan Term (years)</Label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 years</SelectItem>
                <SelectItem value="20">20 years</SelectItem>
                <SelectItem value="25">25 years</SelectItem>
                <SelectItem value="30">30 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="interest-rate">Interest Rate (%)</Label>
            <Input
              id="interest-rate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Monthly Payment Breakdown</h3>
        <div className="bg-blue-50 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              €{results.monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-gray-600">Monthly Payment</div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Loan Amount:</span>
              <span className="font-semibold">€{results.loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Interest:</span>
              <span className="font-semibold">€{results.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold">€{results.totalPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Get Pre-Approval
          </Button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This calculation is an estimate only</li>
            <li>• Actual rates may vary based on credit score</li>
            <li>• Additional costs may apply (insurance, fees)</li>
            <li>• Foreign buyers may have different requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Affordability Calculator Component
export function AffordabilityCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState('5000');
  const [monthlyDebts, setMonthlyDebts] = useState('800');
  const [deposit, setDeposit] = useState('50000');
  const [interestRate, setInterestRate] = useState('4.5');
  const [loanTerm, setLoanTerm] = useState('25');

  const calculateAffordability = () => {
    const availableIncome = parseFloat(monthlyIncome) - parseFloat(monthlyDebts);
    const maxMonthlyPayment = availableIncome * 0.35; // 35% debt-to-income ratio

    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numPayments = parseFloat(loanTerm) * 12;

    const maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) /
                         (monthlyRate * Math.pow(1 + monthlyRate, numPayments));

    const maxPropertyPrice = maxLoanAmount + parseFloat(deposit);

    return {
      maxMonthlyPayment,
      maxLoanAmount,
      maxPropertyPrice,
      debtToIncomeRatio: ((parseFloat(monthlyDebts) + maxMonthlyPayment) / parseFloat(monthlyIncome)) * 100
    };
  };

  const results = calculateAffordability();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Affordability Calculator</h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="monthly-income">Monthly Gross Income (€)</Label>
            <Input
              id="monthly-income"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="monthly-debts">Monthly Debt Payments (€)</Label>
            <Input
              id="monthly-debts"
              type="number"
              value={monthlyDebts}
              onChange={(e) => setMonthlyDebts(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Include credit cards, loans, other commitments
            </p>
          </div>

          <div>
            <Label htmlFor="available-deposit">Available Deposit (€)</Label>
            <Input
              id="available-deposit"
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="expected-rate">Expected Interest Rate (%)</Label>
            <Input
              id="expected-rate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="loan-term">Loan Term (years)</Label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 years</SelectItem>
                <SelectItem value="20">20 years</SelectItem>
                <SelectItem value="25">25 years</SelectItem>
                <SelectItem value="30">30 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">What You Can Afford</h3>
        <div className="bg-green-50 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              €{results.maxPropertyPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-gray-600">Maximum Property Price</div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Max Monthly Payment:</span>
              <span className="font-semibold">€{results.maxMonthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Loan Amount:</span>
              <span className="font-semibold">€{results.maxLoanAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Deposit:</span>
              <span className="font-semibold">€{parseFloat(deposit).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Debt-to-Income:</span>
              <span className="font-semibold">{results.debtToIncomeRatio.toFixed(1)}%</span>
            </div>
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700">
            Search Properties
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Affordability Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Keep debt-to-income ratio below 40%</li>
            <li>• Maintain 3-6 months emergency fund</li>
            <li>• Consider all ownership costs (maintenance, taxes)</li>
            <li>• Get pre-approved before house hunting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


// Simple placeholder calculators for now
export function StampDutyCalculator() {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Stamp Duty Calculator</h3>
      <p className="text-gray-600 mb-6">
        Calculate property transfer taxes and fees for Cape Verde.
      </p>
      <div className="bg-purple-50 rounded-lg p-8">
        <div className="text-purple-600 mb-4">Calculator Available Soon</div>
        <p className="text-gray-500">We're working on this feature...</p>
      </div>
    </div>
  );
}

export function InvestmentCalculator() {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Investment Calculator</h3>
      <p className="text-gray-600 mb-6">
        Analyze rental yields and investment returns for Cape Verde properties.
      </p>
      <div className="bg-orange-50 rounded-lg p-8">
        <div className="text-orange-600 mb-4">Calculator Available Soon</div>
        <p className="text-gray-500">We're working on this feature...</p>
      </div>
    </div>
  );
}
