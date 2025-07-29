import { createContext, useContext, useState, useEffect } from "react";
import { translations, TranslationKey, LanguageCode } from "./translations";

interface TranslationContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  isTranslated: boolean;
}

export const TranslationContext = createContext<TranslationContextType | null>(
  null,
);

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    // Return default implementation if context is not available
    return {
      currentLanguage: "en" as LanguageCode,
      setLanguage: () => {},
      t: (key: TranslationKey) => key,
      isTranslated: false,
    };
  }
  return context;
}

export function useTranslationState() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem(
      "preferred_language",
    ) as LanguageCode;
    if (storedLanguage && translations[storedLanguage]) {
      setCurrentLanguage(storedLanguage);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    localStorage.setItem("preferred_language", lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return {
    currentLanguage,
    setLanguage,
    t,
    isTranslated: currentLanguage !== "en",
  };
}
