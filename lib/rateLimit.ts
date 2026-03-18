import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

/**
 * Initialise Firebase Admin for Firestore Rate Limiting
 */
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error("Missing Firebase Admin environment variables for Rate Limiting");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  }, "rate-limiter");
}

const db = getFirestore(getAdminApp());
const LIMITS_COLLECTION = "rate_limits";

/**
 * Check rate limit for a given identifier (UID) using Firestore.
 * This is serverless-safe as it persists across instances.
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): Promise<boolean> {
  const now = Date.now();
  const docRef = db.collection(LIMITS_COLLECTION).doc(identifier);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      const data = doc.data();

      if (!doc.exists || now > (data?.resetAt?.toMillis() || 0)) {
        // New window or expired window
        const resetAt = Timestamp.fromMillis(now + windowMs);
        transaction.set(docRef, {
          count: 1,
          resetAt: resetAt,
          updatedAt: FieldValue.serverTimestamp(),
        });
        return true;
      }

      if (data && data.count >= maxRequests) {
        return false;
      }

      // Increment count
      transaction.update(docRef, {
        count: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    });

    return result;
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open in case of DB error to avoid blocking users, but log it.
    return true; 
  }
}
