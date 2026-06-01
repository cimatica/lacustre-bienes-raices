// ─── Configuration ────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Types ────────────────────────────────────────────────────────────────────

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
  type: "featured" | "new";
  sale_type: "Venta" | "Renta";
  created_at: string;
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

/** Fetch featured properties (always shown in full, no pagination). */
export async function getFeaturedProperties(): Promise<Property[]> {
  const url = buildUrl({
    select: "*",
    type: "eq.featured",
    order: "created_at.asc",
  });

  const res = await fetch(url, {
    headers: apiHeaders(),
    // Revalidate every 60 seconds (ISR-style caching)
    next: { revalidate: 60 },
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
