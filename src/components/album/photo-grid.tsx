"use client"

import { StoredPhoto } from "@/lib/storage"

interface PhotoGridProps {
  photos: StoredPhoto[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="aspect-square rounded-lg overflow-hidden shadow-md">
          <img
            src={photo.url}
            alt={photo.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  )
} 