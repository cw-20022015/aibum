export interface StoredPhoto {
  id: string;
  url: string;
  name: string;
  createdAt: number;
  faces?: {
    id: string;
    groupId: string;
  }[];
}

export interface PhotoGroup {
  id: string;
  label: string;
  faceIds: string[];
}

const STORAGE_KEYS = {
  PHOTOS: 'aibum_photos',
  GROUPS: 'aibum_groups'
} as const;

export const storage = {
  // 사진 관련 함수들
  getPhotos: (): StoredPhoto[] => {
    const photos = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    return photos ? JSON.parse(photos) : [];
  },

  addPhoto: (photo: StoredPhoto) => {
    const photos = storage.getPhotos();
    photos.push(photo);
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    // 이벤트 발생
    window.dispatchEvent(new Event('storage'));
  },

  updatePhoto: (id: string, updates: Partial<StoredPhoto>) => {
    const photos = storage.getPhotos();
    const index = photos.findIndex(p => p.id === id);
    if (index !== -1) {
      photos[index] = { ...photos[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
      // 이벤트 발생
      window.dispatchEvent(new Event('storage'));
    }
  },

  // 그룹 관련 함수들
  getGroups: (): PhotoGroup[] => {
    const groups = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return groups ? JSON.parse(groups) : [];
  },

  addGroup: (group: PhotoGroup) => {
    const groups = storage.getGroups();
    groups.push(group);
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    // 이벤트 발생
    window.dispatchEvent(new Event('storage'));
  },

  updateGroup: (id: string, updates: Partial<PhotoGroup>) => {
    const groups = storage.getGroups();
    const index = groups.findIndex(g => g.id === id);
    if (index !== -1) {
      groups[index] = { ...groups[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
      // 이벤트 발생
      window.dispatchEvent(new Event('storage'));
    }
  }
}; 