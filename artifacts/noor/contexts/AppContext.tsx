import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "ar" | "fr" | "tr";
export type CalculationMethodName =
  | "MWL"
  | "ISNA"
  | "Egypt"
  | "Makkah"
  | "Karachi"
  | "Gulf"
  | "Kuwait"
  | "Qatar"
  | "Singapore"
  | "France"
  | "Turkey";
export type Madhab = "shafi" | "hanafi";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  calculationMethod: CalculationMethodName;
  setCalculationMethod: (method: CalculationMethodName) => void;
  madhab: Madhab;
  setMadhab: (madhab: Madhab) => void;
  isRTL: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [calculationMethod, setCalculationMethodState] =
    useState<CalculationMethodName>("MWL");
  const [madhab, setMadhabState] = useState<Madhab>("shafi");

  useEffect(() => {
    AsyncStorage.multiGet(["language", "calculationMethod", "madhab"]).then(
      (results) => {
        const lang = results[0][1];
        const method = results[1][1];
        const madh = results[2][1];
        if (lang) setLanguageState(lang as Language);
        if (method) setCalculationMethodState(method as CalculationMethodName);
        if (madh) setMadhabState(madh as Madhab);
      }
    );
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem("language", lang);
  };

  const setCalculationMethod = (method: CalculationMethodName) => {
    setCalculationMethodState(method);
    AsyncStorage.setItem("calculationMethod", method);
  };

  const setMadhab = (madh: Madhab) => {
    setMadhabState(madh);
    AsyncStorage.setItem("madhab", madh);
  };

  const isRTL = language === "ar";

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        calculationMethod,
        setCalculationMethod,
        madhab,
        setMadhab,
        isRTL,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
