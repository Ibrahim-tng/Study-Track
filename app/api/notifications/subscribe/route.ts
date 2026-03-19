import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription || !userId) {
      return NextResponse.json(
        { error: "Missing subscription or userId" },
        { status: 400 }
      );
    }

    // Save subscription to Firestore under the user's document
    // We store it in a subcollection 'subscriptions' to support multiple devices
    const subscriptionId = Buffer.from(subscription.endpoint).toString("base64").slice(0, 50);
    
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("push_subscriptions")
      .doc(subscriptionId)
      .set({
        ...subscription,
        updatedAt: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
