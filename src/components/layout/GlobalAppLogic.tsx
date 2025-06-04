// src/components/layout/GlobalAppLogic.tsx
"use client";

import React, { useEffect } from "react";
// import OnboardingWizard from "@/components/onboarding/OnboardingWizard"; // Comentado

export default function GlobalAppLogic() {
  useEffect(() => {
    // Logic to determine if onboarding should run
    // For example, check localStorage if the user has completed it before
    const hasCompletedOnboarding = localStorage.getItem("etfcurator_onboarding_completed");
    if (!hasCompletedOnboarding) {
      // Delay slightly to ensure page elements are loaded for Joyride targets
      // setTimeout(() => setRunOnboarding(true), 1500); // Comentado
    }
  }, []);

  return (
    <>
      {/* <OnboardingWizard run={runOnboarding} onComplete={handleOnboardingComplete} /> */}{/* Comentado */}
      {/* Other global logic components can be added here */}
    </>
  );
}

