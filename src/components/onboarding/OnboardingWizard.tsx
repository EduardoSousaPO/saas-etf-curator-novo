// src/components/onboarding/OnboardingWizard.tsx
"use client";

import React, { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface OnboardingWizardProps {
  run: boolean;
  onComplete: () => void;
}

// Define your onboarding steps
// These selectors will need to match elements in your application
// For now, using placeholder selectors. These should be updated when the actual UI elements are in place.
const TOUR_STEPS: Step[] = [
  {
    target: "body", // General welcome
    content: "Bem-vindo ao ETFCurator! Vamos fazer um tour rápido pelas principais funcionalidades.",
    placement: "center",
    title: "Bem-vindo!",
  },
  {
    target: ".navbar-screener-link", // Placeholder: Needs actual selector for Screener nav link
    content: "Aqui você encontra o Screener, uma ferramenta poderosa para filtrar ETFs com base em diversos critérios.",
    title: "Screener de ETFs",
  },
  {
    target: ".navbar-rankings-link", // Placeholder: Needs actual selector for Rankings nav link
    content: "Explore os Rankings para ver os Top 10 ETFs em diferentes métricas de desempenho e características.",
    title: "Rankings de ETFs",
  },
  {
    target: ".navbar-comparator-link", // Placeholder: Needs actual selector for Comparator nav link
    content: "Use o Comparador para analisar até 4 ETFs lado a lado, com tabelas, gráficos e insights.",
    title: "Comparador de ETFs",
  },
  {
    target: ".theme-toggle-button", // Placeholder: Needs actual selector for Theme Toggle button
    content: "Você pode alternar entre os modos claro e escuro aqui para melhor visualização.",
    title: "Modo Claro/Escuro",
  },
  {
    target: "body",
    content: "Exploração concluída! Agora você está pronto para descobrir o melhor do ETFCurator.",
    placement: "center",
    title: "Tour Finalizado!",
  },
];

export default function OnboardingWizard({ run, onComplete }: OnboardingWizardProps) {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onComplete();
    }

    // You can log types to see how the tour progresses
    // console.log("Joyride callback type:", type, "status:", status);
  };

  if (!isMounted) {
    return null; // Joyride needs to be mounted on client
  }

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      // Styling to match the Tesla-like theme
      styles={{
        options: {
          arrowColor: theme === "dark" ? "#181A1B" : "#FFFFFF",
          backgroundColor: theme === "dark" ? "#181A1B" : "#FFFFFF",
          overlayColor: "rgba(0, 0, 0, 0.6)",
          primaryColor: "#E82127", // Tesla Red
          textColor: theme === "dark" ? "#F2F2F2" : "#1A1A1A",
          zIndex: 1000,
        },
        buttonNext: {
          backgroundColor: "#E82127",
          color: "#FFFFFF",
          borderRadius: "0.375rem",
        },
        buttonBack: {
          color: theme === "dark" ? "#F2F2F2" : "#1A1A1A",
          borderRadius: "0.375rem",
        },
        buttonSkip: {
          color: theme === "dark" ? "#F2F2F2" : "#1A1A1A",
          borderRadius: "0.375rem",
        },
        tooltip: {
          padding: 20,
          borderRadius: "0.5rem",
        },
        tooltipTitle: {
          margin: 0,
          paddingBottom: 10,
          fontWeight: "bold",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular Tour",
      }}
    />
  );
}

