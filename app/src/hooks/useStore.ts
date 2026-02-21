import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../types";

const STORAGE_KEYS = {
  USER_ID: "satprep_user_id",
  ONBOARDED: "satprep_onboarded",
};

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  async function loadAuth() {
    try {
      const [storedUserId, onboarded] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_ID),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
      ]);
      setUserId(storedUserId);
      setIsOnboarded(onboarded === "true");
    } catch (error) {
      console.error("Failed to load auth:", error);
    } finally {
      setLoading(false);
    }
  }

  const login = useCallback(async (id: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, id);
    setUserId(id);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
    setIsOnboarded(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER_ID, STORAGE_KEYS.ONBOARDED]);
    setUserId(null);
    setIsOnboarded(false);
  }, []);

  return { userId, isOnboarded, loading, login, completeOnboarding, logout };
}
