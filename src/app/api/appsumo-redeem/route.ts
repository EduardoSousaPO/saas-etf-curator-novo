// src/app/api/appsumo-redeem/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Updated import

// Define interface for the transaction client
interface PrismaTransactionClient {
  lifetime_codes: {
    update: (args: any) => Promise<any>;
  };
  profiles: {
    update: (args: any) => Promise<any>;
  };
}

// This endpoint handles AppSumo redemption logic.
// 1. Verifies the AppSumo code (assumed to be the ID of a lifetime_codes record).
// 2. If valid and unused, marks the code as redeemed.
// 3. Updates the user's profile to grant lifetime access.

export async function POST(req: NextRequest) {
  try {
    const { code, userId } = await req.json(); // code is the lifetime_code_id, userId is the profile_id (auth.users.id)

    if (!code || !userId) {
      return NextResponse.json({ error: "Code and User ID are required." }, { status: 400 });
    }

    console.log(`Attempting to redeem AppSumo code: ${code} for user: ${userId}`);

    // 1. Find the lifetime code
    const lifetimeCode = await prisma.lifetime_codes.findUnique({
      where: { id: code },
    });

    if (!lifetimeCode) {
      return NextResponse.json({ error: "Invalid or non-existent AppSumo code." }, { status: 404 });
    }

    if (lifetimeCode.is_redeemed) {
      return NextResponse.json({ error: "This AppSumo code has already been redeemed." }, { status: 400 });
    }

    // 2. Mark code as redeemed and update user's profile in a transaction
    await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Mark code as redeemed
      await tx.lifetime_codes.update({
        where: { id: code },
        data: {
          is_redeemed: true,
          redeemed_at: new Date(),
          redeemed_by_user_id: userId,
        },
      });

      // Update user's profile to grant lifetime access
      await tx.profiles.update({
        where: { id: userId }, // profiles.id is the auth.users.id
        data: {
          lifetime: true,
          // Optionally, you could also change the plan here if needed:
          // plan: "lifetime_pro", // Or whatever your lifetime plan identifier is
        },
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "AppSumo code redeemed successfully. User profile updated with lifetime access.",
    });

  } catch (error: any) {
    console.error("Error in AppSumo redeem endpoint:", error);
    // Check for Prisma-specific errors if needed, e.g., P2025 (Record not found for update)
    if (error.code === 'P2025') {
        return NextResponse.json({ error: "Failed to update records. One of the records (lifetime code or profile) was not found." }, { status: 404 });
    }
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}

