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
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.7,
  maxIteration: 20,
};

export async function compressImage(
  file: File,
  options?: Partial<CompressionOptions>
): Promise<File> {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  let compressed = await imageCompression(file, merged);

  if (compressed.size > merged.maxSizeMB * 1024 * 1024) {
    compressed = await imageCompression(file, {
      ...merged,
      maxWidthOrHeight: 800,
      initialQuality: 0.5,
      maxIteration: 30,
    });
  }

  const buffer = await compressed.arrayBuffer();
  return new File([buffer], 'avatar.webp', { type: 'image/webp', lastModified: Date.now() });
}
