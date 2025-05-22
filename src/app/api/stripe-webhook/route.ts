// src/app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Readable } from "stream";
import { prisma } from "@/lib/prisma"; // Import Prisma client

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10", // Use the latest API version
});

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

// Helper function to buffer the request stream
async function buffer(readable: Readable): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  const buf = await buffer(request.body as unknown as Readable);
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      console.error("Webhook secret or signature not found.");
      return NextResponse.json({ error: "Webhook secret not configured." }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Error verifying webhook signature: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      let customerId: string | null = null;
      let subscriptionId: string | null = null;
      let plan: string = "free"; // Default plan
      let subscriptionStatus: string | null = null;
      let userId: string | null = null;

      switch (event.type) {
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === "subscription") {
            subscriptionId = checkoutSession.subscription as string;
            customerId = checkoutSession.customer as string;
            userId = checkoutSession.client_reference_id; // Assuming you pass user_id here
            
            // Fetch subscription details to get plan and status
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;
            plan = (priceId === process.env.STRIPE_PRICE_ID_PRO_BRL || priceId === process.env.STRIPE_PRICE_ID_PRO_USD) ? "pro" : "free";
            subscriptionStatus = subscription.status;
          } else if (checkoutSession.mode === "payment") {
            // Handle one-time payments if necessary (e.g., for AppSumo like deals if not subscription based)
            // For now, we assume AppSumo is handled differently or results in a subscription-like status.
          }
          break;

        case "customer.subscription.created":
        case "customer.subscription.updated":
          const subscriptionUpdated = event.data.object as Stripe.Subscription;
          subscriptionId = subscriptionUpdated.id;
          customerId = subscriptionUpdated.customer as string;
          const priceIdUpdated = subscriptionUpdated.items.data[0]?.price.id;
          plan = (priceIdUpdated === process.env.STRIPE_PRICE_ID_PRO_BRL || priceIdUpdated === process.env.STRIPE_PRICE_ID_PRO_USD) ? "pro" : "free";
          subscriptionStatus = subscriptionUpdated.status;
          // Try to find user by customerId if not directly available
          if (!userId) {
            const profile = await prisma.profile.findUnique({ where: { stripe_customer_id: customerId } });
            if (profile) userId = profile.user_id;
          }
          break;

        case "customer.subscription.deleted":
          const subscriptionDeleted = event.data.object as Stripe.Subscription;
          subscriptionId = subscriptionDeleted.id;
          customerId = subscriptionDeleted.customer as string;
          plan = "free"; // Revert to free plan
          subscriptionStatus = subscriptionDeleted.status; // e.g., "canceled"
          if (!userId) {
            const profile = await prisma.profile.findUnique({ where: { stripe_customer_id: customerId } });
            if (profile) userId = profile.user_id;
          }
          break;

        case "invoice.paid":
          const invoicePaid = event.data.object as Stripe.Invoice;
          customerId = invoicePaid.customer as string;
          subscriptionId = invoicePaid.subscription as string | null;
          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            const priceIdInv = sub.items.data[0]?.price.id;
            plan = (priceIdInv === process.env.STRIPE_PRICE_ID_PRO_BRL || priceIdInv === process.env.STRIPE_PRICE_ID_PRO_USD) ? "pro" : "free";
            subscriptionStatus = sub.status;
          }
          if (!userId) {
            const profile = await prisma.profile.findUnique({ where: { stripe_customer_id: customerId } });
            if (profile) userId = profile.user_id;
          }
          break;

        case "invoice.payment_failed":
          const invoiceFailed = event.data.object as Stripe.Invoice;
          customerId = invoiceFailed.customer as string;
          subscriptionId = invoiceFailed.subscription as string | null;
          // Potentially update status to past_due or similar
          if (subscriptionId) {
            const subFailed = await stripe.subscriptions.retrieve(subscriptionId);
            subscriptionStatus = subFailed.status;
          }
          if (!userId) {
            const profile = await prisma.profile.findUnique({ where: { stripe_customer_id: customerId } });
            if (profile) userId = profile.user_id;
          }
          break;

        default:
          console.warn(`Unhandled relevant event type: ${event.type}`);
          return NextResponse.json({ message: "Event type unhandled but relevant." }, { status: 200 });
      }

      // Update user profile in Prisma
      if (userId) {
        await prisma.profile.update({
          where: { user_id: userId },
          data: {
            plan: plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_subscription_status: subscriptionStatus,
          },
        });
        console.log(`Profile updated for user ${userId}: plan=${plan}, status=${subscriptionStatus}`);
      } else if (customerId) {
         // If userId is not available from event, try to update based on customerId
         // This is a fallback and assumes stripe_customer_id is unique and correctly set.
        const updatedProfile = await prisma.profile.updateMany({
            where: { stripe_customer_id: customerId },
            data: {
                plan: plan,
                stripe_subscription_id: subscriptionId,
                stripe_subscription_status: subscriptionStatus,
            },
        });
        if (updatedProfile.count > 0) {
            console.log(`Profile(s) updated for customer ${customerId}: plan=${plan}, status=${subscriptionStatus}`);
        } else {
            console.warn(`No profile found for customer_id ${customerId} to update.`);
        }
      } else {
        console.warn("Could not determine user_id or customer_id to update profile.");
      }

    } catch (error) {
      console.error("Error processing webhook event:", error);
      return NextResponse.json({ error: "Webhook handler failed. View logs." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

