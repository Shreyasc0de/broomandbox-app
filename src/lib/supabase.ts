import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
        'Ensure your .env file has these variables set. ' +
        'See .env.example for reference.'
    );
}

// For frontend connections, we must use the Anon key, NOT the service role key!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
