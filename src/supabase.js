import { createClient } from '@supabase/supabase-js'

export const DefaultClient = createClient(
  localStorage.getItem('SERVER_URL') ?? import.meta.env.VITE_API_URL,
  localStorage.getItem('SERVER_KEY') ?? import.meta.env.VITE_API_SERVICE_ROLE_KEY,
)