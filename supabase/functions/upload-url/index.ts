import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function safeFileName(name = 'file', type = 'image') {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (type === 'datasheet') {
    return clean.endsWith('.pdf') ? clean : `${clean || 'datasheet'}.pdf`;
  }
  return clean || 'product-image.webp';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  }

  try {
    const { type, slug, fileName, fileSize } = await req.json()

    if (!slug) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing product slug' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const isDatasheet = type === 'datasheet'
    const bucket = isDatasheet ? 'product-datasheets' : 'product-images'
    const maxSize = isDatasheet ? 25 * 1024 * 1024 : 5 * 1024 * 1024

    if (fileSize && fileSize > maxSize) {
      return new Response(
        JSON.stringify({ success: false, error: `File size must be less than ${maxSize / (1024 * 1024)}MB.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 413 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // We use service role key to bypass RLS and create signed upload URL
    const supabaseKey = Deno.env.get('MY_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Storage not configured (missing env vars)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const stamp = Date.now()
    const path = `${slug}/${stamp}-${safeFileName(fileName, type)}`

    // Create signed upload URL so the browser can upload directly
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path)
    
    if (error) {
      throw error
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          bucket,
          path,
          token: data.token,
          publicUrl,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err: any) {
    console.error('Error handling upload URL generation:', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to prepare upload',
        message: err.message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
