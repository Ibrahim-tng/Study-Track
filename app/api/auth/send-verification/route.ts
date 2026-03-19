import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as admin from 'firebase-admin';

// Rate limiter: max 5 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  // --- Rate Limiting ---
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Trop de demandes. Réessayez dans 10 minutes.' }, { status: 429 });
  }
  // --- End Rate Limiting ---

  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format email invalide' }, { status: 400 });
    }

    // 1. Generate the email verification link using Firebase Admin
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for
      // this URL must be whitelisted in the Firebase Console.
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      handleCodeInApp: true,
    };

    // Generate a simple link that goes to the Firebase handler
    const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);

    // 2. Send the custom email using Resend
    const { data, error } = await resend.emails.send({
      from: 'StudyTrack <no-reply@study-track.site>', // IMPORTANT: Replace @studytrack.app with your verified domain in Resend
      to: email,
      subject: 'Vérifiez votre adresse email - StudyTrack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #3b82f6; text-align: center;">Bienvenue sur StudyTrack ! 📚</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            Bonjour,
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            Merci de vous être inscrit(e) sur StudyTrack. Pour finaliser votre inscription et accéder à toutes nos fonctionnalités, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
              Vérifier mon email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :<br/>
            <a href="${verificationLink}" style="color: #3b82f6; word-break: break-all;">${verificationLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
          </p>
        </div>
      `,
    }, {
      idempotencyKey: `verify-email/${email}-${Date.now()}`,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
