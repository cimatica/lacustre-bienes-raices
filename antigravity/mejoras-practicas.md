# Guía Técnica y Checklist: Portal Inmobiliario Moderno (Chile)

Este documento establece los estándares de ingeniería y mejores prácticas para el desarrollo de un portal inmobiliario de venta y arriendo enfocado en el mercado chileno. El stack definido es **Next.js (App Router), TypeScript, Tailwind CSS y PostgreSQL**.

---

## 1. Arquitectura y Rendimiento

* **Práctica:** Server Components por Defecto
  * **Impacto y Etapa:** Alto | MVP
  * **Por qué importa:** Reduce drásticamente el JavaScript enviado al cliente, permitiendo cargas casi instantáneas de catálogos y mejorando el SEO (clave en Real Estate).
  * **Cómo se hace en Next.js:** Mantener toda la estructura en Server Components. Solo usar la directiva `'use client'` en componentes estrictamente interactivos (como carruseles de fotos, mapas o filtros dinámicos).
  * **Anti-patrón:** Envolver el `layout.tsx` principal o la ficha completa de la propiedad con `'use client'`, perdiendo los beneficios de renderizado en servidor.

* **Práctica:** Optimización Extrema con Next Image
  * **Impacto y Etapa:** Alto | Producción
  * **Por qué importa:** Las imágenes son el mayor cuello de botella en portales inmobiliarios. Servir formatos modernos (WebP/AVIF) y lazy loading automático protege el LCP (Largest Contentful Paint).
  * **Cómo se hace en Next.js:** 
    ```tsx
    import Image from 'next/image';
    <Image 
      src={propiedad.fotoPrincipal} 
      alt={`Departamento en ${propiedad.comuna}`} 
      width={800} height={600} 
      sizes="(max-width: 768px) 100vw, 50vw" 
      placeholder="blur" 
    />
    ```
  * **Anti-patrón:** Usar la etiqueta `<img>` estándar o renderizar galerías de 20 fotos en alta resolución sin el atributo `sizes`, descargando megabytes innecesarios en móviles.

* **Práctica:** Incremental Static Regeneration (ISR) para Fichas
  * **Impacto y Etapa:** Alto | Escalabilidad
  * **Por qué importa:** Sirve las páginas de propiedades desde la CDN (ultrarrápido) y actualiza en segundo plano cuando cambia el precio o estado (ej. "Vendido").
  * **Cómo se hace en Next.js:** En la ruta `app/propiedad/[id]/page.tsx`, exportar la variable de revalidación.
    ```tsx
    export const revalidate = 3600; // Regenerar máximo 1 vez por hora
    ```
  * **Anti-patrón:** Usar Server-Side Rendering (SSR) puro o cargar los detalles de una propiedad en el cliente (CSR) mostrando un spinner (loading).

---

## 2. UX, Buscador y Mapas

* **Práctica:** Filtros Sincronizados en la URL (searchParams)
  * **Impacto y Etapa:** Alto | MVP
  * **Por qué importa:** Permite a los usuarios compartir URLs exactas (ej. "Depto 2D/2B en Providencia") y asegura que al volver atrás en el navegador, no pierdan su búsqueda.
  * **Cómo se hace en Next.js:** Actualizar la URL usando `useRouter()`. Luego, leer los `searchParams` directamente desde el Server Component en `page.tsx` para hacer la query a PostgreSQL.
  * **Anti-patrón:** Manejar el estado del filtro (precio, comuna) exclusivamente con `useState` o Redux sin reflejarlo en la URL.

* **Práctica:** Carga Diferida (Lazy Loading) de Mapas
  * **Impacto y Etapa:** Alto | Producción
  * **Por qué importa:** Los scripts de mapas (Google Maps / Mapbox) son pesados y bloquean el hilo principal, destruyendo métricas como el TTI y TBT.
  * **Cómo se hace en Next.js:** Cargar el componente del mapa dinámicamente, sin SSR, y solo cuando esté cerca de entrar al viewport.
    ```tsx
    import dynamic from 'next/dynamic';
    const MapaInmobiliario = dynamic(() => import('@/components/Mapa'), { ssr: false, loading: () => <SkeletonMapa /> });
    ```
  * **Anti-patrón:** Incluir la API de mapas en el `<head>` del layout principal, bloqueando el renderizado de toda la aplicación.

* **Práctica:** UI Optimista en Agendamientos e Interacciones
  * **Impacto y Etapa:** Medio | Escalabilidad
  * **Por qué importa:** Guardar a "Favoritos" o iniciar un agendamiento debe sentirse instantáneo para no frenar el impulso del comprador/arrendatario.
  * **Cómo se hace en Next.js:** Usar el hook `useOptimistic` de React junto con Server Actions para actualizar el botón de "Favorito" visualmente de inmediato, mientras la petición va en background.
  * **Anti-patrón:** Bloquear toda la pantalla con un spinner modal mientras se espera la confirmación de la base de datos de que la propiedad fue guardada.

---

## 3. SEO Técnico y Local

* **Práctica:** Metadatos Dinámicos por Propiedad
  * **Impacto y Etapa:** Alto | MVP
  * **Por qué importa:** Aumenta el CTR (Click-Through Rate) en Google y genera previsualizaciones atractivas cuando se comparte por WhatsApp, factor clave en la venta.
  * **Cómo se hace en Next.js:** Utilizar la función `generateMetadata` en la ruta dinámica.
    ```tsx
    export async function generateMetadata({ params }: Props): Promise<Metadata> {
      const prop = await getPropiedad(params.id);
      return {
        title: `${prop.tipo} ${prop.dormitorios}D/${prop.banos}B en ${prop.comuna} - $${prop.precio}`,
        openGraph: { images: [prop.imagenPrincipal] }
      }
    }
    ```
  * **Anti-patrón:** Tener títulos estáticos como "Portal Inmuebles | Detalle de Propiedad" en todo el catálogo.

* **Práctica:** Sitemaps Dinámicos y Paginados
  * **Impacto y Etapa:** Alto | Escalabilidad
  * **Por qué importa:** Con miles de propiedades activas e inactivas, el crawler de Google necesita indexar inteligentemente sin exceder los límites de URLs por archivo.
  * **Cómo se hace en Next.js:** Crear un archivo `app/sitemap.ts` que consulte la base de datos. Para grandes volúmenes, usar la función `generateSitemaps` para segmentar (ej. un sitemap por región o comuna).
  * **Anti-patrón:** Generar un único sitemap estático o no incluir la fecha de última modificación (`lastModified`) de la propiedad.

* **Práctica:** Jerarquía de Rutas Semánticas (Friendly URLs)
  * **Impacto y Etapa:** Medio | Producción
  * **Por qué importa:** Posiciona mejor para búsquedas locales y es más legible para el usuario final.
  * **Cómo se hace en Next.js:** Implementar un sistema de rutas Catch-all o estructuradas: `/app/[operacion]/[tipo]/[region]/[comuna]/page.tsx` para generar URLs como `/venta/departamento/metropolitana/nunoa`.
  * **Anti-patrón:** Utilizar parámetros en query string para la navegación principal, como `/buscar?op=venta&tipo=depto&comuna=nunoa`.

---

## 4. Captación de Leads e Integración CRM

* **Práctica:** Formularios Seguros con Server Actions
  * **Impacto y Etapa:** Alto | MVP
  * **Por qué importa:** Simplifica la arquitectura evitando crear endpoints en `/api` separados, y ejecuta la lógica directamente en el servidor.
  * **Cómo se hace en Next.js:** Crear funciones asíncronas con `'use server'` que reciban el `FormData`, muten la base de datos de leads y ejecuten revalidación de caché si es necesario.
  * **Anti-patrón:** Exponer los tokens de API de CRMs (como Hubspot, Tokko Broker o EasyBroker) en componentes cliente para enviar el lead directo desde el navegador.

* **Práctica:** Validación Robusta con Zod
  * **Impacto y Etapa:** Alto | Producción
  * **Por qué importa:** Previene inyección de datos y asegura que los leads (RUT, teléfonos chilenos, correos) tengan formato correcto antes de golpear la base de datos o el CRM.
  * **Cómo se hace en Next.js:** Definir el esquema Zod y validarlo dentro del Server Action.
    ```typescript
    const leadSchema = z.object({
      rut: z.string().regex(/^[0-9]+-[0-9kK]{1}$/, "RUT inválido"),
      telefono: z.string().startsWith("+569", "Debe ser móvil chileno"),
      // ...
    });
    ```
  * **Anti-patrón:** Depender únicamente de la validación HTML (`required`, `type="email"`) la cual puede ser omitida fácilmente.

* **Práctica:** Almacenamiento Previo y Webhooks Resilientes
  * **Impacto y Etapa:** Medio | Escalabilidad
  * **Por qué importa:** Las APIs de CRMs de terceros pueden fallar. Si un cliente interesado en una propiedad de 10.000 UF envía sus datos, no se pueden perder.
  * **Cómo se hace en Next.js:** En el Server Action, **primero** insertar el lead en PostgreSQL (tabla `leads`). Solo después intentar enviar al CRM, idealmente usando una cola de tareas o manejando reintentos (Upstash QStash, o similar).
  * **Anti-patrón:** Intentar enviar al CRM síncronamente y, si falla, retornar un error 500 perdiendo la información del prospecto.

---

## 5. Infraestructura y Seguridad

* **Práctica:** Estrategia de Connection Pooling en PostgreSQL
  * **Impacto y Etapa:** Alto | Escalabilidad
  * **Por qué importa:** Next.js en Vercel (o entornos serverless) abre y cierra contenedores constantemente. Sin un pooler, se agotarán rápidamente las conexiones máximas de la base de datos, botando el sitio.
  * **Cómo se hace en Next.js:** Conectarse usando PgBouncer o servicios que incluyan pooling (Supabase, Neon). Si usas Prisma, usar el Prisma Accelerate o la URL de pooler en el `.env`.
  * **Anti-patrón:** Usar la conexión directa de sesión a PostgreSQL (`postgresql://...`) en funciones Serverless con alto tráfico concurrente.

* **Práctica:** Data Cache para Configuraciones Globales
  * **Impacto y Etapa:** Medio | Producción
  * **Por qué importa:** Las listas de comunas, tipos de propiedades y variables globales no cambian casi nunca. Hacer queries a PostgreSQL por cada visita es ineficiente.
  * **Cómo se hace en Next.js:** Usar `unstable_cache` o la caché de `fetch` para guardar los resultados de estas consultas en memoria/CDN.
    ```tsx
    const getComunas = unstable_cache(
      async () => await db.select().from(comunas),
      ['comunas-list'],
      { revalidate: 86400 } // 1 día
    );
    ```
  * **Anti-patrón:** Consultar la base de datos para obtener el menú principal o lista de regiones en cada request de SSR.

* **Práctica:** Validación Estricta de Variables de Entorno
  * **Impacto y Etapa:** Alto | MVP
  * **Por qué importa:** Asegura que el portal no levante en producción sin claves críticas (API de mapas, credenciales de DB, tokens de correo) y evita exponer secretos.
  * **Cómo se hace en Next.js:** Usar librerías como `@t3-oss/env-nextjs` para crear un esquema Zod que valide que el archivo `.env` contenga todo lo necesario durante el build. Usar el prefijo `NEXT_PUBLIC_` estrictamente para claves que el cliente debe conocer (ej. token de Mapbox).
  * **Anti-patrón:** Subir por error archivos `.env` o `.env.local` al repositorio de código o usar `process.env.SECRET` en Client Components.

---

## 6. Manejo de Errores y Excepciones

* **Práctica:** Fronteras de Error (Error Boundaries) a Nivel de Ruta
  * **Impacto y Etapa:** Alto | Producción
  * **Por qué importa:** Evita que toda la aplicación colapse (pantalla en blanco) cuando ocurre un error en un componente o falla una petición externa. Mantiene intactos el layout y la navegación (navbar/footer).
  * **Cómo se hace en Next.js:** Crear archivos `error.tsx` en las rutas clave. Utilizar el estado del error para determinar si es un problema de red (offline) o de servidor, y ofrecer un botón para reintentar (`reset()`).
  * **Anti-patrón:** Dejar que las excepciones no controladas lleguen al root sin manejar, o usar `window.alert` en lugar de una interfaz amigable.

* **Práctica:** Páginas Personalizadas para Rutas Inexistentes
  * **Impacto y Etapa:** Medio | MVP
  * **Por qué importa:** Mejora la experiencia del usuario y el SEO cuando visitan URLs rotas o propiedades que ya fueron eliminadas.
  * **Cómo se hace en Next.js:** Implementar el archivo `not-found.tsx` con llamadas claras a la acción (ej. "Volver al inicio" o "Buscar otras propiedades").
