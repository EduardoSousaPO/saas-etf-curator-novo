// Página inicial simples para debug
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-4xl font-bold mb-4">ETF Curator</h1>
      <p className="text-lg mb-6">Sistema funcionando corretamente!</p>
      
      <div className="space-y-4">
        <a 
          href="/dashboard" 
          className="block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-fit"
        >
          Ir para Dashboard
        </a>
        
        <a 
          href="/rankings" 
          className="block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-fit"
        >
          Ver Rankings
        </a>
        
        <a 
          href="/screener" 
          className="block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 w-fit"
        >
          Screener de ETFs
        </a>
      </div>
    </div>
  );
} 