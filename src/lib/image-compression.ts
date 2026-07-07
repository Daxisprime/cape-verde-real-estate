import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  fileType: string;
  initialQuality: number;
  maxIteration: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.15,
  maxWidthOrHeight: 1200,
  useWebWorker: false,
  fileType: 'image/webp',
  initialQuality: 0.7,
  maxIteration: 20,
};

export async function compressImage(
  file: File,
  options?: Partial<CompressionOptions>
): Promise<File> {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  merged.useWebWorker = false;

  let compressed: File | Blob;
  try {
    compressed = await imageCompression(file, merged);
  } catch {
    compressed = await imageCompression(file, {
      ...merged,
      fileType: file.type || 'image/jpeg',
    });
  }

  if (!compressed || compressed.size === 0) {
    return file;
  }

  if (compressed.size > merged.maxSizeMB * 1024 * 1024) {
    try {
      compressed = await imageCompression(file, {
        ...merged,
        fileType: file.type || 'image/jpeg',
        maxWidthOrHeight: 800,
        initialQuality: 0.5,
        maxIteration: 30,
      });
    } catch {
      return file;
    }
  }

  if (!compressed || compressed.size === 0) {
    return file;
  }

  const outputType = compressed.type || file.type || 'image/jpeg';
  const ext = outputType.includes('webp') ? 'webp' : outputType.includes('png') ? 'png' : 'jpg';
  const buffer = await compressed.arrayBuffer();
  return new File([buffer], `avatar.${ext}`, { type: outputType, lastModified: Date.now() });
}
