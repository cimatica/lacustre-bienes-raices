export type Property = {
  id: string;
  title: string;
  location: string;
  price: string;
  pricePerMonth?: boolean;
  beds: number;
  baths: number;
  area: number;
  imageUrl: string;
  imageAlt: string;
  badge: string;
  type: "featured" | "new";
  saleType: "Venta" | "Renta";
};

export const featuredProperties: Property[] = [
  {
    id: "f1",
    title: "El Pabellón de Cristal",
    location: "Beverly Hills, California",
    price: "$5,250,000",
    beds: 5,
    baths: 4.5,
    area: 4200,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCra-FKp81t0_OM8bWD55m2o9OOSnR_v7D0UilyExMImxyIcr9tIMZ2Py3HcC0ra_MtSsBkduMcwxUNKI9_iSXFFr_YRON1SF9hNM3fcYy-uG7N7uusL0Z367WINi1V7_GwfNQx-gsbUqLtzVi4ivFyqFQGb4qBs79bALeSFb6i3_ZnJnI1VVrN-VeZYHjfYyQI5C6zy90N3uxWZpwzIBhNoUDKKQjQ8EOEYPoyPTzhnh6b6AS3dkkFJ8t4xSDC6qjhMrQUoUPnAeM",
    imageAlt: "Villa moderna de lujo con piscina",
    badge: "Exclusivo",
    type: "featured",
    saleType: "Venta"
  },
  {
    id: "f2",
    title: "Penthouse Azure Heights",
    location: "Centro, Vancouver",
    price: "$3,800,000",
    beds: 3,
    baths: 3,
    area: 2100,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDurAGHzg_fpQxFal-obkFVy1Q3WLPdueAQpz0itcQiRV-WfvulnBEDJbNeV8J06q4mX7PTtXYVJjX4-mHVr_khZLZxQ_s8f6fruGqzeqALyMu8wEHRK1EsOs9f4_jPmS7FxcdzrDkR88Wz0GjaPLXkTZRoJQfur59rxYRLi-WYcW-VU_gKS39CPLOMlftvqGvW0IOk5tXgst5mJ4WQM-ICN4vkdel9ido9YFUQga0OI10i6NSe5W4owt33-2YRi_b_ltdZW2QZC5s",
    imageAlt: "Interior de sala moderna con vista",
    badge: "Nuevo",
    type: "featured",
    saleType: "Venta"
  }
];

export const newInMarketProperties: Property[] = [
  {
    id: "n1",
    title: "Casa Familiar Moderna",
    location: "123 Calle de los Pinos, Seattle",
    price: "$850,000",
    beds: 3,
    baths: 2,
    area: 120,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuQ9M7U6euA6_cXmYuXnej-N5IuawAW8ds-4G1mzfqmiBc13qXsPhf9_j_zTB8gfEunrBHo8xMsxYwCw_pl8fsxbxRkmyvLR1N9Tiye5ZJG7fwlLn9MwyBanXYhE0emGwp59es1FEyQTRQbmXLUKO74Yj34ZHqrqIkOtMKhP8CmRFvfoHT5LAe10105vUhKNkxIBvtt530nfLigSUTemOOcJMVNmsgactntRJUwOBU_TZzND7BYtDklr8uZcNYlQOK5U74-ufIf-E",
    imageAlt: "Fachada de casa blanca moderna",
    badge: "EN VENTA",
    type: "new",
    saleType: "Venta"
  },
  {
    id: "n2",
    title: "Loft Urbano",
    location: "456 Avenida de los Olmos, Portland",
    price: "$3,200",
    pricePerMonth: true,
    beds: 1,
    baths: 1,
    area: 85,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4zNatD3vePhIZAi6OHHJKmamYSgeBNSKjEt32tvkkf4s6aBXCF8R4LNfDfPa9leA0t6N1OKOcP358WwZrnosbCBxSM7EaY2_P7qkx3MinRgmHQn7RvleNTwy8cLigMoR3iv0u83chBVbZYI6BcNMcqv80W-l1pIUgIWZcDIXEqtUatrsojSGfM0lTNDZpkBntBUkRY6NB4ZUymYNYvTHXKbO8NZ6N6uoyuuHqcaRWKzHCNXkOR3p-_EVFAHR8QwijIY_m1mefPZ4",
    imageAlt: "Elegante sala de estar de apartamento",
    badge: "EN RENTA",
    type: "new",
    saleType: "Renta"
  },
  {
    id: "n3",
    title: "Refugio en las Montañas",
    location: "789 Camino de la Montaña, Bend",
    price: "$620,000",
    beds: 2,
    baths: 2,
    area: 98,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARQWC19e7mleUpjb8CWLztEv_svJeRFOaC2i-9r9GctFuX5Barzhfai9wNM1WW8bcGlqdFM32d3KPf7SItom5ijdHOz5rGGQPeT7PlWs8-y9LkfcsHLQqsLxalhxP94XJo76_mAMp7T2dVj3hPKHNzTDLLiS6ujSdSsyo3onxQthp4ZkVE8op92gyTLUUucaGaxO8vJvyhH3HuWB07EPqT1WsW0lr9Of5lUPonjG9eiqE1XiJXTqzXUZQt5JorfPwCO1MioZA_Zro",
    imageAlt: "Cabaña en el bosque exterior",
    badge: "EN VENTA",
    type: "new",
    saleType: "Venta"
  },
  {
    id: "n4",
    title: "Penthouse Vista al Mar",
    location: "321 Drive del Océano, Miami",
    price: "$4,500",
    pricePerMonth: true,
    beds: 3,
    baths: 3,
    area: 180,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGq4Phm0uDzCnjHAsnWpYTBVpOds_M6iOsJuRQQA5eUZHkztGgtc7eh_OE6wBeyW1-iZh7yyhROnvvmqkAZ9tyAWFGXk0FG52zU4kZ_EDLA0U0cRszy7byNXTeWe0_hS53SYmtCTEV8Y1AM-WxiIC38UMa15QwFDjXtCGQOxoh35K0Ol_70vfsxm0VqDbaWkr8tcEbLTLy0NXH_GcpGK4lAXizgxYOIlFWGyau-4OIfPZRpjCBDbz_qu3VlN201UUJGiuM9ajVd-U",
    imageAlt: "Habitación brillante con ventana grande",
    badge: "EN RENTA",
    type: "new",
    saleType: "Renta"
  },
  {
    id: "n5",
    title: "Estudio Central",
    location: "555 Calle Principal, Chicago",
    price: "$550,000",
    beds: 1,
    baths: 1,
    area: 50,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1w-Hb1289NqZKon3VK8bpmMiCDYYiAMT5egzTINo9m9wSZRHv-k-1IGTVoL1NT8YeZXJHa87JPNDIPrtrbP7jChHq0ypXF90uByhC6VA9O788_B4FY8JVg4chbWN9bcrn9-9FvVvfZX8Aj60Iqg_C8CsCA9DEnJqi2rJvzmK5UP5z-9XRTRjBneAPCa8iGgGWBD9yYKsziN6vn0ePBDGo3inieQtmbr46W31p6UfQ649XRxTm7ygOY2J-jxW1r0qWs8i97KGpkTE",
    imageAlt: "Acogedor interior de apartamento",
    badge: "EN VENTA",
    type: "new",
    saleType: "Venta"
  },
  {
    id: "n6",
    title: "Villa Jardín",
    location: "999 Carril de los Robles, Austin",
    price: "$2,800",
    pricePerMonth: true,
    beds: 2,
    baths: 2,
    area: 110,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfGXdY0g51ojSg0GMeTW9ndLY3mpKK3oMtWxo2nwd_dwi1pgn1Boi_ovaDGIFhUA7nwu3WdBch8ZuHxoHu3QfgM5ceAsp8pglRVyCROWNcy9zeDNP2wqLoevyKGcaEyFYHYpIx2KK46nLWthnHiHugmkKw48kJsL8IjMO1bL3T1Zwt8bvQDTTUHTgB3GqZ2RU2asRzF1jVg0rLw3LWXXTq0YF1CsbhlWpYOuCEpH5bB8zkBlbKXR4At_M46AL8rJqn5c6BrPD5PP8",
    imageAlt: "Moderno exterior de hogar minimalista",
    badge: "EN RENTA",
    type: "new",
    saleType: "Renta"
  }
];
