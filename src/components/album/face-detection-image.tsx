"use client"

import { useEffect, useRef } from 'react'
import * as faceapi from 'face-api.js'

interface FaceDetectionImageProps {
  src: string
  faces?: {
    detection: faceapi.FaceDetection
  }[]
}

export function FaceDetectionImage({ src, faces }: FaceDetectionImageProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!faces || !imageRef.current || !canvasRef.current) return

    const image = imageRef.current
    const canvas = canvasRef.current
    
    // 캔버스 크기를 이미지 크기에 맞춤
    canvas.width = image.width
    canvas.height = image.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 얼굴 영역 표시
    faces.forEach(face => {
      const { box } = face.detection
      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2
      ctx.strokeRect(box.x, box.y, box.width, box.height)
    })
  }, [faces])

  return (
    <div className="relative">
      <img
        ref={imageRef}
        src={src}
        alt="Face detection"
        className="w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  )
} 