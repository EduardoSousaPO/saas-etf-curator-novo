import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rankings de ETFs | Vista",
  description: "Veja os melhores ETFs em diferentes categorias de performance, risco, dividendos e volume. Rankings atualizados com dados reais.",
  keywords: [
    "rankings de ETFs", "melhores ETFs", "performance de ETFs", "risco de ETFs", "dividendos ETFs", "volume ETFs", "dados em tempo real"
  ],
  openGraph: {
    title: "Rankings de ETFs | Vista",
    description: "Veja os melhores ETFs em diferentes categorias de performance, risco, dividendos e volume. Rankings atualizados com dados reais.",
    url: "https://etfcurator.com.br/rankings",
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
    title: "Rankings de ETFs | Vista",
    description: "Veja os melhores ETFs em diferentes categorias de performance, risco, dividendos e volume. Rankings atualizados com dados reais.",
    images: ["/image/visao_geral_planilha_etfs/etfcurator_og.png"]
  }
};

export default function RankingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 