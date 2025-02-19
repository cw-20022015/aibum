"use client"

import { PersonGroup } from "@/hooks/useFaceApi"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "./input"
import { useState } from "react"

interface PhotoGridProps {
  groups: PersonGroup[]
  onUpdateLabel: (groupId: string, newLabel: string) => void
}

export function PhotoGrid({ groups, onUpdateLabel }: PhotoGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
      {groups.map((group) => (
        <Card key={group.id} className="photo-grid-card border-0">
          <CardHeader className="space-y-2 pb-4">
            {editingId === group.id ? (
              <Input
                value={group.label}
                onChange={(e) => onUpdateLabel(group.id, e.target.value)}
                onBlur={() => setEditingId(null)}
                autoFocus
                className="text-lg font-medium"
              />
            ) : (
              <CardTitle
                className="text-lg cursor-pointer hover:text-primary/80 transition-colors"
                onClick={() => setEditingId(group.id)}
              >
                {group.label}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] w-full rounded-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
                {group.faces.map((face) => (
                  <div
                    key={face.id}
                    className="aspect-square rounded-lg overflow-hidden"
                  >
                    <img
                      src={face.imageUrl}
                      alt={group.label}
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 