// src/components/layout/GlobalAppLogic.tsx
"use client";

import React, { useEffect, useState } from "react";
// import OnboardingWizard from "@/components/onboarding/OnboardingWizard"; // Comentado

export default function GlobalAppLogic() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marcar como montado para evitar problemas de hidratação
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Logic to determine if onboarding should run
    // For example, check localStorage if the user has completed it before
    try {
      const hasCompletedOnboarding = localStorage.getItem("etfcurator_onboarding_completed");
      if (!hasCompletedOnboarding) {
        // Delay slightly to ensure page elements are loaded for Joyride targets
        // setTimeout(() => setRunOnboarding(true), 1500); // Comentado
      }
    } catch (error) {
      console.warn('localStorage não disponível:', error);
    }
  }, [mounted]);

  // Não renderizar nada até estar montado
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* <OnboardingWizard run={runOnboarding} onComplete={handleOnboardingComplete} /> */}{/* Comentado */}
      {/* Other global logic components can be added here */}
    </>
  );
}

