import { PersonGroup, DetectedFace } from '@/hooks/useFaceApi';

declare module '@/hooks/useFaceApi' {
  export interface PersonGroup {
    id: string;
    label: string;
    faces: DetectedFace[];
  }

  export interface DetectedFace {
    id: string;
    descriptor: Float32Array;
    detection: any; // face-api.js 타입
    landmarks?: any; // face-api.js 타입
    imageUrl: string;
    timestamp: number;
  }
}

declare module 'react-dropzone' {
  export interface DropzoneProps {
    onDrop: (acceptedFiles: File[]) => void;
  }
}

export interface Photo {
  id: string;
  url: string;
  date: string;
  memo?: string;
  faces?: Face[];
}

export interface Face {
  id: string;
  name?: string;
  descriptor: Float32Array;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Album {
  id: string;
  name: string;
  photos: Photo[];
} 