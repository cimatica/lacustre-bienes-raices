import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos el cliente con clave pública, ya que el feed es público
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    // Solo propiedades activas
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*, property_types(name), commercial_statuses(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching properties for feed:', error);
      return new NextResponse('<error>Error fetching properties</error>', { 
        status: 500, 
        headers: { 'Content-Type': 'text/xml' } 
      });
    }

    // Configuración base de la URL (ajustar según el dominio real)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lacustrebienesraices.cl';

    // Generar XML en formato genérico estándar para portales
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    properties?.forEach((prop) => {
      const propertyUrl = `${baseUrl}/propiedad/${prop.slug}`;
      const lastMod = new Date(prop.created_at).toISOString().split('T')[0];
      
      xml += `  <url>\n`;
      xml += `    <loc>${propertyUrl}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      
      // Datos personalizados para Portales Inmobiliarios (Metadatos)
      xml += `    <property_data>\n`;
      xml += `      <id>${prop.id}</id>\n`;
      xml += `      <title><![CDATA[${prop.title}]]></title>\n`;
      xml += `      <type>${prop.property_types?.name || 'Propiedad'}</type>\n`;
      xml += `      <operation>${prop.sale_type}</operation>\n`;
      xml += `      <price currency="UF">${prop.price}</price>\n`;
      xml += `      <location><![CDATA[${prop.location}]]></location>\n`;
      xml += `      <bedrooms>${prop.beds || 0}</bedrooms>\n`;
      xml += `      <bathrooms>${prop.baths || 0}</bathrooms>\n`;
      xml += `      <parking>${prop.parking || 0}</parking>\n`;
      xml += `      <area unit="m2">${prop.area || 0}</area>\n`;
      xml += `      <status>${prop.commercial_statuses?.name || 'Disponible'}</status>\n`;
      xml += `    </property_data>\n`;

      if (prop.image_url) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${prop.image_url}</image:loc>\n`;
        xml += `      <image:title><![CDATA[${prop.image_alt || prop.title}]]></image:title>\n`;
        xml += `    </image:image>\n`;
      }
      
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });

  } catch (err) {
    console.error('Feed generation error:', err);
    return new NextResponse('<error>Internal Server Error</error>', { 
      status: 500,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
