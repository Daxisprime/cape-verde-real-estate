"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage, languages } = useLanguage();

  const currentLang = languages[currentLanguage];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2">
          <span className="text-lg">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(languages).map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code as keyof typeof languages)}
            className={`cursor-pointer ${
              currentLanguage === code ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="mr-3">{lang.flag}</span>
            <span>{lang.name}</span>
            {currentLanguage === code && (
              <span className="ml-auto text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
