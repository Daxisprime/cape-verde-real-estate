import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  CheckCircle,
  FileText,
  Users,
  Clock,
  Globe,
  ArrowRight,
  Key,
  Database,
  Zap,
  Building
} from 'lucide-react';
import Image from 'next/image';

export default function BlockchainPage() {
  const features = [
    {
      icon: Shield,
      title: "Property Verification",
      description: "Immutable records of property ownership and transaction history"
    },
    {
      icon: FileText,
      title: "Smart Contracts",
      description: "Automated contracts that execute when conditions are met"
    },
    {
      icon: Lock,
      title: "Secure Transactions",
      description: "Cryptographically secured property transfers and payments"
    },
    {
      icon: Database,
      title: "Transparent Records",
      description: "Public ledger of all property transactions and ownership changes"
    },
    {
      icon: Key,
      title: "Digital Identity",
      description: "Secure digital property titles and ownership certificates"
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Real-time verification of property authenticity and ownership"
    }
  ];

  const benefits = [
    {
      title: "Fraud Prevention",
      description: "Eliminate property fraud with immutable blockchain records",
      icon: Shield
    },
    {
      title: "Faster Transactions",
      description: "Complete property transfers in days, not months",
      icon: Clock
    },
    {
      title: "Reduced Costs",
      description: "Lower transaction fees with automated smart contracts",
      icon: Users
    },
    {
      title: "Global Access",
      description: "International buyers can verify properties remotely",
      icon: Globe
    }
  ];

  const process = [
    {
      step: 1,
      title: "Property Registration",
      description: "Property details and ownership are recorded on the blockchain"
    },
    {
      step: 2,
      title: "Smart Contract Creation",
      description: "Automated contract terms are programmed and deployed"
    },
    {
      step: 3,
      title: "Secure Transaction",
      description: "Buyers and sellers interact through the secure blockchain platform"
    },
    {
      step: 4,
      title: "Automatic Transfer",
      description: "Ownership transfers automatically when conditions are met"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 mr-3" />
                <Badge className="bg-white/20 text-white">PropTech Innovation</Badge>
              </div>
              <h1 className="text-5xl font-bold mb-6">
                Blockchain Property Verification
              </h1>
              <p className="text-xl mb-8">
                Revolutionary blockchain technology ensuring secure, transparent, and
                fraud-proof property transactions in Cape Verde.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>100% secure and transparent</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Fraud-proof property records</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Instant ownership verification</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  <Shield className="h-5 w-5 mr-2" />
                  Verify Property
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Blockchain Technology"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/30 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Blockchain-Powered Real Estate</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transforming property transactions with cutting-edge blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Blockchain Verification Works</h2>
            <p className="text-lg text-gray-600">
              Step-by-step process of securing property transactions on the blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < process.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-gray-400 mx-auto mt-4 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Blockchain Verification?</h2>
            <p className="text-lg text-gray-600">
              Revolutionary benefits for property buyers, sellers, and investors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Smart Contracts */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Smart Contracts for Real Estate</h2>
              <p className="text-xl mb-8">
                Automated contracts that execute themselves when predetermined conditions are met,
                eliminating the need for intermediaries and reducing transaction costs.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Automatic escrow and fund release</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Reduced legal fees and paperwork</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Faster transaction completion</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Transparent and tamper-proof</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-center">Smart Contract Features</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/20">
                  <span>Automated Payments</span>
                  <CheckCircle className="h-5 w-5 text-green-300" />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/20">
                  <span>Escrow Management</span>
                  <CheckCircle className="h-5 w-5 text-green-300" />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/20">
                  <span>Title Transfer</span>
                  <CheckCircle className="h-5 w-5 text-green-300" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <span>Condition Verification</span>
                  <CheckCircle className="h-5 w-5 text-green-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-gray-600">Fraud Prevention</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">75%</div>
              <div className="text-gray-600">Faster Transactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">50%</div>
              <div className="text-gray-600">Reduced Costs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-gray-600">Verification Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Blockchain-Verified Properties</h2>
            <p className="text-lg text-gray-600">
              Properties with complete blockchain verification and smart contract integration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Luxury Villa",
                location: "Santa Maria, Sal",
                price: "€1,200,000",
                verified: "Government Verified",
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                title: "Smart Contract Apartment",
                location: "Praia, Santiago",
                price: "€450,000",
                verified: "Blockchain Verified",
                image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                title: "Digital Title Penthouse",
                location: "Mindelo, São Vicente",
                price: "€890,000",
                verified: "Smart Contract Ready",
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              }
            ].map((property, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-600 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      {property.verified}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                  <p className="text-indigo-600 font-bold text-lg mb-3">{property.price}</p>
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    View Blockchain Record
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Secure Property Transactions?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the future of real estate with blockchain-verified properties and smart contracts
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Shield className="h-5 w-5 mr-2" />
              Verify Property
            </Button>
            <Button size="lg" variant="outline">
              <Building className="h-5 w-5 mr-2" />
              Browse Verified Properties
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
