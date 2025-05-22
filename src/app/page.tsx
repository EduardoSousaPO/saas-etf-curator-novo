// src/app/page.tsx
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import DisclaimerBanner from "@/components/landing/DisclaimerBanner";
// import FeaturesSection from "@/components/landing/FeaturesSection"; // Placeholder for future sections
// import TestimonialsSection from "@/components/landing/TestimonialsSection"; // Placeholder
// import CallToActionSection from "@/components/landing/CallToActionSection"; // Placeholder

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#181A1B]">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        {/* Placeholder for other sections of the landing page 
        <FeaturesSection />
        <TestimonialsSection />
        <CallToActionSection />
        */}
      </main>
      <DisclaimerBanner />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">ETF Curator</h1>
        <p className="text-lg mb-6">Análise e comparação avançada de ETFs</p>
        
        {/* Adicionando botão para importar ETFs */}
        <div className="flex flex-col space-y-4 w-full max-w-md">
          <form action="/api/import-xlsx" method="post" encType="multipart/form-data" className="flex flex-col space-y-2">
            <label htmlFor="file" className="text-sm font-medium text-gray-700">
              Importar arquivo de ETFs (XLSX)
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".xlsx"
              className="px-4 py-2 border rounded-md"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Importar ETFs
            </button>
          </form>
          
          <div className="mt-4">
            <a 
              href="/sample/sample-etfs.xlsx" 
              download
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 inline-block"
            >
              Download de arquivo de exemplo
            </a>
          </div>
        </div>
        
        {/* Botões existentes */}
        <div className="flex space-x-4 mt-8">
        </div>
      </div>
    </div>
  );
}

