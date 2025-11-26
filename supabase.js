import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';


export const supabase = createClient(
  "https://vedrbhldjowxpilucyfo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZHJiaGxkam93eHBpbHVjeWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MzAzNTEsImV4cCI6MjA3OTQwNjM1MX0.t57rR61RYdNkxvqBIBng4D76YJsD5JVX8rCfFkTX6YI",  {
    auth: {
      storage: AsyncStorage,  
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

