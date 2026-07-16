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
  maxSizeMB: 0.19,
  maxWidthOrHeight: 1024,
  useWebWorker: false,
  fileType: 'image/webp',
  initialQuality: 0.75,
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

  // If still over 200KB, do a second aggressive pass
  if (compressed.size > 200 * 1024) {
    try {
      compressed = await imageCompression(file, {
        ...merged,
        maxWidthOrHeight: 800,
        initialQuality: 0.6,
        maxIteration: 30,
      });
    } catch {
      // Keep first-pass result
    }
  }

  // Final fallback: reduce to JPEG if WebP still too large
  if (compressed.size > 200 * 1024) {
    try {
      compressed = await imageCompression(file, {
        maxSizeMB: 0.19,
        maxWidthOrHeight: 768,
        useWebWorker: false,
        fileType: 'image/jpeg',
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

  const outputType = compressed.type || 'image/webp';
  const ext = outputType.includes('webp') ? 'webp' : outputType.includes('png') ? 'png' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const buffer = await compressed.arrayBuffer();
  return new File([buffer], `${baseName}.${ext}`, { type: outputType, lastModified: Date.now() });
}
