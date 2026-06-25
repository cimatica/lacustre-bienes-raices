"use client";

import { useState } from "react";
import { toggleFavoriteAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useAlert } from "@/app/components/ui/AlertProvider";

interface FavoriteButtonProps {
  propertyId: string;
  userId?: string;
  initialIsFavorite?: boolean;
  className?: string;
}

export default function FavoriteButton({ propertyId, userId, initialIsFavorite = false, className = "" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      showAlert("Inicia sesión", "Debes iniciar sesión para guardar esta propiedad en tus favoritos.", "warning");
      router.push("/login");
      return;
    }

    if (isPending) return;

    setIsPending(true);
    // Optimistic UI update
    setIsFavorite(!isFavorite);

    const success = await toggleFavoriteAction(propertyId, isFavorite);
    
    if (!success) {
      // Revert if failed
      setIsFavorite(isFavorite);
      showAlert("Error", "Hubo un error al actualizar tus favoritos.", "error");
    }
    
    setIsPending(false);
  };

  return (
    <button 
      onClick={handleToggle}
      className={`flex items-center justify-center transition-all ${className} ${isFavorite ? "text-red-500" : "text-white hover:text-red-400"}`}
      title={isFavorite ? "Quitar de guardados" : "Guardar propiedad"}
    >
      <span className="material-icons text-xl">{isFavorite ? "favorite" : "favorite_border"}</span>
    </button>
  );
}
