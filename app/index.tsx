// app/index.tsx
import { supabase } from '@/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexRedirect() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let hasRedirected = false;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Evita redirecionamentos duplicados
        if (hasRedirected) return;

        // Garante que a sessão foi carregada
        if (session === undefined) return; // ainda carregando

        setIsLoading(false);
        hasRedirected = true;

        if (!session) {
          router.replace('/(auth)/login');
        } else {
          router.replace('/(tabs)'); // 👈 redireciona para o layout protegido
        }
      }
    );

    // Cleanup seguro
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1FB9C9" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});