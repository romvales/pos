import { createClient } from '@supabase/supabase-js'

const supabaseUrl = localStorage.getItem('SERVER_URL')
const supabaseKey = localStorage.getItem('SERVER_KEY')

export const DefaultClient = createClient(
   supabaseUrl?.length ? supabaseUrl : import.meta.env.VITE_API_URL,
   supabaseUrl?.length ? supabaseKey : import.meta.env.VITE_API_SERVICE_ROLE_KEY,
)