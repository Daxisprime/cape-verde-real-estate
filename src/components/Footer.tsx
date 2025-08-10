"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  const islandLinks = [
    { name: "Santiago", href: "/for-sale/santiago" },
    { name: "São Vicente", href: "/for-sale/sao-vicente" },
    { name: "Sal", href: "/for-sale/sal" },
    { name: "Fogo", href: "/for-sale/fogo" },
    { name: "Boa Vista", href: "/for-sale/boa-vista" },
    { name: "Santo Antão", href: "/for-sale/santo-antao" },
    { name: "Maio", href: "/for-sale/maio" },
    { name: "São Nicolau", href: "/for-sale/sao-nicolau" },
    { name: "Brava", href: "/for-sale/brava" }
  ];

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Help Center", href: "/help" }
  ];

  const services = [
    { name: "Property Valuation", href: "/valuation" },
    { name: "Mortgage Calculator", href: "/calculator" },
    { name: "Estate Agents", href: "/agents" },
    { name: "Property Alerts", href: "/alerts" },
    { name: "Market Trends", href: "/trends" },
    { name: "Investment Guide", href: "/investment" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold tracking-wide text-blue-400">pro</span>
                <span className="mx-1 text-xl font-extrabold text-red-400">•</span>
                <span className="text-2xl font-bold tracking-wider text-blue-400">cv</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Cape Verde's premier property portal connecting properties and professionals. Find your dream home across all islands
              of Cape Verde with the most comprehensive listings and trusted real estate experts.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">info@property-cv.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">+238 xxx xxxx</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Praia, Santiago, Cape Verde</span>
              </div>
            </div>
          </div>

          {/* Property by Islands */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Property by Islands</h3>
            <ul className="space-y-2">
              {islandLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    href={service.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm mb-4 lg:mb-0">
            <p>&copy; 2025 ProCV. All rights reserved.</p>
          </div>

          {/* Social Media */}
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Youtube className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
