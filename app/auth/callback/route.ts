import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user) {
      const user = data.user;
      const { createAdminClient } = await import('@/utils/supabase/admin');
      const adminSupabase = createAdminClient();
      
      const { data: profile } = await adminSupabase.from('user_profiles').select('full_name, avatar_url').eq('id', user.id).single();
      
      const updates: any = { last_login: new Date().toISOString() };
      
      // Sync Google/OAuth metadata if missing in DB
      const authName = user.user_metadata?.full_name || user.user_metadata?.name;
      const authAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      
      if ((!profile?.full_name || profile?.full_name === 'Usuario') && authName) updates.full_name = authName;
      if (!profile?.avatar_url && authAvatar) updates.avatar_url = authAvatar;
      
      await adminSupabase.from('user_profiles').update(updates).eq('id', user.id);

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
