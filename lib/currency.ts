export async function getUfValue(): Promise<number> {
  try {
    const res = await fetch("https://mindicador.cl/api/uf", {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) throw new Error("Failed to fetch UF");
    const data = await res.json();
    if (data && data.serie && data.serie.length > 0) {
      return data.serie[0].valor;
    }
    throw new Error("Invalid data format");
  } catch (error) {
    console.error("Error fetching UF:", error);
    return 38000; // Fallback value if API fails
  }
}

export function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatUF(value: number): string {
  return `UF ${new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(value)}`;
}
