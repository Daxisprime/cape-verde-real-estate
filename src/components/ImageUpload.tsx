'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload, X, Image as ImageIcon, Loader2, AlertCircle,
  GripVertical, Plus, Camera, Trash2, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  bucket: 'property-images' | 'avatars';
  folder?: string; // e.g., property ID or user ID
  maxFiles?: number;
  maxSizeMB?: number;
  currentImages?: string[];
  onImagesChange: (urls: string[]) => void;
  variant?: 'default' | 'avatar' | 'grid';
  aspectRatio?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  preview: string;
  error?: string;
}

export default function ImageUpload({
  bucket,
  folder,
  maxFiles = 10,
  maxSizeMB = 5,
  currentImages = [],
  onImagesChange,
  variant = 'default',
  aspectRatio = '16/9',
}: ImageUploadProps) {
  const { supabase, user } = useSupabaseAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // Generate storage path
  const getStoragePath = (filename: string) => {
    const userId = user?.id || 'anonymous';
    const folderPath = folder || userId;
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${folderPath}/${timestamp}-${safeName}`;
  };

  // Get public URL for an image
  const getPublicUrl = (path: string) => {
    if (!supabase) return '';
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: JPG, PNG, WebP, GIF`;
    }
    if (file.size > maxSizeBytes) {
      return `File too large. Max size: ${maxSizeMB}MB`;
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!supabase) {
      setError('Storage not configured');
      return;
    }

    // Check total count
    const totalAfterUpload = images.length + files.length;
    if (totalAfterUpload > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setError(null);
    const newUploads: UploadingFile[] = [];

    // Prepare files for upload
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);

      if (validationError) {
        toast({
          title: 'Invalid file',
          description: `${file.name}: ${validationError}`,
          variant: 'destructive',
        });
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      newUploads.push({ file, progress: 0, preview });
    }

    if (newUploads.length === 0) return;

    setUploading(prev => [...prev, ...newUploads]);

    // Upload files
    for (const upload of newUploads) {
      try {
        const path = getStoragePath(upload.file.name);

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, upload.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const publicUrl = getPublicUrl(data.path);

        // Update state
        setImages(prev => {
          const newImages = [...prev, publicUrl];
          onImagesChange(newImages);
          return newImages;
        });

        // Mark as complete
        setUploading(prev =>
          prev.map(u =>
            u.preview === upload.preview ? { ...u, progress: 100 } : u
          )
        );

        // Clean up preview URL
        URL.revokeObjectURL(upload.preview);

        // Remove from uploading after a delay
        setTimeout(() => {
          setUploading(prev => prev.filter(u => u.preview !== upload.preview));
        }, 1000);

      } catch (err: any) {
        console.error('Upload error:', err);
        setUploading(prev =>
          prev.map(u =>
            u.preview === upload.preview
              ? { ...u, error: err.message || 'Upload failed' }
              : u
          )
        );

        toast({
          title: 'Upload failed',
          description: err.message || 'Failed to upload image',
          variant: 'destructive',
        });
      }
    }
  }, [supabase, bucket, images.length, maxFiles, onImagesChange, toast]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Remove image
  const removeImage = async (index: number) => {
    const imageUrl = images[index];

    // Extract path from URL
    const urlParts = imageUrl.split(`${bucket}/`);
    if (urlParts.length > 1 && supabase) {
      const path = urlParts[1];
      await supabase.storage.from(bucket).remove([path]);
    }

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);

    toast({
      title: 'Image removed',
      description: 'The image has been deleted.',
    });
  };

  // Reorder images (drag and drop)
  const handleReorderDrop = () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dragOverIndex, 0, draggedItem);

    setImages(newImages);
    onImagesChange(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Avatar variant
  if (variant === 'avatar') {
    const currentAvatar = images[0];

    return (
      <div className="flex flex-col items-center space-y-4">
        <div
          className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-8 w-8 text-white" />
          </div>

          {uploading.length > 0 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {currentAvatar ? 'Change' : 'Upload'}
          </Button>

          {currentAvatar && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeImage(0)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500">
          JPG, PNG or WebP. Max {maxSizeMB}MB
        </p>
      </div>
    );
  }

  // Default/Grid variant
  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          transition-colors cursor-pointer
          ${images.length >= maxFiles
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }
        `}
        onClick={() => images.length < maxFiles && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={images.length >= maxFiles}
        />

        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          {images.length >= maxFiles ? (
            `Maximum ${maxFiles} images reached`
          ) : (
            <>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </>
          )}
        </p>
        <p className="text-sm text-gray-500">
          JPG, PNG, WebP or GIF (max {maxSizeMB}MB each)
        </p>
        <p className="text-sm text-gray-500">
          {images.length}/{maxFiles} images
        </p>
      </div>

      {/* Uploading Progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((upload, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${
                upload.error ? 'border border-red-200' : ''
              }`}
            >
              <img
                src={upload.preview}
                alt="Uploading"
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                {upload.error ? (
                  <p className="text-xs text-red-600">{upload.error}</p>
                ) : (
                  <Progress value={upload.progress} className="h-1 mt-1" />
                )}
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(index);
              }}
              onDragEnd={handleReorderDrop}
              className={`
                relative group rounded-lg overflow-hidden bg-gray-100
                ${draggedIndex === index ? 'opacity-50' : ''}
                ${dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-blue-500' : ''}
              `}
              style={{ aspectRatio }}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* First image badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Cover
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setPreviewImage(url)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Drag handle */}
              <div className="absolute top-2 right-2 p-1 bg-white/80 rounded cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          ))}

          {/* Add more button */}
          {images.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
              style={{ aspectRatio }}
            >
              <Plus className="h-8 w-8 mb-2" />
              <span className="text-sm">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Instructions */}
      <p className="text-xs text-gray-500">
        Drag images to reorder. First image will be used as the cover.
      </p>
    </div>
  );
}
