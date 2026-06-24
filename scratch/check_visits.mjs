import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tiqmjuljjqmlgyeajyip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcW1qdWxqanFtbGd5ZWFqeWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAxMjYzOSwiZXhwIjoyMDk1NTg4NjM5fQ.l-RIPt84oqQk-PlZXwVjmQ9T-QdCxQ9xQpI9MU4YL7g'
);

async function check() {
  const { data: properties } = await supabase.from('properties').select('id, title');
  const casona = properties.find(p => p.title.toLowerCase().includes('casona'));
  
  if (casona) {
    const { data: visits } = await supabase.from('visits').select('*').eq('property_id', casona.id);
    console.log("Visits for Casona:", visits);
    
    const { data: assignments } = await supabase.from('property_assignments').select('*, user_profiles(full_name)').eq('property_id', casona.id);
    console.log("Assignments for Casona:", assignments);
  }
}

check();
