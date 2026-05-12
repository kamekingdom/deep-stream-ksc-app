import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";

const MANUAL_SESSION_KEY = "deepstream_manual_session";
const SESSION_EVENT = "deepstream:manual-session-changed";
const FIRESTORE_LOGIN_TIMEOUT_MS = 8000;

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function readManualSession() {
  const sessionStorage = getSessionStorage();
  if (!sessionStorage) {
    return null;
  }

  try {
    window.localStorage.removeItem(MANUAL_SESSION_KEY);
    const raw = sessionStorage.getItem(MANUAL_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.email) {
      return null;
    }

    return {
      email: parsed.email,
      photoURL: null,
      isManualSession: true,
    };
  } catch (error) {
    return null;
  }
}

function notifySessionChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  }
}

function writeManualSession(email) {
  const sessionStorage = getSessionStorage();
  if (!sessionStorage) {
    return;
  }

  window.localStorage.removeItem(MANUAL_SESSION_KEY);
  sessionStorage.setItem(MANUAL_SESSION_KEY, JSON.stringify({ email }));
  notifySessionChanged();
}

function clearManualSession() {
  const sessionStorage = getSessionStorage();
  if (!sessionStorage) {
    return;
  }

  window.localStorage.removeItem(MANUAL_SESSION_KEY);
  sessionStorage.removeItem(MANUAL_SESSION_KEY);
  notifySessionChanged();
}

function getCurrentUser() {
  if (auth.currentUser?.email) {
    return auth.currentUser;
  }

  return readManualSession();
}

function getCurrentUserEmail() {
  return getCurrentUser()?.email || null;
}

function createAuthLikeError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function withTimeout(promise, timeoutMs, code) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(createAuthLikeError(code)), timeoutMs);
    }),
  ]);
}

function useCurrentUser() {
  const [firebaseUser, firebaseLoading] = useAuthState(auth);
  const [manualUser, setManualUser] = useState(readManualSession());

  useEffect(() => {
    const syncManualUser = () => {
      setManualUser(readManualSession());
    };

    window.addEventListener(SESSION_EVENT, syncManualUser);
    return () => window.removeEventListener(SESSION_EVENT, syncManualUser);
  }, []);

  return [firebaseUser || manualUser, firebaseLoading && !manualUser];
}

async function loginWithEmailFallback(email, password) {
  const trimmedEmail = email.trim();
  const userDoc = await withTimeout(
    getDoc(doc(db, "users", trimmedEmail)),
    FIRESTORE_LOGIN_TIMEOUT_MS,
    "auth/firestore-timeout"
  );

  if (!userDoc.exists()) {
    throw createAuthLikeError("auth/user-not-found");
  }

  const userData = userDoc.data();
  if (userData.Password !== password) {
    throw createAuthLikeError("auth/wrong-password");
  }

  writeManualSession(trimmedEmail);
  return { email: trimmedEmail, isManualSession: true };
}

async function signOutCurrentUser() {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } finally {
    clearManualSession();
  }
}

export {
  clearManualSession,
  getCurrentUser,
  getCurrentUserEmail,
  loginWithEmailFallback,
  signOutCurrentUser,
  useCurrentUser,
  writeManualSession,
};
