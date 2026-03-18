import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { FocusSession } from "@/types";

/**
 * Créer une nouvelle session Focus
 */
export async function createFocusSession(
  userId: string,
  duration: number,
  type: "work" | "break",
  taskId?: string,
  subjectId?: string
): Promise<string> {
  const sessionsRef = collection(db, "focusSessions");
  const now = Timestamp.now();
  
  const docRef = await addDoc(sessionsRef, {
    userId,
    taskId: taskId || null,
    subjectId: subjectId || null,
    duration,
    type,
    startedAt: now,
    completedAt: now,
    createdAt: now,
  });
  
  return docRef.id;
}

/**
 * Récupérer toutes les sessions Focus d'un utilisateur
 */
export async function getUserFocusSessions(userId: string): Promise<FocusSession[]> {
  const sessionsRef = collection(db, "focusSessions");
  const q = query(sessionsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  const sessions: FocusSession[] = [];
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as FocusSession);
  });

  // Trier par date (plus récent en premier)
  return sessions.sort((a, b) => {
    return b.completedAt.toMillis() - a.completedAt.toMillis();
  });
}

/**
 * Récupérer le temps total travaillé par un utilisateur
 */
export async function getTotalFocusTime(userId: string): Promise<number> {
  const sessions = await getUserFocusSessions(userId);
  const workSessions = sessions.filter((s) => s.type === "work");
  
  return workSessions.reduce((total, session) => total + session.duration, 0);
}

/**
 * Récupérer le temps travaillé aujourd'hui
 */
export async function getTodayFocusTime(userId: string): Promise<number> {
  const sessions = await getUserFocusSessions(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySessions = sessions.filter((s) => {
    const sessionDate = s.completedAt.toDate();
    return sessionDate >= today && s.type === "work";
  });
  
  return todaySessions.reduce((total, session) => total + session.duration, 0);
}

/**
 * Récupérer les sessions Focus d'aujourd'hui (avec détails)
 */
export async function getTodayFocusSessions(userId: string): Promise<FocusSession[]> {
  const sessions = await getUserFocusSessions(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return sessions.filter((session) => {
    const sessionDate = session.completedAt.toDate();
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
}

/**
 * Récupérer le temps travaillé cette semaine
 */
export async function getWeekFocusTime(userId: string): Promise<number> {
  const sessions = await getUserFocusSessions(userId);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Dimanche
  weekStart.setHours(0, 0, 0, 0);
  
  const weekSessions = sessions.filter((s) => {
    const sessionDate = s.completedAt.toDate();
    return sessionDate >= weekStart && s.type === "work";
  });
  
  return weekSessions.reduce((total, session) => total + session.duration, 0);
}

/**
 * Calculer le temps total travaillé cette semaine (avec sessions complets)
 */
export async function getWeekTotalWorkTime(userId: string): Promise<number> {
  const sessions = await getUserFocusSessions(userId);
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekSessions = sessions.filter((session) => {
    const sessionDate = session.completedAt.toDate();
    return sessionDate >= weekAgo && session.type === "work";
  });

  return weekSessions.reduce((total, session) => total + session.duration, 0);
}
