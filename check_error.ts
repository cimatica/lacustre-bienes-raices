import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  // Query to get column type
  const { data: cols, error: errCols } = await supabase.rpc('query_sql', { query: `
    SELECT data_type 
    FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'type';
  `});
  
  if (errCols) {
    console.log("No rpc query_sql. Trying to insert a test value to see error:");
    const { error } = await supabase.from('properties').update({ type: 'collection' }).eq('id', '00000000-0000-0000-0000-000000000000');
    console.log("Error details:", JSON.stringify(error, null, 2));
  }
}

run();
