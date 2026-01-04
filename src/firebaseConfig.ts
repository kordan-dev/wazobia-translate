import { initializeApp, FirebaseOptions, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// 1. Extend the global Window interface to include your custom properties
declare global {
  interface Window {
    __firebase_config?: string; // Assumed to be a JSON string based on JSON.parse usage
    __app_id?: string;
  }
}

// 2. Check environment safely using the new window types
const isPreviewEnv: boolean =
  typeof window !== "undefined" && !!window.__firebase_config;

// 3. Define the config using the official FirebaseOptions type
const firebaseConfig: FirebaseOptions =
  isPreviewEnv && window.__firebase_config
    ? (JSON.parse(window.__firebase_config) as FirebaseOptions)
    : {
        // ⚠️ FOR LOCAL DEV: Replace with your actual Firebase Console keys
        apiKey: "YOUR_API_KEY",
        authDomain: "your-app.firebaseapp.com",
        projectId: "your-app",
        storageBucket: "your-app.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef",
      };

// Initialize Firebase services
const app: FirebaseApp = initializeApp(firebaseConfig);

// Export typed instances
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Helper for the shared app ID
export const appId: string =
  typeof window !== "undefined" && window.__app_id
    ? window.__app_id
    : "default-app-id";
