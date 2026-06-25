// ENDPOINT OBSOLETO
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Endpoint obsoleto. Las propiedades ahora usan property_assignments.' }, { status: 410 });
}
