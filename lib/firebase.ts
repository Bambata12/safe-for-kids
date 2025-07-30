// Import core Firebase services
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB6X2iAQgXLlCX4ttvfbDVO9vMMwL6dcOw",
  authDomain: "children-4b502.firebaseapp.com",
  projectId: "children-4b502",
  storageBucket: "children-4b502.firebasestorage.app",
  messagingSenderId: "617417415727",
  appId: "1:617417415727:web:b576275f1a5d8b68f2fada",
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig)

// Export Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
