import { createClient } from '@supabase/supabase-js'

export const DefaultClient = createClient(
  import.meta.env.VITE_API_URL,
  import.meta.env.VITE_API_SERVICE_ROLE_KEY,
)