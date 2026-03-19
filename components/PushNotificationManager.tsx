"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/context/NotificationContext";
import { Bell } from "lucide-react";

export default function PushNotificationManager() {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPush = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        addToast("warning", "Permission refusée", "Tu dois autoriser les notifications pour recevoir des alertes.");
        setLoading(false);
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not found");
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      // Send to backend
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub,
          userId: user.uid,
        }),
      });

      if (response.ok) {
        setSubscription(sub);
        addToast("success", "Notifications activées !", "Tu recevras désormais des alertes push 🎉");
      } else {
        throw new Error("Failed to save subscription");
      }
    } catch (error) {
      console.error("Error subscribing to push:", error);
      addToast("error", "Erreur", "Impossible d'activer les notifications push.");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        addToast("info", "Notifications désactivées", "Tu ne recevras plus d'alertes push.");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="card-premium p-6 border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
            <Bell size={24} className="opacity-50" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications Push</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Non supportées sur ce navigateur ou en navigation privée.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${subscription ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-500/10 text-slate-500'
            }`}>
            <Bell size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications Push</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subscription
                ? "Notifications activées sur ce navigateur"
                : "Recevoir des alertes même hors ligne"}
            </p>
          </div>
        </div>

        <div
          className="flex flex-col items-center gap-2 cursor-pointer select-none"
          onClick={() => {
            if (!loading) {
              if (subscription) unsubscribeFromPush();
              else subscribeToPush();
            }
          }}
        >
          <div className="flex items-center">
            <span className={`text-[10px] font-bold mr-2 uppercase tracking-wider ${!subscription ? 'text-slate-400' : 'text-slate-300'}`}>OFF</span>
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${subscription ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                } ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
            >
              <span
                className={`${subscription ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm`}
              />
            </div>
            <span className={`text-[10px] font-bold ml-2 uppercase tracking-wider ${subscription ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>ON</span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
            {loading ? "Chargement..." : subscription ? "Activées" : "Désactivées"}
          </span>
        </div>
      </div>
    </div>
  );
}
