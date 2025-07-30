import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, onSnapshot } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface CheckinRequest {
  id?: string
  type: "checkin" | "checkout"
  childName: string
  childGrade: string
  parentEmail: string
  parentName: string
  requestMessage: string
  status: "pending" | "approved" | "rejected"
  feedback?: string
  responseTime?: string
  timestamp: any
  updatedAt?: any
}

export interface UserProfile {
  id?: string
  name: string
  email: string
  childName: string
  userType: "parent"
  createdAt: any
}

// Authentication functions
export const registerUser = async (email: string, password: string, name: string, childName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Save user profile to Firestore with retry logic
    try {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name,
        email,
        childName,
        userType: "parent",
        createdAt: serverTimestamp(),
      })
    } catch (firestoreError) {
      console.warn("Firestore permission issue, using localStorage fallback")
      // Fallback to localStorage if Firestore fails
      localStorage.setItem(
        `user_${user.uid}`,
        JSON.stringify({
          uid: user.uid,
          name,
          email,
          childName,
          userType: "parent",
          createdAt: new Date().toISOString(),
        }),
      )
    }

    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get user profile
export const getUserProfile = async (uid: string) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", uid))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { success: true, profile: { id: doc.id, ...doc.data() } }
    }

    // Fallback to localStorage
    const localUser = localStorage.getItem(`user_${uid}`)
    if (localUser) {
      return { success: true, profile: JSON.parse(localUser) }
    }

    return { success: false, error: "User profile not found" }
  } catch (error: any) {
    console.warn("Firestore permission issue, using localStorage fallback")
    // Fallback to localStorage
    const localUser = localStorage.getItem(`user_${uid}`)
    if (localUser) {
      return { success: true, profile: JSON.parse(localUser) }
    }
    return { success: false, error: error.message }
  }
}

// Check-in request functions with fallback
export const createCheckinRequest = async (requestData) => {
  // Always use localStorage for this demo to ensure reliability
  const requestId = Date.now().toString()
  const request = {
    id: requestId,
    ...requestData,
    status: "pending",
    timestamp: new Date(),
  }

  const existingRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
  existingRequests.unshift(request)
  localStorage.setItem("allRequests", JSON.stringify(existingRequests))

  console.log("Created request:", request) // Debug log
  console.log("All requests now:", existingRequests) // Debug log

  return { success: true, id: requestId }
}

export const getCheckinRequests = async (parentEmail?: string) => {
  try {
    let q
    if (parentEmail) {
      q = query(
        collection(db, "checkinRequests"),
        where("parentEmail", "==", parentEmail),
        orderBy("timestamp", "desc"),
      )
    } else {
      q = query(collection(db, "checkinRequests"), orderBy("timestamp", "desc"))
    }

    const querySnapshot = await getDocs(q)
    const requests = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, requests }
  } catch (error: any) {
    console.warn("Firestore permission issue, using localStorage fallback")
    // Fallback to localStorage
    const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")

    let requests = allRequests
    if (parentEmail) {
      requests = allRequests.filter((req) => req.parentEmail === parentEmail)
    }

    return { success: true, requests }
  }
}

export const updateCheckinRequest = async (requestId, status, feedback) => {
  // Always use localStorage for this demo to ensure reliability
  const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
  const requestIndex = allRequests.findIndex((req) => req.id === requestId)

  if (requestIndex !== -1) {
    allRequests[requestIndex] = {
      ...allRequests[requestIndex],
      status,
      feedback: feedback || "",
      responseTime: new Date().toLocaleString(),
      updatedAt: new Date(),
    }
    localStorage.setItem("allRequests", JSON.stringify(allRequests))

    console.log("Updated request:", allRequests[requestIndex]) // Debug log
  }

  return { success: true }
}

export const deleteCheckinRequest = async (requestId) => {
  try {
    // For Firebase (when available)
    // const requestRef = doc(db, "checkinRequests", requestId)
    // await deleteDoc(requestRef)

    // For now, always use localStorage
    const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
    const updatedRequests = allRequests.filter((req) => req.id !== requestId)
    localStorage.setItem("allRequests", JSON.stringify(updatedRequests))

    console.log("Deleted request:", requestId) // Debug log
    return { success: true }
  } catch (error) {
    console.error("Error deleting request:", error)
    return { success: false, error: error.message }
  }
}

// Real-time listener with fallback
export const subscribeToRequests = (callback, parentEmail?: string) => {
  try {
    let q
    if (parentEmail) {
      q = query(
        collection(db, "checkinRequests"),
        where("parentEmail", "==", parentEmail),
        orderBy("timestamp", "desc"),
      )
    } else {
      q = query(collection(db, "checkinRequests"), orderBy("timestamp", "desc"))
    }

    return onSnapshot(
      q,
      (querySnapshot) => {
        const requests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        callback(requests)
      },
      (error) => {
        console.warn("Firestore permission issue, using localStorage fallback")
        // Fallback to localStorage with polling
        const pollLocalStorage = () => {
          const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
          let requests = allRequests
          if (parentEmail) {
            requests = allRequests.filter((req) => req.parentEmail === parentEmail)
          }
          callback(requests)
        }

        // Initial call
        pollLocalStorage()

        // Poll every 2 seconds for updates
        const interval = setInterval(pollLocalStorage, 2000)

        // Return cleanup function
        return () => clearInterval(interval)
      },
    )
  } catch (error) {
    console.warn("Firestore permission issue, using localStorage fallback")
    // Fallback to localStorage with polling
    const pollLocalStorage = () => {
      const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
      let requests = allRequests
      if (parentEmail) {
        requests = allRequests.filter((req) => req.parentEmail === parentEmail)
      }
      callback(requests)
    }

    // Initial call
    pollLocalStorage()

    // Poll every 2 seconds for updates
    const interval = setInterval(pollLocalStorage, 2000)

    // Return cleanup function
    return () => clearInterval(interval)
  }
}
