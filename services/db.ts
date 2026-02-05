import { User, AppState } from '../types';

const DB_NAME = 'FinanzaDB';
const DB_VERSION = 1;

export class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Users Table
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'email' });
        }
        
        // Data Table (One entry per user for simplicity, or could be normalized)
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'userId' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = () => reject('Erro ao abrir o banco de dados');
    });
  }

  async getUsers(): Promise<User[]> {
    return this.getAll<User>('users');
  }

  async saveUser(user: User): Promise<void> {
    return this.put('users', user);
  }

  async getUserData(email: string): Promise<Partial<AppState> | null> {
    const data = await this.get<{ userId: string, state: Partial<AppState> }>('userData', email);
    return data ? data.state : null;
  }

  async saveUserData(email: string, state: AppState): Promise<void> {
    // We remove the user and sensitive info from the state before saving to the data store
    const { currentUser, ...stateToSave } = state;
    return this.put('userData', { userId: email, state: stateToSave });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Erro ao ler dados');
    });
  }

  private async get<T>(storeName: string, key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject('Erro ao buscar dado');
    });
  }

  private async put(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Erro ao salvar dado');
    });
  }
}

export const db = new Database();