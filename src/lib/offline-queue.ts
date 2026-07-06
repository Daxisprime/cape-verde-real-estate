const DB_NAME = 'procv-offline';
const DB_VERSION = 1;
const STORE_NAME = 'offline-onboarding-queue';

interface QueuedSubmission {
  id: string;
  timestamp: number;
  endpoint: string;
  payload: Record<string, unknown>;
  imageBlobs?: Array<{ name: string; blob: Blob; bucket: string; path: string }>;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueOfflineSubmission(
  endpoint: string,
  payload: Record<string, unknown>,
  imageBlobs?: Array<{ name: string; blob: Blob; bucket: string; path: string }>
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const entry: QueuedSubmission = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    endpoint,
    payload,
    imageBlobs,
  };
  store.add(entry);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getAllQueuedSubmissions(): Promise<QueuedSubmission[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      resolve(request.result);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function removeQueuedSubmission(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function flushOfflineQueue(
  supabase: { from: (table: string) => any; storage: { from: (bucket: string) => any } }
): Promise<number> {
  const items = await getAllQueuedSubmissions();
  let processed = 0;

  for (const item of items) {
    try {
      // Upload any queued images first
      if (item.imageBlobs) {
        for (const img of item.imageBlobs) {
          await supabase.storage.from(img.bucket).upload(img.path, img.blob, {
            upsert: true,
            contentType: img.blob.type,
          });
        }
      }

      // Submit the data payload
      const [table, action] = item.endpoint.split(':');
      if (action === 'insert') {
        await supabase.from(table).insert(item.payload);
      } else if (action === 'upsert') {
        await supabase.from(table).upsert(item.payload, { onConflict: 'id' });
      }

      await removeQueuedSubmission(item.id);
      processed++;
    } catch {
      // Leave failed items in queue for next attempt
    }
  }

  return processed;
}

export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}
