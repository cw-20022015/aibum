"use client"

import { PhotoUpload } from "@/components/ui/photo-upload"
import { useFaceApi } from "@/hooks/useFaceApi"
import { PhotoGrid } from "@/components/ui/photo-grid"
import { PhotoList } from "@/components/ui/photo-list"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@/lib/storage"
import { useEffect, useState } from "react"

export default function UploadPage() {
  const { isLoaded, detectFaces, groupFaces, personGroups, updatePersonLabel } =
    useFaceApi()
  const { toast } = useToast()
  const [photos, setPhotos] = useState(storage.getPhotos())

  useEffect(() => {
    setPhotos(storage.getPhotos())
  }, [])

  const handleUpload = async (files: File[]) => {
    if (!isLoaded) {
      toast({
        title: "AI 모델 로딩 중",
        description: "잠시만 기다려주세요...",
        variant: "destructive",
      })
      return
    }

    try {
      for (const file of files) {
        // FileReader를 사용하여 파일을 base64로 변환
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        await new Promise((resolve) => {
          reader.onload = async (e) => {
            const imageUrl = e.target?.result as string;
            
            // 로컬스토리지에 사진 정보 저장
            const newPhoto = {
              id: Math.random().toString(36).substring(2, 9),
              url: imageUrl, // base64 문자열 저장
              name: file.name,
              createdAt: Date.now(),
            }
            
            storage.addPhoto(newPhoto)
            setPhotos(prev => [...prev, newPhoto])

            // 얼굴 감지 및 그룹화
            const detectedFaces = await detectFaces(imageUrl)
            if (detectedFaces.length > 0) {
              await groupFaces(detectedFaces)
              
              storage.updatePhoto(newPhoto.id, {
                faces: detectedFaces.map(face => ({
                  id: face.id,
                  groupId: personGroups.find(g => 
                    g.faces.some(f => f.descriptor === face.descriptor)
                  )?.id || ''
                }))
              })
            }
            resolve(null);
          };
        });
      }

      toast({
        title: "업로드 완료",
        description: "사진이 성공적으로 업로드되었습니다.",
      })
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "업로드 실패",
        description: "사진 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">
          사진 업로드
        </h1>
        
        <div className="max-w-xl mx-auto">
          <PhotoUpload onUpload={handleUpload} />
        </div>

        <PhotoList photos={photos} />

        <div className="mt-8">
          <PhotoGrid groups={personGroups} onUpdateLabel={updatePersonLabel} />
        </div>
      </div>
    </div>
  )
}
