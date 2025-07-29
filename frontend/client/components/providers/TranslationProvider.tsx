import { ReactNode } from "react";
import {
  TranslationContext,
  useTranslationState,
} from "@/lib/i18n/useTranslation";

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const translationState = useTranslationState();

  return (
    <TranslationContext.Provider value={translationState}>
      {children}
    </TranslationContext.Provider>
  );
}
