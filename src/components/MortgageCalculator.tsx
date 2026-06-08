"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Euro, TrendingUp, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MortgageCalculator() {
  const { t } = useLanguage();
  const [propertyPrice, setPropertyPrice] = useState<number>(250000);
  const [downPayment, setDownPayment] = useState<number>(50000);
  const [loanTerm, setLoanTerm] = useState<number>(25);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [currency, setCurrency] = useState<string>("EUR");
  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    loanAmount: 0,
    cveMonthlyPayment: 0
  });

  // Cape Verde Escudo to Euro exchange rate (approximate)
  const CVE_TO_EUR = 0.009;
  const EUR_TO_CVE = 110.265;

  const capeVerdeBanks = [
    { name: "Banco Comercial do Atlântico", rate: 6.5, minDown: 20 },
    { name: "Caixa Económica de Cabo Verde", rate: 7.0, minDown: 25 },
    { name: "Banco Cabo-verdiano de Negócios", rate: 6.8, minDown: 20 },
    { name: "Banco Interatlântico", rate: 6.9, minDown: 30 },
    { name: "Ecobank Cabo Verde", rate: 7.2, minDown: 25 }
  ];

  const calculateMortgage = () => {
    const loanAmount = propertyPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (loanAmount <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      setResults({
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        loanAmount: 0,
        cveMonthlyPayment: 0
      });
      return;
    }

    const monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;
    const cveMonthlyPayment = monthlyPayment * EUR_TO_CVE;

    setResults({
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      loanAmount: Math.round(loanAmount * 100) / 100,
      cveMonthlyPayment: Math.round(cveMonthlyPayment * 100) / 100
    });
  };

  useEffect(() => {
    const calculate = () => {
      const loanAmount = propertyPrice - downPayment;
      const monthlyRate = interestRate / 100 / 12;
      const numberOfPayments = loanTerm * 12;

      if (loanAmount <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
        setResults({
          monthlyPayment: 0,
          totalPayment: 0,
          totalInterest: 0,
          loanAmount: 0,
          cveMonthlyPayment: 0
        });
        return;
      }

      const monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
                            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

      const totalPayment = monthlyPayment * numberOfPayments;
      const totalInterest = totalPayment - loanAmount;
      const cveMonthlyPayment = monthlyPayment * EUR_TO_CVE;

      setResults({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        loanAmount: Math.round(loanAmount * 100) / 100,
        cveMonthlyPayment: Math.round(cveMonthlyPayment * 100) / 100
      });
    };

    calculate();
  }, [propertyPrice, downPayment, loanTerm, interestRate]);

  const downPaymentPercentage = propertyPrice > 0 ? (downPayment / propertyPrice * 100).toFixed(1) : 0;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cape Verde Mortgage Calculator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate your mortgage payments with current Cape Verde bank rates and currency options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                Mortgage Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="propertyPrice">Property Price (€)</Label>
                <Input
                  id="propertyPrice"
                  type="number"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="downPayment">
                  Down Payment (€) - {downPaymentPercentage}%
                </Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 20-30% required by Cape Verde banks
                </p>
              </div>

              <div>
                <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                <Select value={loanTerm.toString()} onValueChange={(value) => setLoanTerm(Number(value))}>
                  <SelectTrigger className="mt-1">
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
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Select value={interestRate.toString()} onValueChange={(value) => setInterestRate(Number(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {capeVerdeBanks.map((bank, index) => (
                      <SelectItem key={index} value={bank.rate.toString()}>
                        {bank.rate}% - {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Current rates from major Cape Verde banks
                </p>
              </div>

              <Button onClick={calculateMortgage} className="w-full bg-red-600 hover:bg-red-700">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Mortgage
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Mortgage Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Payment</p>
                  <p className="text-2xl font-bold text-blue-600">
                    €{results.monthlyPayment.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {results.cveMonthlyPayment.toLocaleString()} CVE
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Loan Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{results.loanAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(results.loanAmount * EUR_TO_CVE).toLocaleString()} CVE
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Interest</p>
                  <p className="text-2xl font-bold text-orange-600">
                    €{results.totalInterest.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Over {loanTerm} years
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Payment</p>
                  <p className="text-2xl font-bold text-purple-600">
                    €{results.totalPayment.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Principal + Interest
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 text-blue-600 mr-2" />
                  <h4 className="font-semibold">Important Notes</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Exchange rate: 1 EUR = {EUR_TO_CVE} CVE (approximate)</li>
                  <li>• Rates vary by bank and loan type</li>
                  <li>• Additional costs may include insurance and fees</li>
                  <li>• Non-residents may have different requirements</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button variant="outline" className="w-full">
                  <Euro className="h-4 w-4 mr-2" />
                  Get Pre-approved
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Contact Bank
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bank Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Cape Verde Banking Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capeVerdeBanks.map((bank, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{bank.name}</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Interest Rate: <span className="font-semibold text-blue-600">{bank.rate}%</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Min. Down Payment: <span className="font-semibold">{bank.minDown}%</span>
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    Contact Bank
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
