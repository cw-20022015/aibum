"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "./card"
import { Button } from "./button"
import { Upload, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PhotoUploadProps {
  onUpload: (files: File[]) => void
}

export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [previewFiles, setPreviewFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const urls = acceptedFiles.map(file => URL.createObjectURL(file))
    setPreviewFiles(acceptedFiles)
    setPreviewUrls(urls)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: handleDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  })

  const handleConfirm = () => {
    onUpload(previewFiles)
    setPreviewFiles([])
    setPreviewUrls([])
  }

  const handleCancel = () => {
    setPreviewFiles([])
    setPreviewUrls([])
  }

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div {...getRootProps()} className="upload-zone">
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-6">
              <Upload className="w-16 h-16 text-muted-foreground/60" />
              {isDragActive ? (
                <p className="text-xl font-medium text-primary">
                  사진을 여기에 놓아주세요...
                </p>
              ) : (
                <div className="text-center space-y-6">
                  <p className="text-lg text-muted-foreground">
                    사진을 드래그하여 놓거나 클릭하여 선택해주세요
                  </p>
                  <Button variant="secondary" size="lg" className="px-8">
                    사진 선택하기
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewUrls.length > 0} onOpenChange={handleCancel}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>사진 업로드 확인</DialogTitle>
            <DialogDescription>
              선택한 사진들을 업로드하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {previewUrls.map((url, index) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>취소</Button>
            <Button onClick={handleConfirm}>업로드</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 