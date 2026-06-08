"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Info */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <span className="text-2xl font-bold tracking-wide text-blue-400">pro</span>
            <span className="mx-1 text-xl font-extrabold text-red-400">•</span>
            <span className="text-2xl font-bold tracking-wider text-blue-400">cv</span>
          </div>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Cape Verde's property marketplace connecting buyers, sellers, and agents across all islands.
          </p>
        </div>

        {/* Legal Policy Links - Centered Row */}
        <div className="flex justify-center items-center space-x-6 mb-6">
          <Link
            href="/terms"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Terms & Conditions
          </Link>
          <span className="text-gray-600">|</span>
          <Link
            href="/privacy"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-600">|</span>
          <Link
            href="/cookies"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cookie Policy
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <Link href="#" className="text-gray-400 hover:text-white transition-colors">
            <Facebook className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-gray-400 hover:text-white transition-colors">
            <Instagram className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-gray-400 hover:text-white transition-colors">
            <Twitter className="h-5 w-5" />
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-xs border-t border-gray-800 pt-6">
          <p>&copy; 2026 ProCV. All rights reserved. Praia, Cape Verde.</p>
        </div>
      </div>
    </footer>
  );
}
