// ─── Configuration ────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Types ────────────────────────────────────────────────────────────────────

export type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  image_alt: string;
  is_main: boolean;
  order_index: number;
  created_at: string;
};

export type Property = {
  id: string;
  title: string;
  location: string;
  price: string;
  price_per_month: boolean;
  beds: number;
  baths: number;
  area: number;
  image_url: string;
  image_alt: string;
  badge: string;
  is_featured: boolean;
  type: "featured" | "new";
  sale_type: "Venta" | "Renta";
  created_at: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  amenities?: string[];
  property_images?: PropertyImage[];
  property_type?: string;
};

export type PaginatedProperties = {
  data: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function apiHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    // Request the total count in the response
    Prefer: "count=exact",
  };
}

function buildUrl(params: Record<string, string | undefined>): string {
  const url = new URL(`${SUPABASE_URL}/rest/v1/properties`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, value);
  }
  return url.toString();
}

// ─── Data access ─────────────────────────────────────────────────────────────

/** Fetch featured properties. */
export async function getFeaturedProperties(limit?: number): Promise<Property[]> {
  const url = buildUrl({
    select: "*",
    is_featured: "eq.true",
    order: "created_at.asc",
    ...(limit ? { limit: limit.toString() } : {})
  });

  const res = await fetch(url, {
    headers: apiHeaders(),
    // Revalidate 0 temporalmente para limpiar la caché de Next.js
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${res.statusText}`);

  return res.json() as Promise<Property[]>;
}

/** Fetch "new in market" properties with server-side pagination. */
export async function getNewProperties(
  page: number,
  pageSize: number,
  saleType?: "Venta" | "Renta"
): Promise<PaginatedProperties> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const url = buildUrl({
    select: "*",
    type: "eq.new",
    ...(saleType ? { sale_type: `eq.${saleType}` } : {}),
    order: "created_at.asc",
  });

  const res = await fetch(url, {
    headers: {
      ...apiHeaders(),
      // Ask PostgREST to return only the requested range
      Range: `${from}-${to}`,
      "Range-Unit": "items",
    },
    // No cache for paginated requests — always fresh from Supabase
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${res.statusText}`);

  // PostgREST returns the total in the Content-Range header: "0-7/18"
  const contentRange = res.headers.get("Content-Range") ?? "";
  const total = parseInt(contentRange.split("/")[1] ?? "0", 10);
  const data: Property[] = await res.json();

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/** Fetch property by Slug including related images */
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const url = buildUrl({
    select: "*, property_images(*)",
    slug: `eq.${slug}`,
  });

  const res = await fetch(url, {
    headers: apiHeaders(),
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${res.statusText}`);

  const data: Property[] = await res.json();
  return data.length > 0 ? data[0] : null;
}

/** Search properties based on various filter parameters */
export async function searchProperties(params: {
  q?: string;
  ubicacion?: string;
  minPrice?: string;
  maxPrice?: string;
  tipoPropiedad?: string;
  beds?: string;
  baths?: string;
  amenities?: string[];
}): Promise<Property[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/properties`);
  
  // Select all properties, but order them
  url.searchParams.set("select", "*");
  url.searchParams.set("order", "created_at.desc");

  // Location search using ilike (case-insensitive)
  if (params.q) {
    // Basic search text
    url.searchParams.set("location", `ilike.%${params.q}%`);
  } else if (params.ubicacion) {
    url.searchParams.set("location", `ilike.%${params.ubicacion}%`);
  }

  // Price filters (assuming price is numeric in DB, but the API might have stored it as string like "1,200,000".
  // Note: if price is stored as string "$1.2M", these numeric filters might not work correctly in Postgres 
  // without casting. We will assume standard comparison works or that the user formats it as string.)
  // However, `price` is of type `string` in `Property`.
  // If price is stored as "1,200,000", we should clean it up for querying, but Supabase might not support filtering formatted strings.
  // We'll leave the price filter commented out or pass it directly.
  /*
  if (params.minPrice) {
    url.searchParams.set("price_num", `gte.${params.minPrice.replace(/\D/g, '')}`);
  }
  if (params.maxPrice) {
    url.searchParams.set("price_num", `lte.${params.maxPrice.replace(/\D/g, '')}`);
  }
  */

  if (params.tipoPropiedad && params.tipoPropiedad !== "Cualquier Tipo" && params.tipoPropiedad !== "Todos") {
    url.searchParams.set("property_type", `eq.${params.tipoPropiedad}`);
  }

  if (params.beds && params.beds.replace(/\D/g, '') !== "") {
    const minBeds = parseInt(params.beds.replace(/\D/g, ''), 10);
    url.searchParams.set("beds", `gte.${minBeds}`);
  }

  if (params.baths && params.baths.replace(/\D/g, '') !== "") {
    const minBaths = parseInt(params.baths.replace(/\D/g, ''), 10);
    url.searchParams.set("baths", `gte.${minBaths}`);
  }
  
  if (params.amenities && params.amenities.length > 0) {
    // Array overlap operator in PostgREST is `ov` (or `cs` contains)
    url.searchParams.set("amenities", `cs.{${params.amenities.join(',')}}`);
  }

  const res = await fetch(url.toString(), {
    headers: apiHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`Supabase error: ${res.status} ${res.statusText}`, await res.text());
    return [];
  }

  return res.json() as Promise<Property[]>;
}
