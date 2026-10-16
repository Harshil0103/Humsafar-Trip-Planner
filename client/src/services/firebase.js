import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Firebase configuration from environment variables or live project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCtpyy5KSJCgTPdqh8ad9oVT-CoTYOWxGs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'humsafar-trip-planner-2026.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'humsafar-trip-planner-2026',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'humsafar-trip-planner-2026.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '602581372815',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:602581372815:web:4742bae83a3a22283145fa'
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Friendly error message translator for Firebase Auth errors
 */
export function formatFirebaseAuthError(error) {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return 'Google Sign-In provider has not been enabled yet in Firebase Console. Please enable Google under Authentication > Sign-in method, or use Instant Google Traveler Login below.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations. Please add this domain in Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again in a few moments.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Sign up with Email and Password via Firebase
 */
export async function firebaseRegister(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  } catch (error) {
    const err = new Error(formatFirebaseAuthError(error));
    err.code = error.code || '';
    throw err;
  }
}

/**
 * Sign in with Email and Password via Firebase
 */
export async function firebaseLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const err = new Error(formatFirebaseAuthError(error));
    err.code = error.code || '';
    throw err;
  }
}

/**
 * Sign in with Google Popup via Firebase
 */
export async function firebaseGoogleSignIn() {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error) {
    const err = new Error(formatFirebaseAuthError(error));
    err.code = error.code || '';
    throw err;
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function firebaseSignOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase SignOut Error:', error);
  }
}

/**
 * Cloud Firestore User Trip Storage Helpers
 */
export async function saveTripToFirestore(userId, tripData) {
  if (!userId || !tripData) return;
  try {
    const tripRef = doc(db, `users/${userId}/trips`, String(tripData.id || Date.now()));
    await setDoc(tripRef, {
      ...tripData,
      updated_at: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore trip sync notice (using local DB persistence):', err.message);
  }
}

export async function getTripsFromFirestore(userId) {
  if (!userId) return [];
  try {
    const tripsRef = collection(db, `users/${userId}/trips`);
    const snapshot = await getDocs(tripsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Firestore getTrips notice:', err.message);
    return [];
  }
}

export async function deleteTripFromFirestore(userId, tripId) {
  if (!userId || !tripId) return;
  try {
    const tripRef = doc(db, `users/${userId}/trips`, String(tripId));
    await deleteDoc(tripRef);
  } catch (err) {
    console.warn('Firestore delete notice:', err.message);
  }
}

export default {
  app,
  auth,
  db,
  googleProvider,
  firebaseRegister,
  firebaseLogin,
  firebaseGoogleSignIn,
  firebaseSignOut,
  saveTripToFirestore,
  getTripsFromFirestore,
  deleteTripFromFirestore,
  formatFirebaseAuthError
};
