import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { adminDb } from "@/lib/firebaseAdmin";

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:example@yourdomain.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, url } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get all subscriptions for this user
    const subscriptionsSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("push_subscriptions")
      .get();

    if (subscriptionsSnapshot.empty) {
      return NextResponse.json({ error: "No subscriptions found for this user" }, { status: 404 });
    }

    const notifications = subscriptionsSnapshot.docs.map(async (doc) => {
      const subscription = doc.data() as webpush.PushSubscription;
      
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: title || "Test StudyTrack",
            body: body || "Ceci est une notification de test !",
            url: url || "/dashboard",
            icon: "/icon-192x192.png",
          })
        );
      } catch (error: any) {
        // If subscription is no longer valid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await doc.ref.delete();
        }
        console.error("Error sending push to subscription:", error);
      }
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: notifications.length });
  } catch (error) {
    console.error("Error in test-send:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
