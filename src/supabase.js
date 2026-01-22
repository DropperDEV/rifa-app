import { createClient } from '@supabase/supabase-js'

// No Vite, usamos import.meta.env para ler as variáveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)