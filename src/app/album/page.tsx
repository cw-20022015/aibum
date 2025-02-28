"use client"

import { storage, StoredPhoto } from "@/lib/storage"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { FilterMenu } from "@/components/ui/filter-menu"
import { UploadDialog } from "@/components/album/upload-dialog"
import { PhotoGroup } from "@/components/album/photo-group"
import { useFaceApi } from "@/hooks/useFaceApi"
import * as faceapi from 'face-api.js'
import { PersonGroup } from "@/components/album/person-group"

type FilterType = 'none' | 'date' | 'people';

export default function AlbumPage() {
  const [photos, setPhotos] = useState<StoredPhoto[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('none')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()
  const { isLoaded, detectFaces, groupFaces, personGroups, updateGroupLabel } = useFaceApi()

  const loadPhotos = () => {
    const storedPhotos = storage.getPhotos();
    setPhotos(storedPhotos);
  }

  useEffect(() => {
    loadPhotos();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aibum_photos') {
        loadPhotos();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleUpload = async (files: File[]) => {
    try {
      const uploadPromises = files.map((file) => {
        return new Promise<StoredPhoto>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            const newPhoto = {
              id: Math.random().toString(36).substring(2, 9),
              url: imageUrl,
              name: file.name,
              createdAt: Date.now(),
            };
            resolve(newPhoto);
          };
          reader.readAsDataURL(file);
        });
      });

      const newPhotos = await Promise.all(uploadPromises);
      const currentPhotos = storage.getPhotos();
      const updatedPhotos = [...currentPhotos, ...newPhotos];
      localStorage.setItem('aibum_photos', JSON.stringify(updatedPhotos));
      setPhotos(updatedPhotos);

      toast({
        title: "업로드 완료",
        description: `${files.length}개의 사진이 업로드되었습니다.`,
      });
      
      setIsUploadOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "업로드 실패",
        description: "사진 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = async (filterType: 'date' | 'people') => {
    setActiveFilter(filterType);
    
    if (filterType === 'date') {
      const sortedPhotos = [...photos].sort((a, b) => b.createdAt - a.createdAt);
      setPhotos(sortedPhotos);
      toast({
        title: "정렬 완료",
        description: "최신 순으로 정렬되었습니다.",
      });
    } 
    else if (filterType === 'people') {
      if (!isLoaded) {
        toast({
          title: "AI 모델 로딩 중",
          description: "모델 파일을 불러오는 중입니다. 잠시만 기다려주세요...",
          duration: 5000,
        });
        return;
      }

      setIsAnalyzing(true);
      try {
        // 사진이 없는 경우 처리
        if (!photos.length) {
          throw new Error('분석할 사진이 없습니다.');
        }

        console.log('Starting face analysis for', photos.length, 'photos');
        
        // 각 사진 분석을 chunk로 나누어 처리 (메모리 관리)
        const chunkSize = 5;
        const analysisResults = [];
        
        for (let i = 0; i < photos.length; i += chunkSize) {
          const chunk = photos.slice(i, i + chunkSize);
          const chunkResults = await Promise.all(
            chunk.map(async (photo) => {
              try {
                const detectedFaces = await detectFaces(photo.url);
                return {
                  ...photo,
                  faces: detectedFaces.map(face => ({
                    id: face.id,
                    detection: face.detection,
                    descriptor: face.descriptor
                  }))
                };
              } catch (error) {
                console.error(`Error analyzing photo ${photo.url}:`, error);
                return { ...photo, faces: [] };
              }
            })
          );
          analysisResults.push(...chunkResults);
        }

        // 얼굴이 감지된 사진만 필터링
        const updatedPhotos = analysisResults.filter(photo => photo.faces && photo.faces.length > 0);
        
        if (updatedPhotos.length === 0) {
          throw new Error('감지된 얼굴이 없습니다.');
        }

        // 로컬스토리지 업데이트
        localStorage.setItem('aibum_photos', JSON.stringify(updatedPhotos));
        setPhotos(updatedPhotos);

        // 얼굴 그룹화
        const allFaces = updatedPhotos.flatMap(p => p.faces);
        if (allFaces.length > 0) {
          await groupFaces(allFaces);
        }

        toast({
          title: "분석 완료",
          description: `${updatedPhotos.length}장의 사진에서 인물이 감지되었습니다.`,
        });
      } catch (error) {
        console.error('Face analysis error:', error);
        toast({
          title: "분석 실패",
          description: error instanceof Error ? error.message : "인물 분석 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleLabelChange = (groupId: string, newLabel: string) => {
    updateGroupLabel(groupId, newLabel);
  };

  const getFilteredGroups = () => {
    if (activeFilter === 'people' && personGroups.length > 0) {
      return personGroups.map(group => ({
        groupId: group.id,
        label: group.label || `그룹 ${group.id}`,
        photos: photos.filter(photo => 
          photo.faces?.some(face =>
            group.faces.some(groupFace => 
              faceapi.euclideanDistance(face.descriptor, groupFace.descriptor) < 0.6
            )
          )
        )
      })).filter(group => group.photos.length > 0);
    }

    return [{
      groupId: 'all',
      label: '전체 사진',
      photos: photos
    }];
  };

  const renderContent = () => {
    if (photos.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">아직 업로드된 사진이 없습니다.</p>
        </div>
      );
    }

    if (isAnalyzing) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">인물을 분석하고 있습니다...</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {getFilteredGroups().map(group => (
          <PersonGroup
            key={group.groupId}
            groupId={group.groupId}
            label={group.label}
            photos={group.photos}
            showFaces={activeFilter === 'people'}
            onLabelChange={handleLabelChange}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Aibum
            </h1>
            <FilterMenu onFilterChange={handleFilterChange} />
          </div>
          <UploadDialog
            isOpen={isUploadOpen}
            onOpenChange={setIsUploadOpen}
            onUpload={handleUpload}
          />
        </div>
        {renderContent()}
      </div>
    </div>
  )
}
