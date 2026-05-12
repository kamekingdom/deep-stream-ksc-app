import { GoogleAuthProvider } from "firebase/auth";
import {
  browserSessionPersistence,
  inMemoryPersistence,
  initializeAuth,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore"

const resolvedAuthDomain =
  typeof window !== "undefined"
  && (window.location.hostname.endsWith(".web.app")
    || window.location.hostname.endsWith(".firebaseapp.com"))
    ? window.location.hostname
    : "deep-stream-ksc.web.app";

const firebaseConfig = {
  apiKey: "AIzaSyCg2Hvah_OHX5K2Kq0fWpSeoYE3edd5Dyc",
  authDomain: resolvedAuthDomain,
  projectId: "deep-stream-ksc",
  messagingSenderId: "523585296072",
  appId: "1:523585296072:web:9b3e9e64b5d5adbbfeb7fd",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
const auth = initializeAuth(app, {
  persistence: [
    browserSessionPersistence,
    inMemoryPersistence,
  ],
});
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export { app, auth, provider, db, firebaseConfig };
