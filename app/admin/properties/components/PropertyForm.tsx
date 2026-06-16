"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Property, PropertyImage } from "@/lib/supabase";
import dynamic from "next/dynamic";

// Dynamically import LocationPicker to prevent SSR issues with Leaflet
const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

type PropertyFormProps = {
  initialData?: Property;
  propertyId?: string;
};

type GalleryImageState = {
  id?: string; // DB id if exists
  url: string; // Public URL or Object URL for preview
  file?: File; // The actual file if it's new
  isDeleted?: boolean; // Mark for deletion
};

export default function PropertyForm({ initialData, propertyId }: PropertyFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!initialData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    price: initialData?.price || 0,
    price_per_month: initialData?.price_per_month || false,
    sale_type: initialData?.sale_type || "Venta",
    property_type: initialData?.property_type || "apartment",
    description: initialData?.description || "",
    location: initialData?.location || "",
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    area: initialData?.area || 0,
    year_built: initialData?.year_built || new Date().getFullYear(),
    beds: initialData?.beds || 1,
    baths: initialData?.baths || 1,
    parking: initialData?.parking || 0,
    amenities: initialData?.amenities || ([] as string[]),
    type: initialData?.type || "new",
    is_featured: initialData?.is_featured || false,
    badge: initialData?.badge || "Nuevo",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(initialData?.image_url || null);
  
  const [gallery, setGallery] = useState<GalleryImageState[]>(
    initialData?.property_images?.map(img => ({ id: img.id, url: img.image_url })) || []
  );

  // Handlers for inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: type === "number" ? Number(value) : value }));
    }
  };

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: address
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] };
      }
    });
  };

  const increment = (field: "beds" | "baths" | "parking") => {
    setFormData((prev) => ({ ...prev, [field]: prev[field] + 1 }));
  };

  const decrement = (field: "beds" | "baths" | "parking") => {
    setFormData((prev) => ({ ...prev, [field]: Math.max(0, prev[field] - 1) }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen principal excede el límite de 5MB");
        return;
      }
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const activeImages = gallery.filter(img => !img.isDeleted);
      
      if (activeImages.length + filesArray.length > 9) {
        alert("Puedes subir un máximo de 9 imágenes extra para la galería (10 en total contando la principal)");
        return;
      }

      const newGallery = filesArray.map(file => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`La imagen ${file.name} excede el límite de 5MB y no será agregada.`);
          return null;
        }
        return {
          file,
          url: URL.createObjectURL(file)
        };
      }).filter(Boolean) as GalleryImageState[];

      setGallery([...gallery, ...newGallery]);
    }
  };

  const markGalleryImageDeleted = (index: number) => {
    const newGallery = [...gallery];
    if (newGallery[index].id) {
      newGallery[index].isDeleted = true; // Mark existing DB image for deletion
    } else {
      newGallery.splice(index, 1); // Remove new unsaved image
    }
    setGallery(newGallery);
  };

  const extractPathFromUrl = (url: string) => {
    const parts = url.split('/property_images/');
    return parts.length > 1 ? parts[1] : null;
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('property_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const validateForm = () => {
    if (formData.title.length < 5) return "El título debe tener al menos 5 caracteres.";
    if (formData.price <= 0) return "El precio debe ser mayor a 0.";
    if (!formData.location) return "Debes buscar y seleccionar una ubicación válida en el mapa.";
    if (!mainImagePreview) return "Debes subir al menos la imagen principal de la propiedad.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const actualPropertyId = isEditing ? propertyId : crypto.randomUUID();
      let mainImageUrl = initialData?.image_url || "";

      // 1. Upload new main image
      if (mainImage) {
        const uploadedUrl = await uploadImage(mainImage, 'main');
        if (uploadedUrl) {
          mainImageUrl = uploadedUrl;
          // Optionally delete old main image if editing and it's changed
          if (isEditing && initialData?.image_url) {
            const oldPath = extractPathFromUrl(initialData.image_url);
            if (oldPath) await supabase.storage.from('property_images').remove([oldPath]);
          }
        } else {
          throw new Error("No se pudo subir la imagen principal");
        }
      }

      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      const propertyData = {
        title: formData.title,
        price: formData.price,
        price_per_month: formData.price_per_month,
        sale_type: formData.sale_type,
        property_type: formData.property_type,
        description: formData.description,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        area: formData.area,
        year_built: formData.year_built,
        beds: formData.beds,
        baths: formData.baths,
        parking: formData.parking,
        amenities: formData.amenities,
        type: formData.type,
        is_featured: formData.is_featured,
        badge: formData.badge,
        image_url: mainImageUrl,
        image_alt: formData.title,
        slug: slug,
        ...(isEditing ? {} : { id: actualPropertyId }),
      };

      // 2. Save Property Data
      if (isEditing) {
        const { error } = await supabase.from("properties").update(propertyData).eq("id", actualPropertyId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("properties").insert([propertyData]);
        if (error) throw error;
      }

      // 3. Process Gallery Images (Deletions & Uploads)
      for (const item of gallery) {
        if (item.isDeleted && item.id) {
          // Delete from storage
          const filePath = extractPathFromUrl(item.url);
          if (filePath) {
            await supabase.storage.from('property_images').remove([filePath]);
          }
          // Delete from db
          await supabase.from('property_images').delete().eq('id', item.id);
        } else if (item.file && !item.isDeleted) {
          // Upload new gallery image
          const uploadedUrl = await uploadImage(item.file, 'gallery');
          if (uploadedUrl) {
            await supabase.from('property_images').insert([{
              property_id: actualPropertyId,
              image_url: uploadedUrl,
              image_alt: formData.title + ' gallery image',
              is_main: false,
              order_index: 0
            }]);
          }
        }
      }

      router.push("/admin/properties");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al guardar la propiedad");
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const commonAmenities = ["Piscina", "Jardín", "Aire Acondicionado", "Smart Home", "Seguridad 24/7", "Gimnasio", "Quincho"];
  const activeGallery = gallery.map((item, i) => ({ ...item, originalIndex: i })).filter(item => !item.isDeleted);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pb-20">
      {error && (
        <div className="xl:col-span-12 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      <div className="xl:col-span-8 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-[#D9ECC8]/30 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
              <span className="material-icons text-lg">info</span>
            </div>
            <h2 className="text-xl font-bold text-[#19322F]">Información Básica</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-[#19322F] mb-1.5" htmlFor="title">Título de Propiedad <span className="text-red-500">*</span></label>
              <input required minLength={5} value={formData.title} onChange={handleChange} className="w-full text-base px-4 py-2.5 rounded-md border border-gray-200 bg-white text-[#19322F] placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all" id="title" placeholder="Ej. Penthouse Moderno con Vista al Mar" type="text" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#19322F] mb-1.5" htmlFor="price">Precio <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">UF</span>
                  <input required min={0} value={formData.price} onChange={handleChange} className="w-full pl-9 pr-4 py-2.5 rounded-md border border-gray-200 bg-white text-[#19322F] placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base font-medium" id="price" placeholder="0.00" type="number" />
                </div>
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" id="price_per_month" checked={formData.price_per_month} onChange={handleChange} className="rounded text-[#006655] focus:ring-[#006655]" />
                  Precio por Mes
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#19322F] mb-1.5" htmlFor="sale_type">Tipo de Operación</label>
                <select value={formData.sale_type} onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-[#19322F] focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base cursor-pointer" id="sale_type">
                  <option value="Venta">Venta</option>
                  <option value="Renta">Renta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#19322F] mb-1.5" htmlFor="property_type">Tipo de Propiedad</label>
                <select value={formData.property_type} onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-[#19322F] focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base cursor-pointer" id="property_type">
                  <option value="apartment">Departamento</option>
                  <option value="house">Casa</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terreno</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-[#19322F] mb-1.5" htmlFor="badge">Etiqueta (Badge)</label>
                <input value={formData.badge} onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-[#19322F] placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all" id="badge" placeholder="Ej. Nuevo, Exclusivo" type="text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#19322F] mb-1.5" htmlFor="type">Clasificación</label>
                <select value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-[#19322F] focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base cursor-pointer" id="type">
                  <option value="new">Nuevo</option>
                  <option value="featured">Destacado</option>
                </select>
              </div>
              <div className="flex items-center mt-7">
                <label className="flex items-center gap-2 text-sm font-medium text-[#19322F] cursor-pointer">
                  <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-5 h-5 rounded text-[#006655] focus:ring-[#006655]" />
                  Propiedad Destacada
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-[#D9ECC8]/30 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
              <span className="material-icons text-lg">description</span>
            </div>
            <h2 className="text-xl font-bold text-[#19322F]">Descripción</h2>
          </div>
          <div className="p-8">
            <textarea value={formData.description} onChange={handleChange} required className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-[#19322F] placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base leading-relaxed resize-y min-h-[200px]" id="description" placeholder="Describe la propiedad..."></textarea>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-[#D9ECC8]/30 flex justify-between items-center bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
                <span className="material-icons text-lg">image</span>
              </div>
              <h2 className="text-xl font-bold text-[#19322F]">Galería de Imágenes</h2>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">JPG, PNG, WEBP</span>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Main Image Block */}
              <div className="col-span-2 md:col-span-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-6 text-center hover:bg-[#D9ECC8]/10 hover:border-[#006655]/40 transition-colors cursor-pointer group relative">
                <input onChange={handleMainImageChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" />
                {!mainImagePreview ? (
                  <div className="flex flex-col items-center justify-center space-y-3 py-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#006655] group-hover:scale-110 transition-transform duration-300">
                      <span className="material-icons text-2xl">cloud_upload</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-medium text-[#19322F]">Imagen Principal</p>
                      <p className="text-xs text-gray-400">Tamaño máximo 5MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden group/img">
                    <img src={mainImagePreview} alt="Principal" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-white text-[#19322F] px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                        <span className="material-icons text-sm">edit</span> Cambiar
                      </span>
                    </div>
                    <span className="absolute top-3 left-3 bg-[#006655] text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm uppercase tracking-wider">Principal</span>
                  </div>
                )}
              </div>

              {/* Gallery List */}
              {activeGallery.map((item) => (
                <div key={item.originalIndex} className="aspect-square rounded-lg overflow-hidden relative group shadow-sm bg-gray-100 border border-gray-200">
                  <img src={item.url} alt="Gallery" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#19322F]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button type="button" onClick={() => markGalleryImageDeleted(item.originalIndex)} className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Gallery Image Button */}
              {activeGallery.length < 9 && (
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-[#006655] hover:border-[#006655] hover:bg-[#D9ECC8]/20 transition-all group relative cursor-pointer">
                  <input multiple onChange={handleGalleryChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" />
                  <span className="material-icons text-2xl group-hover:scale-110 transition-transform">add_photo_alternate</span>
                  <span className="text-xs mt-2 font-medium px-2 text-center">Añadir más imágenes</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 text-right">Mostrando {activeGallery.length + (mainImagePreview ? 1 : 0)} de 10 imágenes máximas permitidas.</p>
          </div>
        </div>
      </div>
      
      <div className="xl:col-span-4 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D9ECC8]/30 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
              <span className="material-icons text-lg">place</span>
            </div>
            <h2 className="text-lg font-bold text-[#19322F]">Ubicación</h2>
          </div>
          <div className="p-6">
            <LocationPicker 
              initialLat={formData.latitude} 
              initialLng={formData.longitude} 
              initialAddress={formData.location} 
              onLocationChange={handleLocationChange} 
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D9ECC8]/30 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
              <span className="material-icons text-lg">straighten</span>
            </div>
            <h2 className="text-lg font-bold text-[#19322F]">Detalles</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="text-xs text-gray-500 font-medium mb-1 block" htmlFor="area">Área (m²)</label>
                <input min={0} value={formData.area} onChange={handleChange} className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-[#19322F] focus:bg-white focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-sm" id="area" type="number" />
              </div>
              <div className="group">
                <label className="text-xs text-gray-500 font-medium mb-1 block" htmlFor="year_built">Año de Constr.</label>
                <input min={1800} max={new Date().getFullYear() + 5} value={formData.year_built} onChange={handleChange} className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-[#19322F] focus:bg-white focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-sm" id="year_built" type="number" />
              </div>
            </div>
            <hr className="border-gray-100" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#19322F] flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">bed</span> Habitaciones
                </label>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                  <button type="button" onClick={() => decrement("beds")} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100">-</button>
                  <input readOnly value={formData.beds} className="w-10 text-center border-none bg-transparent text-[#19322F] p-0 focus:ring-0 text-sm font-medium" type="text" />
                  <button type="button" onClick={() => increment("beds")} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#19322F] flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">shower</span> Baños
                </label>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                  <button type="button" onClick={() => decrement("baths")} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100">-</button>
                  <input readOnly value={formData.baths} className="w-10 text-center border-none bg-transparent text-[#19322F] p-0 focus:ring-0 text-sm font-medium" type="text" />
                  <button type="button" onClick={() => increment("baths")} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#19322F] flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">directions_car</span> Estacionamientos
                </label>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                  <button type="button" onClick={() => decrement("parking")} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100">-</button>
                  <input readOnly value={formData.parking} className="w-10 text-center border-none bg-transparent text-[#19322F] p-0 focus:ring-0 text-sm font-medium" type="text" />
                  <button type="button" onClick={() => increment("parking")} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100">+</button>
                </div>
              </div>
            </div>
            <hr className="border-gray-100" />
            <div>
              <h3 className="text-sm font-bold text-[#19322F] mb-3 uppercase tracking-wider text-xs text-gray-500">Amenidades</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {commonAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 text-[#006655] border-gray-300 rounded focus:ring-[#006655]" 
                    />
                    <span className="text-sm text-gray-700 group-hover:text-[#19322F] transition-colors">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-gray-200">
              <button disabled={loading} type="submit" className="w-full py-3 rounded-lg bg-[#006655] text-white font-medium shadow-md hover:bg-[#004d40] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? (
                   <span className="material-icons animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-icons text-sm">save</span>
                )}
                {isEditing ? "Actualizar Propiedad" : "Guardar Propiedad"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
