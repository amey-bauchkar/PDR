// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('MY_SERVICE_ROLE_KEY') ?? ''
    )

    const { firstName, lastName, email, phone, company, inquiryType, message } = await req.json()

    if (!firstName || !lastName || !email || !phone || !company || !inquiryType) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required contact fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { data, error } = await supabaseClient
      .from('contact_inquiries')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        inquiry_type: inquiryType.trim(),
        message: message?.trim() || '',
      })
      .select('id, created_at')
      .single()

    if (error || !data) {
      console.error('Contact DB error:', error)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to submit contact inquiry' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data: { id: data.id, createdAt: data.created_at } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    )
  } catch (error) {
    console.error('Contact function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
