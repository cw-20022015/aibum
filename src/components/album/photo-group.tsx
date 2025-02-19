"use client"

import { StoredPhoto } from "@/lib/storage"
import { PhotoGrid } from "./photo-grid"

interface PhotoGroupProps {
  label: string
  photos: StoredPhoto[]
  showLabel?: boolean
}

export function PhotoGroup({ label, photos, showLabel = false }: PhotoGroupProps) {
  return (
    <div className="space-y-4">
      {showLabel && (
        <h2 className="text-xl font-semibold">{label}</h2>
      )}
      <PhotoGrid photos={photos} />
    </div>
  )
} 