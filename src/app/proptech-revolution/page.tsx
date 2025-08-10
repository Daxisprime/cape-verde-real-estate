"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Monitor, Smartphone, Shield, BarChart3, Sparkles, ArrowRight,
  CheckCircle, Users, TrendingUp, Globe, Zap, Target, Star, Award,
  PlayCircle, Download, Share2, Eye, Heart, MapPin
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PropTechRevolutionPage() {
  const revolutionFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Valuation",
      description: "Machine learning algorithms provide instant property valuations with 95% accuracy",
      benefits: [
        "Instant property pricing",
        "95% accuracy rate",
        "Market trend analysis",
        "Confidence scoring"
      ],
      color: "purple"
    },
    {
      icon: Monitor,
      title: "Virtual Reality Tours",
      description: "Immersive 360° VR experiences that transport buyers anywhere in the world",
      benefits: [
        "360° virtual reality",
        "WebXR compatibility",
        "Interactive hotspots",
        "Multiple viewing modes"
      ],
      color: "pink"
    },
    {
      icon: Smartphone,
      title: "Progressive Web App",
      description: "Native mobile experience with offline capabilities and push notifications",
      benefits: [
        "Offline functionality",
        "Push notifications",
        "Native app feel",
        "Cross-platform"
      ],
      color: "blue"
    },
    {
      icon: Shield,
      title: "Blockchain Verification",
      description: "Secure property ownership verification with smart contracts and NFT certificates",
      benefits: [
        "Secure verification",
        "Smart contracts",
        "NFT certificates",
        "Transparent records"
      ],
      color: "indigo"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "AI-powered market intelligence with predictive insights and investment analysis",
      benefits: [
        "Market predictions",
        "Investment insights",
        "Performance tracking",
        "Risk assessment"
      ],
      color: "blue"
    }
  ];

  const marketStats = [
    { label: "Properties Listed", value: "2,847+", icon: MapPin },
    { label: "AI Valuations", value: "15,432+", icon: Brain },
    { label: "VR Tours Created", value: "1,284+", icon: Monitor },
    { label: "Blockchain Verified", value: "892+", icon: Shield },
    { label: "Active Users", value: "8,756+", icon: Users },
    { label: "Market Accuracy", value: "95%", icon: Target }
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Real Estate Agent",
      company: "Atlantic Properties",
      quote: "ProCV's AI valuation has transformed how we price properties. The accuracy is incredible and clients trust the technology.",
      rating: 5
    },
    {
      name: "João Silva",
      role: "Property Investor",
      company: "CV Investments",
      quote: "The blockchain verification gives me complete confidence in property ownership. Revolutionary for Cape Verde's market.",
      rating: 5
    },
    {
      name: "Ana Rodrigues",
      role: "International Buyer",
      company: "Diaspora Properties",
      quote: "VR tours let me see properties from Portugal before visiting. Saved me time and money while finding my dream home.",
      rating: 5
    }
  ];

  const industryRecognition = [
    {
      award: "PropTech Innovation Award 2024",
      organization: "Cape Verde Tech Association",
      description: "Revolutionary AI and VR integration in real estate"
    },
    {
      award: "Best Mobile Experience 2024",
      organization: "Digital Cape Verde",
      description: "Outstanding progressive web app design and functionality"
    },
    {
      award: "Blockchain Excellence Award",
      organization: "African FinTech Summit",
      description: "Leading blockchain implementation in real estate"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 mr-4" />
              <Badge className="bg-white bg-opacity-20 text-white text-lg px-6 py-2">
                Revolutionary PropTech Platform
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              The Future of
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent"> Real Estate</span>
              <br />
              is Here
            </h1>

            <p className="text-xl md:text-2xl text-purple-100 max-w-4xl mx-auto mb-12 leading-relaxed">
              ProCV leads the PropTech revolution in Cape Verde with AI-powered valuations, VR tours,
              blockchain verification, and advanced analytics. Experience the most advanced real estate platform in Africa.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/ai-valuation">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
                  <Brain className="h-6 w-6 mr-3" />
                  Try AI Valuation
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </Link>

              <Link href="/vr-tours">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg">
                  <PlayCircle className="h-6 w-6 mr-3" />
                  Watch VR Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mt-16">
              {marketStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <IconComponent className="h-8 w-8 mx-auto mb-2 text-purple-200" />
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-purple-200">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Revolutionary PropTech Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each feature represents a breakthrough in real estate technology, powered by cutting-edge AI,
              blockchain, and immersive technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {revolutionFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-0">
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${
                    feature.color === 'purple' ? 'from-purple-500 to-blue-500' :
                    feature.color === 'pink' ? 'from-purple-500 to-pink-500' :
                    feature.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                    feature.color === 'indigo' ? 'from-purple-500 to-indigo-500' :
                    'from-blue-500 to-purple-500'
                  }`} />

                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                      feature.color === 'purple' ? 'bg-purple-100' :
                      feature.color === 'pink' ? 'bg-pink-100' :
                      feature.color === 'blue' ? 'bg-blue-100' :
                      feature.color === 'indigo' ? 'bg-indigo-100' :
                      'bg-blue-100'
                    }`}>
                      <IconComponent className={`h-8 w-8 ${
                        feature.color === 'purple' ? 'text-purple-600' :
                        feature.color === 'pink' ? 'text-pink-600' :
                        feature.color === 'blue' ? 'text-blue-600' :
                        feature.color === 'indigo' ? 'text-indigo-600' :
                        'text-blue-600'
                      }`} />
                    </div>

                    <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </CardTitle>

                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      <Button className={`w-full ${
                        feature.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                        feature.color === 'pink' ? 'bg-pink-600 hover:bg-pink-700' :
                        feature.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                        feature.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :
                        'bg-blue-600 hover:bg-blue-700'
                      }`}>
                        Explore Feature
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industry Recognition */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Award className="h-16 w-16 mx-auto text-yellow-600 mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Industry Recognition</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our revolutionary PropTech platform has been recognized by leading industry organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industryRecognition.map((award, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <Star className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{award.award}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{award.organization}</p>
                  <p className="text-gray-600">{award.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from real estate professionals and clients who are using our revolutionary platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-gray-700 italic mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>

                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="h-16 w-16 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Join the PropTech Revolution
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-12 leading-relaxed">
            Be part of the future of real estate. Experience the most advanced PropTech platform
            in Cape Verde and discover why thousands of users trust ProCV.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/ai-valuation">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
                <Brain className="h-6 w-6 mr-3" />
                Start Free AI Valuation
              </Button>
            </Link>

            <Link href="/mobile-app">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg">
                <Download className="h-6 w-6 mr-3" />
                Get Mobile App
              </Button>
            </Link>

            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg">
              <Share2 className="h-6 w-6 mr-3" />
              Share with Friends
            </Button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-purple-200">
              No credit card required • Full access to all PropTech features • 24/7 support
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
