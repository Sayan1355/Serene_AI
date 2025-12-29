// IndexedDB wrapper for offline message storage

const DB_NAME = 'serene-offline-db';
const DB_VERSION = 1;
const MESSAGE_STORE = 'pending-messages';

interface PendingMessage {
  id: string;
  content: string;
  timestamp: number;
  conversationId: number | null;
  synced: boolean;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(MESSAGE_STORE)) {
          const objectStore = db.createObjectStore(MESSAGE_STORE, { keyPath: 'id' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }

  async addPendingMessage(content: string, conversationId: number | null): Promise<string> {
    if (!this.db) await this.init();

    const message: PendingMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: Date.now(),
      conversationId,
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MESSAGE_STORE], 'readwrite');
      const store = transaction.objectStore(MESSAGE_STORE);
      const request = store.add(message);

      request.onsuccess = () => resolve(message.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingMessages(): Promise<PendingMessage[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MESSAGE_STORE], 'readonly');
      const store = transaction.objectStore(MESSAGE_STORE);
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(messageId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MESSAGE_STORE], 'readwrite');
      const store = transaction.objectStore(MESSAGE_STORE);
      const getRequest = store.get(messageId);

      getRequest.onsuccess = () => {
        const message = getRequest.result;
        if (message) {
          message.synced = true;
          const updateRequest = store.put(message);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteSyncedMessages(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MESSAGE_STORE], 'readwrite');
      const store = transaction.objectStore(MESSAGE_STORE);
      const index = store.index('synced');
      const request = index.openCursor(IDBKeyRange.only(true));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([MESSAGE_STORE], 'readwrite');
      const store = transaction.objectStore(MESSAGE_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onOnline(callback: () => void): void {
    window.addEventListener('online', callback);
  }

  onOffline(callback: () => void): void {
    window.addEventListener('offline', callback);
  }

  removeOnlineListener(callback: () => void): void {
    window.removeEventListener('online', callback);
  }

  removeOfflineListener(callback: () => void): void {
    window.removeEventListener('offline', callback);
  }
}

export const offlineStorage = new OfflineStorage();
export type { PendingMessage };
