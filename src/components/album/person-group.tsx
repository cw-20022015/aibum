"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { StoredPhoto } from "@/lib/storage"
import { PhotoGrid } from "./photo-grid"

interface PersonGroupProps {
  groupId: string
  label: string
  photos: StoredPhoto[]
  showFaces?: boolean
  onLabelChange: (groupId: string, newLabel: string) => void
}

export function PersonGroup({ 
  groupId, 
  label, 
  photos, 
  showFaces = false,
  onLabelChange 
}: PersonGroupProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedLabel, setEditedLabel] = useState(label)

  const handleLabelSave = () => {
    onLabelChange(groupId, editedLabel)
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isEditing ? (
          <Input
            value={editedLabel}
            onChange={(e) => setEditedLabel(e.target.value)}
            onBlur={handleLabelSave}
            onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
            className="max-w-[200px]"
            autoFocus
          />
        ) : (
          <h2 
            className="text-xl font-semibold cursor-pointer hover:text-primary/80"
            onClick={() => setIsEditing(true)}
          >
            {label}
          </h2>
        )}
      </div>
      <PhotoGrid photos={photos} showFaces={showFaces} />
    </div>
  )
} 