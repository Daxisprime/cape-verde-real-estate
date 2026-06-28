"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { currentLanguage } = useLanguage();
  const isPt = currentLanguage === 'pt' || currentLanguage === 'cv';

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Info */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <span className="text-2xl font-bold tracking-wide text-blue-400">pro</span>
            <span className="mx-1 text-xl font-extrabold text-red-400">&bull;</span>
            <span className="text-2xl font-bold tracking-wider text-blue-400">cv</span>
          </div>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {isPt
              ? "O marketplace imobiliario de Cabo Verde conectando compradores, vendedores e agentes em todas as ilhas."
              : "Cape Verde's property marketplace connecting buyers, sellers, and agents across all islands."}
          </p>
        </div>

        {/* Legal Policy Links - Centered Row */}
        <div className="flex justify-center items-center space-x-6 mb-6">
          <Link
            href="/terms"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isPt ? "Termos de Servico" : "Terms & Conditions"}
          </Link>
          <span className="text-gray-600">|</span>
          <Link
            href="/privacy"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isPt ? "Politica de Privacidade" : "Privacy Policy"}
          </Link>
          <span className="text-gray-600">|</span>
          <Link
            href="/cookies"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isPt ? "Politica de Cookies" : "Cookie Policy"}
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
          <p>&copy; 2026 ProCV. {isPt ? "Todos os direitos reservados." : "All rights reserved."} Praia, Cape Verde.</p>
        </div>
      </div>
    </footer>
  );
}
