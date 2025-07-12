import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dashboard | Vista",
  description: "Seu painel personalizado com insights, recomendações e métricas do mercado de ETFs em tempo real.",
  keywords: [
    "dashboard", "ETF", "painel de investimentos", "recomendações de ETFs", "métricas de mercado", "finanças", "dados em tempo real"
  ],
  openGraph: {
    title: "Dashboard | Vista",
    description: "Seu painel personalizado com insights, recomendações e métricas do mercado de ETFs em tempo real.",
    url: "https://etfcurator.com.br/dashboard",
    siteName: "Vista",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/image/visao_geral_planilha_etfs/etfcurator_og.png",
        width: 1200,
        height: 630,
        alt: "Vista - Curadoria Inteligente de ETFs",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard | Vista",
    description: "Seu painel personalizado com insights, recomendações e métricas do mercado de ETFs em tempo real.",
    images: ["/image/visao_geral_planilha_etfs/etfcurator_og.png"]
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 