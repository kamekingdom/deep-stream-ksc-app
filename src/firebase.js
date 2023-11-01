import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCg2Hvah_OHX5K2Kq0fWpSeoYE3edd5Dyc",
  authDomain: "deep-stream-ksc.firebaseapp.com",
  projectId: "deep-stream-ksc",
  storageBucket: "deep-stream-ksc.appspot.com",
  messagingSenderId: "523585296072",
  appId: "1:523585296072:web:9b3e9e64b5d5adbbfeb7fd",
  measurementId: "G-47KHXBKBVN"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
const storage = getStorage(app);

export { app, auth, provider, db, analytics, storage, firebaseConfig };
