"use client"

import { PhotoUpload } from "@/components/ui/photo-upload"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StoredPhoto } from "@/lib/storage"

interface UploadDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (files: File[]) => Promise<void>
}

export function UploadDialog({ isOpen, onOpenChange, onUpload }: UploadDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Upload className="w-4 h-4" />
          사진 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>사진 업로드</DialogTitle>
          <DialogDescription>
            업로드할 사진을 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <PhotoUpload onUpload={onUpload} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 