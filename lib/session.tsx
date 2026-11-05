import { supabase } from "@/supabase";
import type { Session } from "@supabase/supabase-js";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import type { Profile } from "./health";

type Ctx = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Ctx>({
  session: null, profile: null, loading: true,
  refreshProfile: async () => {}, signOut: async () => {},
});

export const useSession = () => useContext(SessionContext);

async function registerPushToken(userId: string) {
  if (Platform.OS === "web" || !Device.isDevice) return;
  try {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== "granted") return;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "fdfa5aff-7594-4495-ba54-0390fb1a0d20",
    });
    await supabase.from("profiles").update({ expo_push_token: token.data }).eq("id", userId);
  } catch (e) {
    console.warn("push token:", e);
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string | undefined) => {
    if (!uid) { setProfile(null); return; }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (error) console.warn("profile:", error.message);
    setProfile((data as Profile) ?? null);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      if (active) setLoading(false);
      if (data.session) registerPushToken(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // fora do callback para não travar o cliente do supabase
      setTimeout(() => loadProfile(s?.user.id), 0);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  const value: Ctx = {
    session, profile, loading,
    refreshProfile: () => loadProfile(session?.user.id),
    signOut: async () => { await supabase.auth.signOut(); setProfile(null); },
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
