import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface LoginWithPinRequest {
  pinCode: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { pinCode }: LoginWithPinRequest = await req.json()

    if (!pinCode || pinCode.length !== 6) {
      return new Response(
        JSON.stringify({ error: 'Valid 6-digit PIN is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Clean up expired PINs first
    await supabase.rpc('cleanup_expired_pins')

    // Find valid PIN
    const { data: pinData, error: pinError } = await supabase
      .from('admin_access_pins')
      .select(`
        *,
        target_profile:profiles!admin_access_pins_target_user_id_fkey(user_id, full_name, role, email),
        generator_profile:profiles!admin_access_pins_generated_by_fkey(user_id, full_name, role)
      `)
      .eq('pin_code', pinCode)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (pinError || !pinData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired PIN' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark PIN as used
    await supabase
      .from('admin_access_pins')
      .update({
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', pinData.id)

    // Generate a temporary session for the target user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: pinData.target_profile.email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'http://localhost:8080'}/dashboard?admin_access=true`
      }
    })

    if (sessionError || !sessionData) {
      console.error('Session generation error:', sessionError)
      throw new Error('Failed to generate session')
    }

    // Log the PIN usage in audit log
    await supabase
      .from('audit_log')
      .insert({
        actor_user_id: pinData.generated_by,
        action: 'ADMIN_PIN_USED',
        entity: 'admin_access_pins',
        entity_id: pinData.id,
        payload_json: {
          target_user_id: pinData.target_user_id,
          target_user_name: pinData.target_profile.full_name,
          target_user_role: pinData.target_profile.role,
          used_at: new Date().toISOString(),
          pin_created_at: pinData.created_at
        }
      })

    console.log(`PIN ${pinCode} used successfully for user ${pinData.target_user_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl: sessionData.properties?.action_link,
        targetUser: {
          id: pinData.target_profile.user_id,
          name: pinData.target_profile.full_name,
          role: pinData.target_profile.role
        },
        sessionInfo: {
          generatedBy: pinData.generator_profile.full_name,
          generatedAt: pinData.created_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Login with PIN error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})