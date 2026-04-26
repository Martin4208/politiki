import { getSupabase } from '@/lib/supabase';

export function createClient() {
    return getSupabase()
}
