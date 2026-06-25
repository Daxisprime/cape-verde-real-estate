import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  BookOpen,
  TrendingUp,
  Users,
  Calculator,
  FileText,
  Home,
  Shield,
  ArrowRight,
  Calendar,
  Star
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdvicePage() {
  const categories = [
    {
      id: 'buying',
      title: 'Buying',
      description: 'Expert guidance for property buyers',
      icon: Home,
      color: 'blue',
      articles: 45
    },
    {
      id: 'selling',
      title: 'Selling',
      description: 'Maximize your property sale value',
      icon: TrendingUp,
      color: 'green',
      articles: 38
    },
    {
      id: 'renting',
      title: 'Renting',
      description: 'Landlord and tenant advice',
      icon: Users,
      color: 'purple',
      articles: 32
    },
    {
      id: 'finance',
      title: 'Finance',
      description: 'Mortgages and investment tips',
      icon: Calculator,
      color: 'orange',
      articles: 29
    },
    {
      id: 'legal',
      title: 'Legal',
      description: 'Property law and regulations',
      icon: Shield,
      color: 'red',
      articles: 24
    },
    {
      id: 'market',
      title: 'Market Insights',
      description: 'Cape Verde property trends',
      icon: BookOpen,
      color: 'indigo',
      articles: 41
    }
  ];

  const featuredArticles = [
    {
      id: 1,
      title: "Complete Guide to Buying Property in Cape Verde as a Foreigner",
      excerpt: "Everything international buyers need to know about purchasing real estate in Cape Verde, including legal requirements, taxes, and best practices.",
      category: "Buying",
      author: "Maria Santos",
      date: "Dec 15, 2024",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      featured: true
    },
    {
      id: 2,
      title: "Cape Verde Property Investment: Best Islands for ROI",
      excerpt: "Comprehensive analysis of investment opportunities across different Cape Verde islands, with rental yield data and growth projections.",
      category: "Market Insights",
      author: "João Fernandes",
      date: "Dec 12, 2024",
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      featured: true
    },
    {
      id: 3,
      title: "Understanding Cape Verde's New Property Tax Regulations",
      excerpt: "Recent changes to property taxation in Cape Verde and what they mean for property owners and investors.",
      category: "Legal",
      author: "Ana Pereira",
      date: "Dec 10, 2024",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      featured: true
    }
  ];

  const recentArticles = [
    {
      id: 4,
      title: "How to Get a Mortgage in Cape Verde: Step-by-Step Guide",
      excerpt: "Navigate the mortgage application process with local banks and international lenders.",
      category: "Finance",
      author: "Carlos Silva",
      date: "Dec 8, 2024",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 5,
      title: "Rental Market Trends in Sal and Santiago",
      excerpt: "Latest rental yield data and tenant preferences in Cape Verde's most popular islands.",
      category: "Renting",
      author: "Isabella Costa",
      date: "Dec 5, 2024",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 6,
      title: "Home Maintenance Tips for Cape Verde Climate",
      excerpt: "Protect your property from tropical weather with these essential maintenance practices.",
      category: "Home Owners",
      author: "Pedro Monteiro",
      date: "Dec 3, 2024",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 7,
      title: "Selling Strategies for Luxury Properties in Cape Verde",
      excerpt: "Expert tips for marketing high-end properties to international buyers.",
      category: "Selling",
      author: "Lucia Tavares",
      date: "Nov 30, 2024",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  const guides = [
    {
      title: "First-Time Buyer's Guide",
      description: "Complete guide for first-time property buyers in Cape Verde",
      steps: 8,
      duration: "30 min read"
    },
    {
      title: "Property Investment Guide",
      description: "Build wealth through Cape Verde real estate investment",
      steps: 12,
      duration: "45 min read"
    },
    {
      title: "Landlord's Handbook",
      description: "Everything you need to know about rental property management",
      steps: 10,
      duration: "35 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Property Advice & Insights
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              Expert guidance for buying, selling, renting, and investing in Cape Verde real estate
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                placeholder="Search articles, guides, and tips..."
                className="py-4 px-4 text-lg bg-white text-gray-900 pr-24"
              />
              <Button className="absolute right-2 top-2 bg-red-600 hover:bg-red-700">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Browse by Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 mb-4 rounded-lg bg-${category.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-6 w-6 text-${category.color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-gray-600 mb-3">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{category.articles} articles</span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Featured Articles</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Featured Article */}
            <div className="lg:col-span-2">
              <Card className="group hover:shadow-lg transition-shadow">
                <div className="relative h-64 lg:h-80">
                  <Image
                    src={featuredArticles[0].image}
                    alt={featuredArticles[0].title}
                    fill
                    className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white">
                      {featuredArticles[0].category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                    {featuredArticles[0].title}
                  </h3>
                  <p className="text-gray-600 mb-4">{featuredArticles[0].excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>By {featuredArticles[0].author}</span>
                      <span>{featuredArticles[0].date}</span>
                    </div>
                    <span>{featuredArticles[0].readTime}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Featured Articles */}
            <div className="space-y-6">
              {featuredArticles.slice(1).map((article) => (
                <Card key={article.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{article.author}</span>
                      <span>{article.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Guides */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Property Guides</h2>
            <p className="text-lg text-gray-600">In-depth guides covering every aspect of Cape Verde real estate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guides.map((guide, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{guide.title}</h3>
                  <p className="text-gray-600 mb-4">{guide.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{guide.steps} steps</span>
                    <span>{guide.duration}</span>
                  </div>
                  <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            <Button variant="outline">
              View All Articles
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentArticles.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative h-40">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.author}</span>
                    <span>{article.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with Property Insights
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get the latest Cape Verde property market news, expert tips, and exclusive insights delivered to your inbox
          </p>

          <div className="max-w-md mx-auto flex space-x-4">
            <Input
              placeholder="Enter your email address"
              className="bg-white text-gray-900"
            />
            <Button className="bg-red-600 hover:bg-red-700 whitespace-nowrap">
              Subscribe
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-6 mt-8 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Weekly Newsletter</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              <span>Market Updates</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Expert Tips</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
