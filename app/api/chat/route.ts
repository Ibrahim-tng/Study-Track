import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { headers } from "next/headers";
import { verifyFirebaseToken } from "@/lib/firebaseAdmin";
import { checkRateLimit } from "@/lib/rateLimit";

// CONFIG
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000; // chars per message
const RATE_LIMIT_MAX = 30;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // --- 1. Auth Verification ---
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  let uid: string;
  try {
    uid = await verifyFirebaseToken(authHeader);
  } catch {
    return new Response(
      JSON.stringify({ error: "Non autorisé. Vous devez être connecté pour utiliser l'assistant IA." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // --- 2. Rate Limiting (per UID) ---
  if (!(await checkRateLimit(uid, RATE_LIMIT_MAX))) {
    return new Response(
      JSON.stringify({ error: "Trop de requêtes. Veuillez patienter une minute." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  // --- 3. Input Validation ---
  let rawMessages: unknown;
  try {
    const body = await req.json();
    rawMessages = body?.messages;
  } catch {
    return new Response(
      JSON.stringify({ error: "Corps de la requête invalide." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Le champ `messages` doit être un tableau non vide." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Clamp messages: max 20, each max 2000 chars
  const messages = rawMessages
    .slice(-MAX_MESSAGES)
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_MESSAGE_LENGTH),
    }));

  if (messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Aucun message valide fourni." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // --- 4. AI Streaming ---
  try {
    const systemPrompt = `Tu es l'Assistant StudyTrack, un coach spécialisé en sciences de l'éducation et en optimisation de la productivité étudiante.
Ton but principal est d'aider les étudiants à s'organiser, vaincre la procrastination (par ex. en expliquant la méthode Pomodoro, le Time-Boxing), et apprendre plus efficacement (répétition espacée, méthode Feynman, flashcards).
Tu dois te montrer toujours très bienveillant, encourageant, mais concret. Donne de vrais conseils actionnables.
Tu dois répondre uniquement aux questions pertinentes pour un étudiant (productivité, devoirs, organisation, orientation, bien-être estudiantin, gestion du stress). Si l'utilisateur te pose des questions hors-sujet (programmation, histoire générale, etc.), recentre poliment la conversation en disant que tu es là pour l'aider à travailler efficacement.
Tu dois t'exprimer en français avec des émojis pour être chaleureux. Ton texte sera formaté en Markdown : utilise le **gras**, les listes \`-\`, les titres \`##\`, etc. pour rendre ta réponse claire et facile à lire.
Sois concis : vise 100-250 mots maximum par réponse, sauf si l'utilisateur demande plus de détail.`;

    const result = streamText({
      model: google("gemini-flash-latest"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-cache, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue lors de la communication avec l'IA." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
