"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Grid3X3, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PhotoGalleryProps {
  images: string[];
  title: string;
}

export default function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setIsLightboxOpen(true);
  };

  if (showAllPhotos) {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">All Photos ({images.length})</h2>
          <Button variant="outline" onClick={() => setShowAllPhotos(false)}>
            Back to Property
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image}
                alt={`${title} - Photo ${index + 1}`}
                fill
                className="object-cover rounded-lg group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Main Image Grid */}
        <div className="grid grid-cols-2 gap-2 h-96">
          {/* Large main image */}
          <div
            className="relative cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={images[0]}
              alt={`${title} - Main photo`}
              fill
              className="object-cover group-hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Smaller images grid */}
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1, 5).map((image, index) => (
              <div
                key={index}
                className="relative cursor-pointer group"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={image}
                  alt={`${title} - Photo ${index + 2}`}
                  fill
                  className="object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Show photos count overlay on last visible image */}
                {index === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Grid3X3 className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-semibold">+{images.length - 5} more</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Controls */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {images.length} photos available
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllPhotos(true)}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              View All Photos
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full bg-black">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Main image */}
            <div className="relative w-full h-full">
              <Image
                src={images[selectedImage]}
                alt={`${title} - Photo ${selectedImage + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {images.length}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex justify-center space-x-2 max-w-md mx-auto">
                  {images.slice(0, 8).map((image, index) => (
                    <div
                      key={index}
                      className={`relative w-12 h-12 cursor-pointer rounded overflow-hidden border-2 ${
                        selectedImage === index ? 'border-white' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {images.length > 8 && (
                    <div className="w-12 h-12 bg-black bg-opacity-50 rounded flex items-center justify-center text-white text-xs">
                      +{images.length - 8}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
