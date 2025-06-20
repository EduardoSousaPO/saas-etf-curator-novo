// src/components/layout/ThemeProvider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: any;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // Evitar hidratação até o componente estar montado no cliente
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Renderizar versão básica no servidor
    return <div suppressHydrationWarning>{children}</div>;
  }

  // Renderizar versão completa no cliente
  return (
    <NextThemesProvider {...props} suppressHydrationWarning>
      {children}
    </NextThemesProvider>
  );
}

