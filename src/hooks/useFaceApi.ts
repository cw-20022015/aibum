import { useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

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

export const useFaceApi = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [personGroups, setPersonGroups] = useState<PersonGroup[]>([]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // models 폴더를 public/models에 위치시켜야 합니다
        const MODEL_URL = '/models';
        
        await Promise.all([
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        ]);
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading face-api models:', error);
      }
    };

    loadModels();
  }, []);

  const detectFaces = useCallback(async (imageUrl: string): Promise<DetectedFace[]> => {
    try {
      const img = await faceapi.fetchImage(imageUrl);
      
      const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections.length) {
        console.log('No faces detected in the image');
        return [];
      }

      return detections.map((d: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>) => ({
        id: Math.random().toString(36).substring(2, 9),
        descriptor: d.descriptor,
        detection: d.detection,
        landmarks: d.landmarks,
        imageUrl,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }, []);

  const groupFaces = useCallback(async (newFaces: DetectedFace[]) => {
    if (!newFaces.length) return;

    const SIMILARITY_THRESHOLD = 0.6;

    setPersonGroups(prevGroups => {
      const updatedGroups = [...prevGroups];
      
      newFaces.forEach(newFace => {
        let matchFound = false;

        // Try to find a matching group
        for (const group of updatedGroups) {
          if (!group.faces.length) continue;

          // Compare with the first face in each group
          const distance = faceapi.euclideanDistance(
            newFace.descriptor,
            group.faces[0].descriptor
          );

          if (distance < SIMILARITY_THRESHOLD) {
            group.faces.push(newFace);
            matchFound = true;
            break;
          }
        }

        // If no match found, create new group
        if (!matchFound) {
          updatedGroups.push({
            id: Math.random().toString(36).substring(2, 9),
            label: `Person ${updatedGroups.length + 1}`,
            faces: [newFace]
          });
        }
      });

      return updatedGroups;
    });
  }, []);

  const updatePersonLabel = useCallback((groupId: string, newLabel: string) => {
    setPersonGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId ? { ...group, label: newLabel } : group
      )
    );
  }, []);

  const mergeGroups = useCallback((sourceGroupId: string, targetGroupId: string) => {
    setPersonGroups(prevGroups => {
      const sourceGroup = prevGroups.find(g => g.id === sourceGroupId);
      const targetGroup = prevGroups.find(g => g.id === targetGroupId);
      
      if (!sourceGroup || !targetGroup) return prevGroups;

      const updatedGroups = prevGroups.filter(g => 
        g.id !== sourceGroupId && g.id !== targetGroupId
      );

      updatedGroups.push({
        ...targetGroup,
        faces: [...targetGroup.faces, ...sourceGroup.faces]
      });

      return updatedGroups;
    });
  }, []);

  return {
    isLoaded,
    detectFaces,
    groupFaces,
    personGroups,
    updatePersonLabel,
    mergeGroups
  };
}; 