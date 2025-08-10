import { Metadata } from 'next';
import {
  Calculator, Home, DollarSign, TrendingUp, PiggyBank,
  Percent, FileText, Target, ArrowRight, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MortgageCalculator, AffordabilityCalculator, StampDutyCalculator, InvestmentCalculator } from '@/components/CalculatorsClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Property Calculators | Cape Verde Real Estate Tools',
  description: 'Calculate mortgages, affordability, stamp duty and more with our Cape Verde property financial calculators.',
};

export default function CalculatorsPage() {
  const calculatorTools = [
    {
      id: 'mortgage',
      title: 'Mortgage Calculator',
      description: 'Calculate monthly payments and total loan costs',
      icon: Home,
      color: 'bg-blue-600',
      popular: true
    },
    {
      id: 'affordability',
      title: 'Affordability Calculator',
      description: 'Determine how much property you can afford',
      icon: DollarSign,
      color: 'bg-green-600',
      popular: true
    },
    {
      id: 'stamp-duty',
      title: 'Stamp Duty Calculator',
      description: 'Calculate property transfer taxes and fees',
      icon: FileText,
      color: 'bg-purple-600',
      popular: false
    },
    {
      id: 'investment',
      title: 'Investment Return Calculator',
      description: 'Analyze rental yields and investment returns',
      icon: TrendingUp,
      color: 'bg-orange-600',
      popular: false
    },
    {
      id: 'overpayment',
      title: 'Overpayment Calculator',
      description: 'See how extra payments reduce your mortgage',
      icon: PiggyBank,
      color: 'bg-indigo-600',
      popular: false
    },
    {
      id: 'rent-vs-buy',
      title: 'Rent vs Buy Calculator',
      description: 'Compare the costs of renting versus buying',
      icon: Target,
      color: 'bg-red-600',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Property Financial Calculators
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Make informed property decisions with our comprehensive suite of financial calculators.
              From mortgage payments to investment returns, plan your Cape Verde property journey.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {calculatorTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card key={tool.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative">
                {tool.popular && (
                  <div className="absolute -top-3 -right-3">
                    <Badge className="bg-red-600 text-white">Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className={`${tool.color} p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-gray-600 mb-4">
                    {tool.description}
                  </p>
                  <Button className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Calculator Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Tabs defaultValue="mortgage" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
              <TabsTrigger value="mortgage" className="text-sm">Mortgage</TabsTrigger>
              <TabsTrigger value="affordability" className="text-sm">Affordability</TabsTrigger>
              <TabsTrigger value="stamp-duty" className="text-sm">Stamp Duty</TabsTrigger>
              <TabsTrigger value="investment" className="text-sm">Investment</TabsTrigger>
              <TabsTrigger value="overpayment" className="text-sm">Overpayment</TabsTrigger>
              <TabsTrigger value="rent-vs-buy" className="text-sm">Rent vs Buy</TabsTrigger>
            </TabsList>

            {/* Mortgage Calculator */}
            <TabsContent value="mortgage">
              <MortgageCalculator />
            </TabsContent>

            {/* Affordability Calculator */}
            <TabsContent value="affordability">
              <AffordabilityCalculator />
            </TabsContent>

            {/* Stamp Duty Calculator */}
            <TabsContent value="stamp-duty">
              <StampDutyCalculator />
            </TabsContent>

            {/* Investment Calculator */}
            <TabsContent value="investment">
              <InvestmentCalculator />
            </TabsContent>

            {/* Overpayment Calculator */}
            <TabsContent value="overpayment">
              <OverpaymentCalculator />
            </TabsContent>

            {/* Rent vs Buy Calculator */}
            <TabsContent value="rent-vs-buy">
              <RentVsBuyCalculator />
            </TabsContent>
          </Tabs>
        </div>

        {/* Information Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                Cape Verde Banking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Understand Cape Verde banking regulations and mortgage requirements for property purchases.
              </p>
              <Button variant="outline" className="w-full">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Percent className="h-5 w-5 mr-2 text-green-600" />
                Current Interest Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fixed Rate (5 years):</span>
                  <span className="font-semibold">4.75%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Variable Rate:</span>
                  <span className="font-semibold">4.25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Investment Rate:</span>
                  <span className="font-semibold">5.25%</span>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs">
                Rates updated daily
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Property Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Access comprehensive guides on Cape Verde property buying, financing, and legal requirements.
              </p>
              <Button variant="outline" className="w-full">
                View Guides
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}





// Placeholder components for other calculators
function OverpaymentCalculator() {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Overpayment Calculator</h3>
      <p className="text-gray-600 mb-6">
        Calculate how additional mortgage payments can save you money and reduce your loan term.
      </p>
      <div className="bg-gray-100 rounded-lg p-8">
        <PiggyBank className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Calculator coming soon...</p>
      </div>
    </div>
  );
}

function RentVsBuyCalculator() {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Rent vs Buy Calculator</h3>
      <p className="text-gray-600 mb-6">
        Compare the total costs of renting versus buying to make the best financial decision.
      </p>
      <div className="bg-gray-100 rounded-lg p-8">
        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Calculator coming soon...</p>
      </div>
    </div>
  );
}
