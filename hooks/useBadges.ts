import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { UserBadges } from '@/types/badges';

export function useBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<UserBadges>({
    unlockedBadges: [],
    totalPoints: 0,
    level: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBadges = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setBadges({
            unlockedBadges: userDoc.data()?.unlockedBadges || [],
            totalPoints: userDoc.data()?.totalPoints || 0,
            level: userDoc.data()?.level || 1,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des badges');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  return { badges, loading, error };
}
