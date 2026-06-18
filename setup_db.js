const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las credenciales de Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDB() {
  const userId = "d9d1d49f-0299-47c4-85c2-42cfd04fcb46";
  console.log("Configurando usuario y propiedades para Vendedor...");

  // 1. Asignar rol de vendedor en user_roles
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({ id: userId, role: 'vendedor' });

  if (roleError) {
    console.error("Error asignando rol:", roleError.message);
  } else {
    console.log("Rol 'vendedor' asignado exitosamente.");
  }

  // 2. Asignar propiedades al usuario (casona-villarrica y otra)
  // Let's get 2 properties
  const { data: props, error: getError } = await supabase
    .from('properties')
    .select('id, slug')
    .limit(2);

  if (getError) {
    console.error("Error obteniendo propiedades:", getError.message);
    return;
  }

  if (props && props.length > 0) {
    const ids = props.map(p => p.id);
    const { error: updateError } = await supabase
      .from('properties')
      .update({ host_id: userId })
      .in('id', ids);
    
    if (updateError) {
      console.error("Error asignando propiedades:", updateError.message);
    } else {
      console.log(`Propiedades asignadas al usuario: ${props.map(p => p.slug).join(', ')}`);
    }
  }

  console.log("Setup finalizado.");
}

setupDB();
