"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { StoredPhoto } from "@/lib/storage"
import { ScrollArea } from "./scroll-area"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface PhotoListProps {
  photos: StoredPhoto[]
}

export function PhotoList({ photos }: PhotoListProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>업로드된 사진</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-sm font-medium truncate">{photo.name}</p>
                    <p className="text-xs text-gray-300">
                      {formatDistanceToNow(photo.createdAt, { addSuffix: true, locale: ko })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 