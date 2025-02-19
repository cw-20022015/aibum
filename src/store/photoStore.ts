import { create } from 'zustand';
import { Photo, Face } from '@/types';

interface PhotoStore {
  photos: Photo[];
  faces: Face[];
  addPhoto: (photo: Photo) => void;
  addFace: (face: Face) => void;
  updatePhotoMemo: (photoId: string, memo: string) => void;
  updateFaceName: (faceId: string, name: string) => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  photos: [],
  faces: [],
  addPhoto: (photo) =>
    set((state) => ({ photos: [...state.photos, photo] })),
  addFace: (face) =>
    set((state) => ({ faces: [...state.faces, face] })),
  updatePhotoMemo: (photoId, memo) =>
    set((state) => ({
      photos: state.photos.map((photo) =>
        photo.id === photoId ? { ...photo, memo } : photo
      ),
    })),
  updateFaceName: (faceId, name) =>
    set((state) => ({
      faces: state.faces.map((face) =>
        face.id === faceId ? { ...face, name } : face
      ),
    })),
})); 