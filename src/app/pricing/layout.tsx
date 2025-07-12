import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Planos e Preços | Vista",
  description: "Escolha o plano ideal para seu perfil de investidor. Acesso completo às ferramentas de análise e curadoria de ETFs.",
  keywords: [
    "planos Vista", "preços", "assinatura", "premium", "investimentos", "ETFs", "análise de ETFs"
  ],
  openGraph: {
    title: "Planos e Preços | Vista",
    description: "Escolha o plano ideal para seu perfil de investidor. Acesso completo às ferramentas de análise e curadoria de ETFs.",
    url: "https://etfcurator.com.br/pricing",
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
    title: "Planos e Preços | Vista",
    description: "Escolha o plano ideal para seu perfil de investidor. Acesso completo às ferramentas de análise e curadoria de ETFs.",
    images: ["/image/visao_geral_planilha_etfs/etfcurator_og.png"]
  }
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 