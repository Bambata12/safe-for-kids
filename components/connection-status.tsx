"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { WifiOff, Database, XIcon as DatabaseX } from "lucide-react"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check Firebase connection
    const checkFirebaseConnection = () => {
      const hasFirebaseError = localStorage.getItem("firebaseError") === "true"
      setIsFirebaseConnected(!hasFirebaseError)
    }

    checkFirebaseConnection()
    const interval = setInterval(checkFirebaseConnection, 5000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  if (!isOnline) {
    return (
      <Badge variant="destructive">
        <WifiOff className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    )
  }

  if (!isFirebaseConnected) {
    return (
      <Badge variant="secondary">
        <DatabaseX className="h-3 w-3 mr-1" />
        Local Mode
      </Badge>
    )
  }

  return (
    <Badge variant="default">
      <Database className="h-3 w-3 mr-1" />
      Connected
    </Badge>
  )
}
