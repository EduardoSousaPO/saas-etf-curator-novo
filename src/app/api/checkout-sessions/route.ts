// src/app/api/checkout-sessions/route.ts
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabaseClient"; // To get user session
import { NextRequest, NextResponse } from "next/server";

// Ensure these Price IDs are set in your .env.local and correspond to your Stripe Products
const STRIPE_PRICE_ID_PRO_BRL = process.env.STRIPE_PRICE_ID_PRO_BRL!;
const STRIPE_PRICE_ID_PRO_USD = process.env.STRIPE_PRICE_ID_PRO_USD!;
// const STRIPE_PRICE_ID_FREE = process.env.STRIPE_PRICE_ID_FREE; // Free plan might not need a checkout

export async function POST(req: NextRequest) {
  try {
    const { priceId, currency, user_id, user_email } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    let selectedPriceId = "";
    if (priceId === "price_pro_brl" && currency === "BRL") {
      selectedPriceId = STRIPE_PRICE_ID_PRO_BRL;
    } else if (priceId === "price_pro_usd" && currency === "USD") {
      selectedPriceId = STRIPE_PRICE_ID_PRO_USD;
    } else {
      return NextResponse.json({ error: "Invalid Price ID or currency combination" }, { status: 400 });
    }

    if (!selectedPriceId) {
        return NextResponse.json({ error: "Stripe Price ID not configured for the selected plan/currency." }, { status: 500 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const params: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: currency === "BRL" ? ["card", "pix"] : ["card"],
      mode: "subscription",
      customer_email: user_email, // Pre-fill customer email
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`, // Or a specific cancellation page
      subscription_data: {
        metadata: {
          userId: user_id,
        },
      },
      metadata: { // Also add to session metadata for webhook verification if needed
        userId: user_id,
      }
    };

    if (currency === "BRL") {
        // For PIX, it is recommended to set payment_method_options for expiration
        params.payment_method_options = {
            pix: {
                expires_after_seconds: 3600, // 1 hour, for example
            },
        };
    }

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}

