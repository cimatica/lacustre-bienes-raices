import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const userId = "d9d1d49f-0299-47c4-85c2-42cfd04fcb46";
  const logs = [];

  // 1. Assign role
  const { data: roleType } = await supabase.from('role_types').select('id').eq('name', 'vendedor').single();
  if (!roleType) {
    return NextResponse.json({ error: 'Role vendedor not found' }, { status: 500 });
  }

  // Ensure user profile exists
  await supabase.from('user_profiles').upsert({ id: userId, email: 'alfega.trabajo@gmail.com', full_name: 'Alfega Trabajo' });

  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({ id: userId, role_id: roleType.id });

  if (roleError) logs.push(`Error role: ${roleError.message}`);
  else logs.push('Role assigned');

  // 2. Assign properties
  const { data: props, error: getError } = await supabase
    .from('properties')
    .select('id, slug')
    .limit(2);

  if (getError) {
    logs.push(`Error get props: ${getError.message}`);
  } else if (props && props.length > 0) {
    const ids = props.map(p => p.id);
    const { error: updateError } = await supabase
      .from('properties')
      .update({ host_id: userId })
      .in('id', ids);
    
    if (updateError) {
      logs.push(`Error update props: ${updateError.message}`);
    } else {
      logs.push(`Props assigned: ${props.map(p => p.slug).join(', ')}`);
    }
  }

  return NextResponse.json({ logs });
}
