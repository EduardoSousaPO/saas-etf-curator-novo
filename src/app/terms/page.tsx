// src/app/terms/page.tsx
import Navbar from "@/components/layout/Navbar";
import DisclaimerBanner from "@/components/landing/DisclaimerBanner";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#181A1B]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#1A1A1A] dark:text-white">Termos de Serviço</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <p>Última atualização: 14 de Maio de 2025</p>
          
          <p>Bem-vindo ao ETFCurator!</p>

          <p>Estes termos e condições descrevem as regras e regulamentos para o uso do website ETFCurator, localizado em [SEU_DOMINIO.COM].</p>

          <p>Ao acessar este website, presumimos que você aceita estes termos e condições. Não continue a usar o ETFCurator se você não concordar com todos os termos e condições declarados nesta página.</p>

          <h2 className="text-xl font-semibold mt-4 mb-2">Cookies</h2>
          <p>O website usa cookies para ajudar a personalizar sua experiência online. Ao acessar o ETFCurator, você concordou em usar os cookies necessários.</p>
          <p>Um cookie é um arquivo de texto que é colocado no seu disco rígido por um servidor de página da web. Os cookies não podem ser usados para executar programas ou enviar vírus para o seu computador. Os cookies são atribuídos exclusivamente a você e só podem ser lidos por um servidor da web no domínio que emitiu o cookie para você.</p>

          <h2 className="text-xl font-semibold mt-4 mb-2">Licença</h2>
          <p>Salvo indicação em contrário, ETFCurator e/ou seus licenciadores detêm os direitos de propriedade intelectual de todo o material no ETFCurator. Todos os direitos de propriedade intelectual são reservados. Você pode acessar isso do ETFCurator para seu próprio uso pessoal, sujeito às restrições estabelecidas nestes termos e condições.</p>
          <p>Você não deve:</p>
          <ul>
            <li>Republicar material do ETFCurator</li>
            <li>Vender, alugar ou sublicenciar material do ETFCurator</li>
            <li>Reproduzir, duplicar ou copiar material do ETFCurator</li>
            <li>Redistribuir conteúdo do ETFCurator</li>
          </ul>
          <p>Este Acordo terá início na presente data.</p>

          <h2 className="text-xl font-semibold mt-4 mb-2">Isenção de Responsabilidade</h2>
          <p>Na medida máxima permitida pela lei aplicável, excluímos todas as representações, garantias e condições relacionadas ao nosso website e ao uso deste website. Nada nesta isenção de responsabilidade irá:</p>
          <ul>
            <li>limitar ou excluir nossa ou sua responsabilidade por morte ou danos pessoais;</li>
            <li>limitar ou excluir nossa ou sua responsabilidade por fraude ou deturpação fraudulenta;</li>
            <li>limitar qualquer uma de nossas ou suas responsabilidades de qualquer forma que não seja permitida pela lei aplicável; ou</li>
            <li>excluir qualquer uma de nossas ou suas responsabilidades que não possam ser excluídas pela lei aplicável.</li>
          </ul>
          <p>Enquanto o website e as informações e serviços no website forem fornecidos gratuitamente, não seremos responsáveis por qualquer perda ou dano de qualquer natureza.</p>
          <p>[Conteúdo do placeholder - Por favor, substitua por seus Termos de Serviço completos e revisados por um profissional legal.]</p>
        </div>
      </main>
      <DisclaimerBanner />
    </div>
  );
}

