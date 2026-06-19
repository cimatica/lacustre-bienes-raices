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

export type PropertyType = {
  id: string;
  name: string;
};

export type Property = {
  id: string;
  title: string;
  location: string;
  price: number;
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
  property_type?: string; // This will hold the UUID
  is_active?: boolean;
  property_types?: PropertyType; // When doing foreign key join
  commercial_statuses?: { id: string; name: string };
  description?: string;
  year_built?: number;
  parking?: number;
  host_id?: string;
};

export type PaginatedProperties = {
  data: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  member_since: string;
  preferences?: Record<string, any>;
};

export type Favorite = {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
};

export type Visit = {
  id: string;
  user_id: string;
  property_id: string;
  visit_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  message?: string;
  created_at: string;
  property?: Property;
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
    select: "*, property_types(id, name)",
    is_featured: "eq.true",
    is_active: "eq.true",
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
    select: "*, property_types(id, name)",
    type: "eq.new",
    is_active: "eq.true",
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
    select: "*, property_images(*), property_types(id, name), commercial_statuses(id, name)",
    slug: `eq.${slug}`,
    is_active: "eq.true",
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
  sort?: string;
}): Promise<Property[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/properties`);
  
  // Select all properties, but order them
  url.searchParams.set("select", "*, property_types(id, name)");
  
  if (params.sort === "price_desc") {
    url.searchParams.set("order", "price.desc");
  } else {
    url.searchParams.set("order", "price.asc");
  }

  // Only active properties
  url.searchParams.set("is_active", "eq.true");

  // Location search using ilike (case-insensitive)
  if (params.q) {
    // Basic search text
    url.searchParams.set("location", `ilike.%${params.q}%`);
  } else if (params.ubicacion) {
    url.searchParams.set("location", `ilike.%${params.ubicacion}%`);
  }

  if (params.minPrice) {
    url.searchParams.append("price", `gte.${params.minPrice.replace(/\D/g, '')}`);
  }
  if (params.maxPrice) {
    url.searchParams.append("price", `lte.${params.maxPrice.replace(/\D/g, '')}`);
  }

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

/** Fetch property types */
export async function getPropertyTypes(): Promise<PropertyType[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/property_types`);
  url.searchParams.set("select", "id, name");
  url.searchParams.set("order", "name.asc");

  const res = await fetch(url.toString(), {
    headers: apiHeaders(),
    next: { revalidate: 3600 }, // Cache for 1 hour since types rarely change
  });

  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${res.statusText}`);

  return res.json() as Promise<PropertyType[]>;
}

// ─── User, Favorites and Visits ──────────────────────────────────────────────

/** Fetch user profile */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const url = buildUrl({ select: "*" });
  const finalUrl = url.replace('/properties?', '/user_profiles?id=eq.' + userId + '&');
  
  const res = await fetch(finalUrl, {
    headers: apiHeaders(),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

/** Fetch user favorites */
export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  const url = buildUrl({ select: "*, property:properties(*, property_images(*), property_types(id, name))" });
  const finalUrl = url.replace('/properties?', '/favorites?user_id=eq.' + userId + '&');
  
  const res = await fetch(finalUrl, {
    headers: apiHeaders(),
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json() as Promise<Favorite[]>;
}

/** Fetch user visits */
export async function getUserVisits(userId: string): Promise<Visit[]> {
  const url = buildUrl({ select: "*, property:properties(*, property_images(*), property_types(id, name))" });
  const finalUrl = url.replace('/properties?', '/visits?user_id=eq.' + userId + '&order=visit_date.asc&status=eq.scheduled&');
  
  const res = await fetch(finalUrl, {
    headers: apiHeaders(),
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json() as Promise<Visit[]>;
}

/** Schedule a visit */
export async function scheduleVisit(visit: Omit<Visit, 'id' | 'created_at'>): Promise<boolean> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/visits`);
  
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      ...apiHeaders(),
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(visit)
  });

  return res.ok;
}

/** Toggle favorite */
export async function toggleFavorite(userId: string, propertyId: string, isCurrentlyFavorite: boolean): Promise<boolean> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/favorites`);
  
  if (isCurrentlyFavorite) {
    url.searchParams.set("user_id", `eq.${userId}`);
    url.searchParams.set("property_id", `eq.${propertyId}`);
    
    const res = await fetch(url.toString(), {
      method: 'DELETE',
      headers: apiHeaders()
    });
    return res.ok;
  } else {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        ...apiHeaders(),
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ user_id: userId, property_id: propertyId })
    });
    return res.ok;
  }
}
