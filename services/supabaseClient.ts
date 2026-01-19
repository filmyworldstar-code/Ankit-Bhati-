
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rsrhcfannbxdsxdzbdgn.supabase.co';
const supabaseAnonKey = 'sb_publishable_0x7HF2oLA-vYS5TmeYjcag_i6LDmtvr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
