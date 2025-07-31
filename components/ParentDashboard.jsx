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
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ParentDashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([])
  const [children, setChildren] = useState([{ name: "", grade: "" }])
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedChild, setSelectedChild] = useState("")

  useEffect(() => {
    // Load saved children from localStorage
    const savedChildren = localStorage.getItem(`children_${user.email}`)
    if (savedChildren) {
      try {
        setChildren(JSON.parse(savedChildren))
      } catch (e) {
        console.error("Error parsing saved children:", e)
      }
    }

    // Load requests
    loadRequests()

    // Set up polling for real-time updates
    const interval = setInterval(loadRequests, 3000)
    return () => clearInterval(interval)
  }, [user.email])

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
    const userRequests = allRequests.filter((req) => req.parentEmail === user.email)
    // Sort by timestamp to show newest first
    const sortedRequests = userRequests.sort((a, b) => {
      const timeA = new Date(a.timestamp)
      const timeB = new Date(b.timestamp)
      return timeB - timeA
    })
    setRequests(sortedRequests)
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

  const addChild = () => {
    setChildren([...children, { name: "", grade: "" }])
  }

  const removeChild = (index) => {
    const newChildren = children.filter((_, i) => i !== index)
    setChildren(newChildren)
    localStorage.setItem(`children_${user.email}`, JSON.stringify(newChildren))
  }

  const updateChild = (index, field, value) => {
    const newChildren = [...children]
    newChildren[index][field] = value
    setChildren(newChildren)
    localStorage.setItem(`children_${user.email}`, JSON.stringify(newChildren))
  }

  const createRequest = async (type) => {
    if (!selectedChild) {
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
    const requestId = Date.now().toString()
    const request = {
      id: requestId,
      type,
      childName: child.name,
      childGrade: child.grade,
      parentEmail: user.email,
      parentName: user.name,
      requestMessage: `Please confirm if ${child.name} has ${type === "checkin" ? "checked in to" : "checked out from"} school and provide the time.`,
      status: "pending",
      timestamp: new Date().toISOString(),
    }

    // Save to localStorage
    const existingRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
    existingRequests.unshift(request)
    localStorage.setItem("allRequests", JSON.stringify(existingRequests))

    // Reload requests immediately
    setTimeout(() => loadRequests(), 100)
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
    loadRequests()
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

  const validChildren = children.filter((child) => child.name && child.grade)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Parent Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <ThemeToggle />
            <Button variant="outline" onClick={onLogout} className="shadow-lg bg-transparent">
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

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Baby className="h-5 w-5 text-blue-600" />
                <span>Manage Children</span>
              </CardTitle>
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
                      className="h-10"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`child-grade-${index}`}>Grade</Label>
                    <Select value={child.grade} onValueChange={(value) => updateChild(index, "grade", value)}>
                      <SelectTrigger className="h-10">
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
                    <Button variant="outline" size="icon" onClick={() => removeChild(index)} className="h-10 w-10">
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

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5 text-green-600" />
                <span>Request Status Check</span>
              </CardTitle>
              <CardDescription>Ask the school to confirm your child's attendance status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="child-select">Select Child</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger className="h-12">
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
                className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                size="lg"
                disabled={isLoading || !selectedChild}
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Ask: Has my child checked IN?"}
              </Button>
              <Button
                onClick={() => createRequest("checkout")}
                variant="outline"
                className="w-full h-12 border-2 border-purple-200 hover:bg-purple-50"
                size="lg"
                disabled={isLoading || !selectedChild}
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Ask: Has my child checked OUT?"}
              </Button>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>
                  The school admin will confirm if your child has actually checked in/out and provide the exact time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <span>Status Requests & Responses</span>
            </CardTitle>
            <CardDescription>Your requests to the school and their responses</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2 text-lg">No status requests yet.</p>
                <p className="text-sm text-gray-400">
                  Send a request above to ask the school about your child's check-in/out status.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        {getStatusIcon(request.status)}
                        <span className="font-semibold text-lg">
                          Status Request: Has {request.childName} checked {request.type === "checkin" ? "IN" : "OUT"}?
                        </span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === "pending" ? "Waiting for school response" : request.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">{new Date(request.timestamp).toLocaleString()}</span>
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
                    <p className="text-sm text-gray-600 mb-2">
                      Child: {request.childName} - Grade {request.childGrade}
                    </p>
                    <p className="text-sm text-gray-500 mb-3 italic">Your request: "{request.requestMessage}"</p>

                    {request.status === "pending" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                        <p className="text-sm text-yellow-800 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />⏳ Waiting for school admin to confirm your child's
                          status...
                        </p>
                      </div>
                    )}

                    {request.feedback && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm text-blue-800">School Response:</span>
                        </div>
                        <p className="text-sm text-blue-800 mb-2">{request.feedback}</p>
                        {request.responseTime && (
                          <p className="text-xs text-blue-600">Response received: {request.responseTime}</p>
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
