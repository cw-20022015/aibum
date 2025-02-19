"use client"

import { storage, StoredPhoto } from "@/lib/storage"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { FilterMenu } from "@/components/ui/filter-menu"
import { UploadDialog } from "@/components/album/upload-dialog"
import { PhotoGroup } from "@/components/album/photo-group"
import { useFaceApi } from "@/hooks/useFaceApi"

type FilterType = 'none' | 'date' | 'people';

export default function AlbumPage() {
  const [photos, setPhotos] = useState<StoredPhoto[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('none')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()
  const { detectFaces, groupFaces, personGroups } = useFaceApi()

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
  };

  const getFilteredGroups = () => {
    if (activeFilter === 'date') {
      return [{
        groupId: 'all',
        label: '전체 사진',
        photos: photos
      }];
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
          <PhotoGroup
            key={group.groupId}
            label={group.label}
            photos={group.photos}
            showLabel={activeFilter === 'people'}
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
