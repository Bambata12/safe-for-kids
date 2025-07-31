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
  Heart,
  Star,
  Shield,
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
        return "bg-gradient-to-r from-yellow-500 to-orange-500"
      case "approved":
        return "bg-gradient-to-r from-green-500 to-emerald-500"
      case "rejected":
        return "bg-gradient-to-r from-red-500 to-pink-500"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Baby className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Parent Dashboard
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <p className="text-gray-600 text-lg">Welcome back, {user.name}!</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isOnline ? "default" : "destructive"} className="px-4 py-2 text-sm font-semibold">
              {isOnline ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
              {isOnline ? "Connected" : "Offline"}
            </Badge>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">Premium</span>
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={onLogout}
              className="shadow-lg bg-white/80 backdrop-blur-sm border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50" variant="destructive">
            <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Baby className="h-6 w-6 text-blue-600" />
                <span>Manage Children</span>
              </CardTitle>
              <CardDescription className="text-lg">Add your children and their grade levels</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              {children.map((child, index) => (
                <div
                  key={index}
                  className="flex space-x-4 items-end p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50"
                >
                  <div className="flex-1">
                    <Label htmlFor={`child-name-${index}`} className="text-sm font-semibold text-gray-700">
                      Child Name
                    </Label>
                    <Input
                      id={`child-name-${index}`}
                      value={child.name}
                      onChange={(e) => updateChild(index, "name", e.target.value)}
                      placeholder="Enter child's name"
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`child-grade-${index}`} className="text-sm font-semibold text-gray-700">
                      Grade
                    </Label>
                    <Select value={child.grade} onValueChange={(value) => updateChild(index, "grade", value)}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm">
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
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeChild(index)}
                      className="h-12 w-12 border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                onClick={addChild}
                variant="outline"
                className="w-full h-12 bg-white/60 backdrop-blur-sm border-2 border-dashed border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-600 font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Another Child
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-green-50 to-emerald-100 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Send className="h-6 w-6 text-green-600" />
                <span>Request Status Check</span>
              </CardTitle>
              <CardDescription className="text-lg">Ask the school to confirm your child's attendance</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div>
                <Label htmlFor="child-select" className="text-sm font-semibold text-gray-700">
                  Select Child
                </Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/80 backdrop-blur-sm">
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
                className="w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 hover:from-green-700 hover:via-emerald-700 hover:to-teal-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl text-lg"
                size="lg"
                disabled={isLoading || !selectedChild}
              >
                <Send className="h-5 w-5 mr-3" />
                {isLoading ? "Sending..." : "Ask: Has my child checked IN?"}
              </Button>
              <Button
                onClick={() => createRequest("checkout")}
                variant="outline"
                className="w-full h-14 border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 text-purple-600 font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm text-lg"
                size="lg"
                disabled={isLoading || !selectedChild}
              >
                <Send className="h-5 w-5 mr-3" />
                {isLoading ? "Sending..." : "Ask: Has my child checked OUT?"}
              </Button>

              <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">How it works:</span>
                </div>
                <p>
                  The school admin will confirm if your child has actually checked in/out and provide the exact time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-purple-50 to-pink-100 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-rose-500/10"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <span>Status Requests & Responses</span>
            </CardTitle>
            <CardDescription className="text-lg">Your requests to the school and their responses</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-3 text-xl font-semibold">No status requests yet</p>
                <p className="text-gray-400 text-lg">
                  Send a request above to ask the school about your child's check-in/out status.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border-2 border-white/50 rounded-2xl p-6 bg-gradient-to-r from-white via-gray-50 to-white shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                          {getStatusIcon(request.status)}
                        </div>
                        <div>
                          <span className="font-bold text-xl text-gray-900">
                            Status Request: Has {request.childName} checked {request.type === "checkin" ? "IN" : "OUT"}?
                          </span>
                          <Badge
                            className={`${getStatusColor(request.status)} text-white ml-3 px-3 py-1 text-sm font-semibold`}
                          >
                            {request.status === "pending" ? "Waiting for school response" : request.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 font-medium">
                          {new Date(request.timestamp).toLocaleString()}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRequest(request.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-4">
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Child: {request.childName} - Grade {request.childGrade}
                      </p>
                      <p className="text-sm text-blue-600 italic">Your request: "{request.requestMessage}"</p>
                    </div>

                    {request.status === "pending" && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-yellow-800 font-semibold">⏳ Waiting for school admin response...</p>
                            <p className="text-yellow-700 text-sm">
                              We'll notify you as soon as the school confirms your child's status.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {request.feedback && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-bold text-green-800 text-lg">School Response:</span>
                        </div>
                        <p className="text-green-800 font-medium mb-2 text-lg">{request.feedback}</p>
                        {request.responseTime && (
                          <p className="text-green-600 text-sm font-medium">
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
