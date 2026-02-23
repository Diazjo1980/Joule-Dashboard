import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://syksdkgtppwipazglpka.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T10g8S_v0qMGJmtScZjxGQ_As-0Xdqk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
