import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Language configuration
const languages = [
  {
    code: "en" as const,
    name: "English",
    flag: "🇺🇸",
  },
  {
    code: "hi" as const,
    name: "हिन्दी",
    flag: "🇮🇳",
  },
  {
    code: "gu" as const,
    name: "ગુજરાતી",
    flag: "🏛️",
  },
];

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage, isTranslated } = useTranslation();

  const getCurrentLanguage = () => {
    return (
      languages.find((lang) => lang.code === currentLanguage) || languages[0]
    );
  };

  const handleLanguageChange = (languageCode: any) => {
    if (languageCode === currentLanguage) return;
    setLanguage(languageCode);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Language Switcher Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">
              {getCurrentLanguage().flag} {getCurrentLanguage().name}
            </span>
            <span className="sm:hidden">{getCurrentLanguage().flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Translation Status */}
      {isTranslated && (
        <Badge variant="outline" className="text-xs">
          {getCurrentLanguage().name}
        </Badge>
      )}
    </div>
  );
}

// Hook to get current language (backward compatibility)
export function useLanguage() {
  const { currentLanguage, setLanguage, isTranslated } = useTranslation();

  return {
    currentLanguage,
    setLanguage,
    isTranslated,
  };
}
