import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export const APP_URL = import.meta.env.PROD
    ? 'https://auth-for-ocrx.vercel.app/'  // Replace with your actual Vercel domain
    : 'http://localhost:5173';