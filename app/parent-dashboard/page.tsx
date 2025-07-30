"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Baby,
  LogOut,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
} from "lucide-react"
import { createCheckinRequest, logoutUser } from "@/lib/firebase-service"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ParentDashboard() {
  const [requests, setRequests] = useState([])
  const [children, setChildren] = useState([{ name: "", grade: "" }])
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedChild, setSelectedChild] = useState("")
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication and load user profile
    const checkAuth = () => {
      const userEmail = localStorage.getItem("userEmail")
      const userName = localStorage.getItem("userName")
      const userType = localStorage.getItem("userType")

      if (!userEmail || userType !== "parent") {
        router.push("/")
        return
      }

      const profile = {
        email: userEmail,
        name: userName || "Parent",
        userType: "parent",
      }

      setUserProfile(profile)
      setLoading(false)

      // Load saved children from localStorage
      const savedChildren = localStorage.getItem(`children_${userEmail}`)
      if (savedChildren) {
        try {
          setChildren(JSON.parse(savedChildren))
        } catch (e) {
          console.error("Error parsing saved children:", e)
        }
      }

      // Load requests
      loadRequests(userEmail)
    }

    checkAuth()
  }, [router])

  const loadRequests = (parentEmail) => {
    // Load from localStorage and ensure proper syncing
    const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
    const userRequests = allRequests.filter((req) => req.parentEmail === parentEmail)
    setRequests(userRequests)
  }

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleLogout = async () => {
    // Clear all localStorage data
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userType")
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("adminName")

    // Try Firebase logout
    try {
      await logoutUser()
    } catch (error) {
      console.log("Firebase logout failed, but continuing with local logout")
    }

    router.push("/")
  }

  const addChild = () => {
    setChildren([...children, { name: "", grade: "" }])
  }

  const removeChild = (index) => {
    const newChildren = children.filter((_, i) => i !== index)
    setChildren(newChildren)
    if (userProfile) {
      localStorage.setItem(`children_${userProfile.email}`, JSON.stringify(newChildren))
    }
  }

  const updateChild = (index, field, value) => {
    const newChildren = [...children]
    newChildren[index][field] = value
    setChildren(newChildren)
    if (userProfile) {
      localStorage.setItem(`children_${userProfile.email}`, JSON.stringify(newChildren))
    }
  }

  const createRequest = async (type) => {
    if (!userProfile || !selectedChild) {
      setError("Please select a child first")
      return
    }

    const child = children.find((c) => `${c.name} - Grade ${c.grade}` === selectedChild)
    if (!child) {
      setError("Selected child not found")
      return
    }

    setIsLoading(true)
    setError("")

    // Create request data
    const requestData = {
      type,
      childName: child.name,
      childGrade: child.grade,
      parentEmail: userProfile.email,
      parentName: userProfile.name,
      requestMessage: `Please confirm if ${child.name} has ${type === "checkin" ? "checked in to" : "checked out from"} school and provide the time.`,
    }

    // Try Firebase first, then fallback to localStorage
    try {
      const result = await createCheckinRequest(requestData)
      if (result.success) {
        // Force reload requests immediately
        setTimeout(() => loadRequests(userProfile.email), 100)
        setError("")
      } else {
        setError(result.error || "Failed to create request")
      }
    } catch (error) {
      // Direct localStorage fallback if Firebase completely fails
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

      // Force reload requests immediately
      setTimeout(() => loadRequests(userProfile.email), 100)
      setError("")
    }

    setIsLoading(false)
  }

  const deleteRequest = async (requestId) => {
    if (!confirm("Are you sure you want to delete this request?")) {
      return
    }

    // Remove from localStorage
    const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
    const updatedRequests = allRequests.filter((req) => req.id !== requestId)
    localStorage.setItem("allRequests", JSON.stringify(updatedRequests))

    // Reload requests to update the UI
    if (userProfile) {
      loadRequests(userProfile.email)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Please log in to access the parent dashboard.</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const validChildren = children.filter((child) => child.name && child.grade)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Baby className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome, {userProfile.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Children</CardTitle>
              <CardDescription>Add your children and their grades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {children.map((child, index) => (
                <div key={index} className="flex space-x-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`child-name-${index}`}>Child Name</Label>
                    <Input
                      id={`child-name-${index}`}
                      value={child.name}
                      onChange={(e) => updateChild(index, "name", e.target.value)}
                      placeholder="Enter child's name"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`child-grade-${index}`}>Grade</Label>
                    <Select value={child.grade} onValueChange={(value) => updateChild(index, "grade", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pre-K">Pre-K</SelectItem>
                        <SelectItem value="Kindergarten">Kindergarten</SelectItem>
                        <SelectItem value="1st">1st Grade</SelectItem>
                        <SelectItem value="2nd">2nd Grade</SelectItem>
                        <SelectItem value="3rd">3rd Grade</SelectItem>
                        <SelectItem value="4th">4th Grade</SelectItem>
                        <SelectItem value="5th">5th Grade</SelectItem>
                        <SelectItem value="6th">6th Grade</SelectItem>
                        <SelectItem value="7th">7th Grade</SelectItem>
                        <SelectItem value="8th">8th Grade</SelectItem>
                        <SelectItem value="9th">9th Grade</SelectItem>
                        <SelectItem value="10th">10th Grade</SelectItem>
                        <SelectItem value="11th">11th Grade</SelectItem>
                        <SelectItem value="12th">12th Grade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {children.length > 1 && (
                    <Button variant="outline" size="icon" onClick={() => removeChild(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={addChild} variant="outline" className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Child
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Status Check</CardTitle>
              <CardDescription>Ask the school to confirm your child's attendance status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="child-select">Select Child</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {validChildren.map((child, index) => (
                      <SelectItem key={index} value={`${child.name} - Grade ${child.grade}`}>
                        {child.name} - Grade {child.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => createRequest("checkin")}
                className="w-full"
                size="lg"
                disabled={isLoading || !selectedChild}
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Ask: Has my child checked IN?"}
              </Button>
              <Button
                onClick={() => createRequest("checkout")}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isLoading || !selectedChild}
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Ask: Has my child checked OUT?"}
              </Button>

              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <p>
                  The school admin will confirm if your child has actually checked in/out and provide the exact time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status Requests & Responses</CardTitle>
            <CardDescription>Your requests to the school and their responses</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No status requests yet.</p>
                <p className="text-sm text-gray-400">
                  Send a request above to ask the school about your child's check-in/out status.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2 flex-1">
                        {getStatusIcon(request.status)}
                        <span className="font-medium">
                          Status Request: Has {request.childName} checked {request.type === "checkin" ? "IN" : "OUT"}?
                        </span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === "pending" ? "Waiting for school response" : request.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {request.timestamp?.toDate
                            ? request.timestamp.toDate().toLocaleString()
                            : new Date(request.timestamp).toLocaleString()}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRequest(request.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Child: {request.childName} - Grade {request.childGrade}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">Your request: "{request.requestMessage}"</p>

                    {request.status === "pending" && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3 mt-2">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          ⏳ Waiting for school admin to confirm your child's status...
                        </p>
                      </div>
                    )}

                    {request.feedback && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mt-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm text-blue-800 dark:text-blue-200">School Response:</span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{request.feedback}</p>
                        {request.responseTime && (
                          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                            Response received: {request.responseTime}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
