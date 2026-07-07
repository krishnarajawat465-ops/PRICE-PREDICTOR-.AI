import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  deleteDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAAHawkSnZ6VtzsofAjKiTxWEk2RgV7V1c",
  authDomain: "nifty-nexus-2gbcx.firebaseapp.com",
  projectId: "nifty-nexus-2gbcx",
  storageBucket: "nifty-nexus-2gbcx.firebasestorage.app",
  messagingSenderId: "635281856985",
  appId: "1:635281856985:web:56f9121e6939aeed77e1c8"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID provided in the config
const db = getFirestore(app, "ai-studio-productpricefind-7cc41524-4249-47c5-9161-62ed4de0fa26");

export { app, db };

// --- FIRESTORE DATABASE INTERACTION HELPERS ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: false,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface WatchlistItem {
  id: string;
  query: string;
  timestamp: number;
  data: any;
  sources: any[];
}

export interface FirebaseUser {
  email: string;
  username: string;
  password?: string;
  name: string;
  watchlist: WatchlistItem[];
}

/**
 * Fetch all registered users from Firestore
 */
export async function getFirebaseUsers(): Promise<FirebaseUser[]> {
  const path = "users";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const users: FirebaseUser[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      users.push({
        email: docSnapshot.id,
        username: data.username || "",
        password: data.password || "",
        name: data.name || "User",
        watchlist: data.watchlist || []
      });
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save/Update a user profile in Firestore
 */
export async function saveFirebaseUser(user: FirebaseUser): Promise<void> {
  if (!user.email) return;
  const path = `users/${user.email.toLowerCase().trim()}`;
  try {
    const userRef = doc(db, "users", user.email.toLowerCase().trim());
    await setDoc(userRef, {
      username: user.username,
      password: user.password || "",
      name: user.name,
      watchlist: user.watchlist || []
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a user profile from Firestore
 */
export async function deleteFirebaseUser(email: string): Promise<void> {
  if (!email) return;
  const path = `users/${email.toLowerCase().trim()}`;
  try {
    const userRef = doc(db, "users", email.toLowerCase().trim());
    await deleteDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetch global system settings (announcement, maintenance)
 */
export async function getFirebaseSettings(): Promise<{ announcement: string; isMaintenance: boolean } | null> {
  const path = "settings/global";
  try {
    const settingsRef = doc(db, "settings", "global");
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        announcement: data.announcement || "",
        isMaintenance: !!data.isMaintenance
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save global system settings to Firestore
 */
export async function saveFirebaseSettings(announcement: string, isMaintenance: boolean): Promise<void> {
  const path = "settings/global";
  try {
    const settingsRef = doc(db, "settings", "global");
    await setDoc(settingsRef, {
      announcement,
      isMaintenance
    }, { merge: mergeOptions() }); // Using simple merge helper/direct config
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Simple internal helper for merge option to avoid syntax/import complexity
function mergeOptions() {
  return true;
}

/**
 * Fetch all news items from Firestore
 */
export async function getFirebaseNews(): Promise<any[] | null> {
  const path = "news";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    if (querySnapshot.empty) return null;
    const news: any[] = [];
    querySnapshot.forEach((docSnapshot) => {
      news.push({
        id: docSnapshot.id,
        ...docSnapshot.data()
      });
    });
    return news;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save all news items to Firestore
 */
export async function saveFirebaseNews(newsItems: any[]): Promise<void> {
  try {
    for (const item of newsItems) {
      if (!item.id) continue;
      const path = `news/${item.id}`;
      try {
        const newsRef = doc(db, "news", item.id);
        await setDoc(newsRef, {
          title: item.title || "",
          productName: item.productName || "",
          originalPrice: item.originalPrice || "",
          newPrice: item.newPrice || "",
          merchant: item.merchant || "",
          savingPercent: Number(item.savingPercent) || 0,
          category: item.category || "electronics",
          timestamp: item.timestamp || "",
          isSynced: !!item.isSynced,
          lastSyncedAt: item.lastSyncedAt || ""
        }, { merge: true });
      } catch (innerError) {
        handleFirestoreError(innerError, OperationType.WRITE, path);
      }
    }
  } catch (error) {
    // Catch-all if outside the loops or general failure
    if (error instanceof Error && error.message.includes("Firestore Error")) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, "news");
  }
}

/**
 * Fetch search history from Firestore
 */
export async function getFirebaseHistory(): Promise<any[] | null> {
  const path = "history/search_history";
  try {
    const historyRef = doc(db, "history", "search_history");
    const docSnap = await getDoc(historyRef);
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save search history to Firestore
 */
export async function saveFirebaseHistory(historyItems: any[]): Promise<void> {
  const path = "history/search_history";
  try {
    const historyRef = doc(db, "history", "search_history");
    await setDoc(historyRef, {
      items: historyItems
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
