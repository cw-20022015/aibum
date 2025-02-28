import { useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

// 로딩 상태 타입 정의
export type LoadingStatus = {
  status: 'idle' | 'loading' | 'success' | 'error';
  progress: number;
  message: string;
};

export interface DetectedFace {
  id: string;
  descriptor: Float32Array;
  detection: faceapi.FaceDetection;
  landmarks?: faceapi.FaceLandmarks68;
  imageUrl: string;
  timestamp: number;
}

export interface PersonGroup {
  id: string;
  label: string;
  faces: DetectedFace[];
}

// 저장된 인물 그룹 타입
interface SavedPersonGroup {
  id: string;
  label: string;
  descriptor: Float32Array;
}

export const useFaceApi = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [personGroups, setPersonGroups] = useState<PersonGroup[]>([]);
  const [savedGroups, setSavedGroups] = useState<SavedPersonGroup[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  // 저장된 그룹 로드
  useEffect(() => {
    const savedData = localStorage.getItem('personGroups');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSavedGroups(parsed.map((group: any) => ({
          ...group,
          descriptor: new Float32Array(Object.values(group.descriptor))
        })));
      } catch (error) {
        console.error('Error loading saved groups:', error);
      }
    }
  }, []);

  // 그룹 이름 업데이트
  const updateGroupLabel = useCallback((groupId: string, newLabel: string) => {
    setPersonGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => 
        group.id === groupId ? { ...group, label: newLabel } : group
      );
      
      // 로컬스토리지에 저장
      const groupsToSave = updatedGroups.map(group => ({
        id: group.id,
        label: group.label,
        descriptor: group.faces[0]?.descriptor
      }));
      localStorage.setItem('personGroups', JSON.stringify(groupsToSave));
      
      return updatedGroups;
    });
  }, []);

  // 모델 로딩
  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      try {
        setLoadingStatus({
          status: 'loading',
          progress: 0,
          message: 'Loading face detection models...'
        });

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        if (isMounted) {
          setIsLoaded(true);
          setLoadingStatus({
            status: 'success',
            progress: 100,
            message: 'Models loaded successfully'
          });
        }
      } catch (error) {
        console.error('Error loading models:', error);
        if (isMounted) {
          setLoadingStatus({
            status: 'error',
            progress: 0,
            message: 'Failed to load models'
          });
        }
      }
    };

    loadModels();
    return () => { isMounted = false; };
  }, []);

  // 얼굴 감지
  const detectFaces = useCallback(async (imageUrl: string): Promise<DetectedFace[]> => {
    if (!isLoaded) {
      console.log('Models not loaded yet');
      return [];
    }

    try {
      setLoadingStatus({
        status: 'loading',
        progress: 20,
        message: 'Loading image...'
      });

      const img = await faceapi.fetchImage(imageUrl);

      setLoadingStatus({
        status: 'loading',
        progress: 40,
        message: 'Processing image...'
      });

      const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const faceDescriptors = detections.map(detection => ({
        id: Math.random().toString(36).substring(2, 9),
        descriptor: detection.descriptor,
        detection: detection.detection,
        landmarks: detection.landmarks,
        imageUrl,
        timestamp: Date.now()
      }));

      // 시각화
      const imgElement = document.querySelector(`img[src="${imageUrl}"]`) as HTMLImageElement;
      if (imgElement) {
        const displaySize = {
          width: imgElement.offsetWidth,
          height: imgElement.offsetHeight
        };

        const container = imgElement.parentElement;
        if (container) {
          container.style.position = 'relative';
          
          const existingCanvas = container.querySelector('canvas');
          if (existingCanvas) {
            existingCanvas.remove();
          }

          const canvas = document.createElement('canvas');
          canvas.width = displaySize.width;
          canvas.height = displaySize.height;
          
          Object.assign(canvas.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            pointerEvents: 'none'
          });

          container.appendChild(canvas);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            const scale = {
              x: displaySize.width / img.width,
              y: displaySize.height / img.height
            };

            detections.forEach((detection, index) => {
              const box = detection.detection.box;
              const scaledBox = {
                x: box.x * scale.x,
                y: box.y * scale.y,
                width: box.width * scale.x,
                height: box.height * scale.y
              };

              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 2;
              ctx.strokeRect(scaledBox.x, scaledBox.y, scaledBox.width, scaledBox.height);

              ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
              ctx.fillRect(scaledBox.x, scaledBox.y - 30, 100, 30);

              ctx.fillStyle = '#000000';
              ctx.font = 'bold 16px Arial';
              ctx.fillText(`Person ${index + 1}`, scaledBox.x + 5, scaledBox.y - 10);
            });
          }
        }
      }

      setLoadingStatus({
        status: 'success',
        progress: 100,
        message: `Detected ${detections.length} faces`
      });

      return faceDescriptors;
    } catch (error) {
      console.error('Error in detectFaces:', error);
      setLoadingStatus({
        status: 'error',
        progress: 0,
        message: 'Face detection failed'
      });
      throw error;
    }
  }, [isLoaded]);

  // 얼굴 그룹화
  const groupFaces = useCallback(async (faces: DetectedFace[]) => {
    try {
      setLoadingStatus({
        status: 'loading',
        progress: 80,
        message: 'Grouping similar faces...'
      });

      const groups: PersonGroup[] = [];
      const SIMILARITY_THRESHOLD = 0.6;

      faces.forEach((face) => {
        let foundGroup = null;

        // 저장된 그룹과 비교
        const savedGroup = savedGroups.find(saved => {
          if (!face.descriptor || !saved.descriptor) return false;
          const distance = faceapi.euclideanDistance(
            face.descriptor,
            saved.descriptor
          );
          return distance < SIMILARITY_THRESHOLD;
        });

        if (savedGroup) {
          foundGroup = groups.find(g => g.id === savedGroup.id);
          if (!foundGroup) {
            foundGroup = {
              id: savedGroup.id,
              label: savedGroup.label,
              faces: []
            };
            groups.push(foundGroup);
          }
        } else {
          foundGroup = groups.find(group => 
            group.faces.some(groupFace => {
              if (!face.descriptor || !groupFace.descriptor) return false;
              const distance = faceapi.euclideanDistance(
                face.descriptor,
                groupFace.descriptor
              );
              return distance < SIMILARITY_THRESHOLD;
            })
          );

          if (!foundGroup) {
            foundGroup = {
              id: Math.random().toString(36).substring(2, 9),
              label: `Person ${groups.length + 1}`,
              faces: []
            };
            groups.push(foundGroup);
          }
        }

        foundGroup.faces.push(face);
      });

      setPersonGroups(groups);
      
      setLoadingStatus({
        status: 'success',
        progress: 100,
        message: `Grouped into ${groups.length} person(s)`
      });

      return groups;
    } catch (error) {
      console.error('Error in groupFaces:', error);
      setLoadingStatus({
        status: 'error',
        progress: 0,
        message: 'Failed to group faces'
      });
      throw error;
    }
  }, [savedGroups]);

  return {
    isLoaded,
    detectFaces,
    groupFaces,
    personGroups,
    updateGroupLabel,
    loadingStatus,
    cleanupFaceDetection: useCallback(() => {
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach(canvas => canvas.remove());
    }, [])
  };
};

export default useFaceApi; 