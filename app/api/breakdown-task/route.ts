import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { headers } from "next/headers";
import { verifyFirebaseToken } from "@/lib/firebaseAdmin";
import { checkRateLimit } from "@/lib/rateLimit";

export const maxDuration = 60;

export async function POST(req: Request) {
  // --- 1. Auth Verification ---
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  let uid: string;
  try {
    uid = await verifyFirebaseToken(authHeader);
  } catch {
    return new Response(
      JSON.stringify({ error: "Non autorisé. Vous devez être connecté pour utiliser cette fonctionnalité." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // --- 2. Rate Limiting (per UID) ---
  if (!(await checkRateLimit(uid, 10))) {
    return new Response(
      JSON.stringify({ error: "Trop de requêtes IA. Attendez une minute." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  // --- 3. Input Validation & Sanitization ---
  let title: unknown, description: unknown;
  try {
    const body = await req.json();
    title = body?.title;
    description = body?.description;
  } catch {
    return new Response(
      JSON.stringify({ error: "Corps de la requête invalide." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!title || typeof title !== "string") {
    return new Response(
      JSON.stringify({ error: "Le titre de la tâche est requis." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const safeTitle = title.trim().slice(0, 200);
  const safeDesc = typeof description === "string" ? description.trim().slice(0, 1000) : "";

  // --- 4. AI Generation ---
  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      system: `Tu es un expert en gestion de projet étudiant et en lutte contre la procrastination. 
L'utilisateur te donne une grosse tâche (projet, essai, mémoire, examen à réviser, etc.) et potentiellement une description.
Ton but est de diviser cette tâche principale en 3 à 6 sous-tâches plus petites, actionnables, et beaucoup moins intimidantes.
Chaque sous-tâche doit être concrète (ex: "Lire le chapitre 1 et prendre des notes" au lieu de "Réviser"). Il doit y avoir un ordre logique chronologique.
Estime également la durée (en minutes) nécessaire pour accomplir chaque sous-tâche (généralement entre 15 et 60 mins). Le total des durées doit être réaliste.`,
      prompt: `Découpe la tâche suivante en un plan d'action de sous-tâches réalisables. 
Titre: "${safeTitle}"
Description: "${safeDesc || "Aucune description fournie"}"`,
      schema: z.object({
        subtasks: z
          .array(
            z.object({
              title: z.string().describe("Le titre clair et actionnable de la sous-tâche. Maximum 60 caractères."),
              description: z.string().describe("Courte description (1-2 phrases) de comment accomplir concrètement cette sous-tâche."),
              plannedDuration: z
                .number()
                .int()
                .positive()
                .describe("L'estimation en minutes de la durée de cette sous-tâche (entre 10 et 120 max)."),
            })
          )
          .min(2)
          .max(6)
          .describe("La liste ordonnée chronologiquement des sous-tâches nécessaires pour accomplir la tâche principale."),
      }),
      temperature: 0.3,
    });

    return new Response(JSON.stringify(object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Breakdown Task API Error:", error);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue lors de la génération du plan d'action." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
