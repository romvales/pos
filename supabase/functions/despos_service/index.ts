// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import * as desposService from './despos_service.js'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { funcName, parameters } = (await req.json()) ?? {}

  const func = desposService[funcName]
  const headers = new Headers(corsHeaders)

  headers.append('Authorization', req.headers.get('Authorization')!)
  headers.append('Content-Type', 'application/json')

  const DefaultClient = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    { global: { headers } },
  )

  if (!func || !func) {
    return new Response(
      JSON.stringify({ message: 'invalid function name.' }),
      { headers },
    )
  }

  const { data } = await func(DefaultClient, parameters)

  return new Response(JSON.stringify(data), { headers })
})
