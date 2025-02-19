"use client"

import { useState } from "react"
import { Card, CardContent } from "./card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PhotoBookProps {
  images: string[]
}

export function PhotoBook({ images }: PhotoBookProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const pagesCount = Math.ceil(images.length / 2)

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">이 앨범에는 사진이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Card className="photo-book-layout">
          <CardContent className="flex gap-8 p-8">
            <div className="photo-book-page">
              <img
                src={images[currentPage * 2]}
                alt={`Page ${currentPage * 2 + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {images[currentPage * 2 + 1] && (
              <div className="photo-book-page">
                <img
                  src={images[currentPage * 2 + 1]}
                  alt={`Page ${currentPage * 2 + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.min(pagesCount - 1, p + 1))}
          disabled={currentPage === pagesCount - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-center mt-4 text-sm text-muted-foreground">
        {currentPage + 1} / {pagesCount} 페이지
      </div>
    </div>
  )
} 