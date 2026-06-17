import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('properties')
    .update({ type: 'collection' })
    .eq('type', 'featured');

  if (error) {
    console.error('Error updating properties:', error);
  } else {
    console.log('Successfully updated properties from featured to collection.');
  }
}

run();
