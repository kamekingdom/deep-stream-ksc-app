import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";

const MANUAL_SESSION_KEY = "deepstream_manual_session";
const SESSION_EVENT = "deepstream:manual-session-changed";
const FIRESTORE_LOGIN_TIMEOUT_MS = 8000;
const MANUAL_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function readManualSessionCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${MANUAL_SESSION_KEY}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(`${MANUAL_SESSION_KEY}=`.length);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value));
  } catch (_error) {
    return null;
  }
}

function writeManualSessionCookie(session) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${MANUAL_SESSION_KEY}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${MANUAL_SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearManualSessionCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${MANUAL_SESSION_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

function readManualSession() {
  const storage = getStorage();
  try {
    const raw = storage?.getItem(MANUAL_SESSION_KEY);
    let parsed = raw ? JSON.parse(raw) : null;

    if (!parsed?.email) {
      parsed = readManualSessionCookie();
      if (parsed?.email && storage) {
        storage.setItem(MANUAL_SESSION_KEY, JSON.stringify(parsed));
      }
    }

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
  const storage = getStorage();
  const session = { email };
  storage?.setItem(MANUAL_SESSION_KEY, JSON.stringify(session));
  writeManualSessionCookie(session);
  notifySessionChanged();
}

function clearManualSession() {
  const storage = getStorage();
  storage?.removeItem(MANUAL_SESSION_KEY);
  clearManualSessionCookie();
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
    window.addEventListener("storage", syncManualUser);
    return () => {
      window.removeEventListener(SESSION_EVENT, syncManualUser);
      window.removeEventListener("storage", syncManualUser);
    };
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
