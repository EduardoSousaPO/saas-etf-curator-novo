// src/components/pricing/PricingPageClient.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

// Ensure your Stripe publishable key is set in environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Plan {
  id: string;
  name: string;
  description: string;
  priceBRL: string;
  priceUSD: string;
  priceIdBRL: string; // Internal ID to map to Stripe Price ID
  priceIdUSD: string;
  features: string[];
  cta: string;
  isPro: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Comece a explorar o básico do mercado de ETFs.",
    priceBRL: "R$0",
    priceUSD: "$0",
    priceIdBRL: "price_free", // Placeholder, free plan doesn't go to checkout
    priceIdUSD: "price_free",
    features: [
      "Acesso limitado ao Screener",
      "Rankings Top 5",
      "Comparador (até 2 ETFs)",
      "Suporte via comunidade",
    ],
    cta: "Começar Gratuitamente",
    isPro: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Desbloqueie todo o potencial da plataforma ETFCurator.",
    priceBRL: "R$45",
    priceUSD: "$9",
    priceIdBRL: "price_pro_brl", // Matches the ID used in checkout-sessions API
    priceIdUSD: "price_pro_usd",
    features: [
      "Acesso completo ao Screener",
      "Todos os Rankings",
      "Comparador (até 4 ETFs)",
      "Insights detalhados",
      "Exportação de dados (CSV/XLSX)",
      "Suporte prioritário",
    ],
    cta: "Assinar Plano Pro",
    isPro: true,
  },
];

export default function PricingPageClient() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState<"BRL" | "USD">("USD"); // Default or detect

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Basic region detection (very simplified)
        // In a real app, use a more robust method like IP geolocation or user profile setting
        // For now, assume BRL if email contains .br or common BR domains, otherwise USD.
        if (session.user.email?.endsWith(".br") || session.user.email?.includes(".com.br")) {
          setUserCurrency("BRL");
        } else {
          setUserCurrency("USD");
        }
      } else {
        // If no user, default to USD or try to guess from browser lang
        if (typeof navigator !== "undefined" && navigator.language.startsWith("pt")) {
            setUserCurrency("BRL");
        } else {
            setUserCurrency("USD");
        }
      }
    };
    fetchUser();
  }, []);

  const handleCheckout = async (plan: Plan) => {
    if (!user && plan.isPro) {
      // Redirect to login or show a message
      window.location.href = "/auth"; // Adjust as needed
      return;
    }
    if (!plan.isPro) {
        // Handle free plan selection (e.g., redirect to dashboard)
        window.location.href = "/screener"; // Adjust as needed
        return;
    }

    setLoading(true);
    setError(null);

    const priceId = userCurrency === "BRL" ? plan.priceIdBRL : plan.priceIdUSD;

    try {
      const response = await fetch("/api/checkout-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceId,
          currency: userCurrency,
          user_id: user?.id,
          user_email: user?.email,
        }),
      });

      const session = await response.json();

      if (response.ok) {
        const stripe = await stripePromise;
        if (stripe && session.sessionId) {
          const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: session.sessionId });
          if (stripeError) {
            console.error("Stripe redirect error:", stripeError);
            setError(stripeError.message || "Failed to redirect to Stripe.");
          }
        }
      } else {
        console.error("Failed to create checkout session:", session.error);
        setError(session.error || "Failed to create checkout session.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Planos de Preços Flexíveis
        </h1>
        <p className="mt-3 text-xl text-gray-600 dark:text-gray-300 sm:mt-5">
          Escolha o plano perfeito para suas necessidades de análise de ETFs.
        </p>
        <div className="mt-4">
            <span className="mr-2 dark:text-gray-400">Moeda:</span>
            <Button variant={userCurrency === "BRL" ? "default" : "outline"} onClick={() => setUserCurrency("BRL")} className="mr-2">BRL</Button>
            <Button variant={userCurrency === "USD" ? "default" : "outline"} onClick={() => setUserCurrency("USD")}>USD</Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md dark:bg-red-900 dark:text-red-200 dark:border-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 items-stretch">
        {plans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col rounded-xl shadow-lg dark:bg-gray-800 ${plan.isPro ? "border-2 border-red-500" : "border dark:border-gray-700"}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold dark:text-white">{plan.name}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="my-4 text-center">
                <span className="text-4xl font-bold dark:text-white">{userCurrency === "BRL" ? plan.priceBRL : plan.priceUSD}</span>
                <span className="text-gray-500 dark:text-gray-400">{plan.isPro ? (userCurrency === "BRL" ? "/mês" : "/month") : ""}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleCheckout(plan)} 
                disabled={loading}
                className={`w-full text-lg py-3 ${plan.isPro ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"} text-white`}
              >
                {loading && plan.isPro ? "Processando..." : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
        Pagamentos processados de forma segura pelo Stripe. Você pode cancelar sua assinatura a qualquer momento.
      </p>
    </div>
  );
}

