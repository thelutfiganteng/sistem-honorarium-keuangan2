import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

Deno.serve(async (req) => {
  try {
    // This function should only work once - check if any super admin exists
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if super admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('role', 'super_admin')
      .single()

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: 'Super admin already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create the super admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@gmail.com',
      password: 'admin1234',
      email_confirm: true,
      user_metadata: {
        nama: 'Super Admin',
        username: 'admin@gmail.com'
      }
    })

    if (authError) throw authError

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Super admin created successfully',
        user_id: authData.user.id 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
