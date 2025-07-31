"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Shield,
  LogOut,
  Check,
  X,
  MessageSquare,
  Users,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
  Trash2,
  Star,
  Award,
  Bell,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminDashboard({ adminName, onLogout }) {
  const [requests, setRequests] = useState([])
  const [feedbackText, setFeedbackText] = useState({})
  const [responseStatus, setResponseStatus] = useState({})
  const [checkTime, setCheckTime] = useState({})
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState({})
  const [error, setError] = useState("")

  useEffect(() => {
    // Load requests
    loadRequests()

    // Set up polling for real-time updates
    const interval = setInterval(loadRequests, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
    // Sort by timestamp to show newest first
    const sortedRequests = allRequests.sort((a, b) => {
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

  const updateRequestStatus = async (requestId, status) => {
    const request = requests.find((r) => r.id === requestId)
    if (!request) return

    const selectedStatus = responseStatus[requestId]
    const selectedTime = checkTime[requestId]
    const additionalFeedback = feedbackText[requestId]

    if (!selectedStatus) {
      setError("Please select whether the child has checked in or out")
      return
    }

    if (!selectedTime) {
      setError("Please provide the time")
      return
    }

    setIsLoading((prev) => ({ ...prev, [requestId]: true }))
    setError("")

    let responseMessage = ""

    if (status === "approved") {
      const actionWord = selectedStatus === "checked-in" ? "checked in to" : "checked out from"
      responseMessage = `✅ CONFIRMED: ${request.childName} has ${actionWord} school at ${selectedTime}.`

      if (additionalFeedback) {
        responseMessage += ` Additional info: ${additionalFeedback}`
      }
    } else {
      responseMessage = `❌ Unable to confirm status for ${request.childName} at this time. ${additionalFeedback || "Please contact the school office for more information."}`
    }

    // Update localStorage
    const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
    const requestIndex = allRequests.findIndex((req) => req.id === requestId)

    if (requestIndex !== -1) {
      allRequests[requestIndex] = {
        ...allRequests[requestIndex],
        status,
        feedback: responseMessage,
        responseTime: new Date().toLocaleString(),
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem("allRequests", JSON.stringify(allRequests))

      // Clear form data for this request
      setFeedbackText((prev) => ({ ...prev, [requestId]: "" }))
      setResponseStatus((prev) => ({ ...prev, [requestId]: "" }))
      setCheckTime((prev) => ({ ...prev, [requestId]: "" }))

      // Force reload requests immediately
      setTimeout(() => loadRequests(), 100)
    }

    setIsLoading((prev) => ({ ...prev, [requestId]: false }))
  }

  const handleFeedbackChange = (requestId, text) => {
    setFeedbackText((prev) => ({ ...prev, [requestId]: text }))
  }

  const handleStatusChange = (requestId, status) => {
    setResponseStatus((prev) => ({ ...prev, [requestId]: status }))
  }

  const handleTimeChange = (requestId, time) => {
    setCheckTime((prev) => ({ ...prev, [requestId]: time }))
  }

  const deleteRequest = async (requestId) => {
    if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) {
      return
    }

    // Remove from localStorage
    const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
    const updatedRequests = allRequests.filter((req) => req.id !== requestId)
    localStorage.setItem("allRequests", JSON.stringify(updatedRequests))

    // Clear any form data for this request
    setFeedbackText((prev) => ({ ...prev, [requestId]: "" }))
    setResponseStatus((prev) => ({ ...prev, [requestId]: "" }))
    setCheckTime((prev) => ({ ...prev, [requestId]: "" }))

    // Reload requests to update the UI
    loadRequests()
  }

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const processedRequests = requests.filter((req) => req.status !== "pending")

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-green-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                School Admin Dashboard
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <Award className="h-4 w-4 text-green-500" />
                <p className="text-gray-600 text-lg">Welcome, {adminName}</p>
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
              <span className="text-sm font-semibold text-gray-700">Admin</span>
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
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-yellow-50 to-orange-100 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Pending Requests</CardTitle>
              <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold text-yellow-600 mb-2">{pendingRequests.length}</div>
              <p className="text-sm text-yellow-700 font-medium">Parents waiting for confirmation</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Total Requests</CardTitle>
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold text-blue-600 mb-2">{requests.length}</div>
              <p className="text-sm text-blue-700 font-medium">All status requests</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-green-50 to-emerald-100 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Responded Today</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold text-green-600 mb-2">{processedRequests.length}</div>
              <p className="text-sm text-green-700 font-medium">Confirmations sent</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-yellow-50 to-orange-100 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Bell className="h-6 w-6 text-yellow-600" />
                <span>Parent Status Requests</span>
              </CardTitle>
              <CardDescription className="text-lg">
                Parents are asking you to confirm their children's check-in/out status
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-3 text-xl font-semibold">No pending status requests</p>
                  <p className="text-gray-400 text-lg">
                    Parent requests will appear here when they ask about their child's status
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border-2 border-yellow-300 rounded-2xl p-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 shadow-xl backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
                              <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <span className="font-bold text-xl text-yellow-800">
                              Parent asking: Has {request.childName} checked {request.type === "checkin" ? "IN" : "OUT"}
                              ?
                            </span>
                          </div>
                          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 mb-4">
                            <p className="text-sm text-gray-700 font-medium mb-1">
                              Child: {request.childName} - Grade {request.childGrade}
                            </p>
                            <p className="text-sm text-gray-700 font-medium mb-1">Parent: {request.parentName}</p>
                            <p className="text-sm text-gray-500 mb-2">
                              Request sent: {new Date(request.timestamp).toLocaleString()}
                            </p>
                            <p className="text-sm text-blue-600 italic bg-blue-50 p-3 rounded-lg border border-blue-200">
                              "{request.requestMessage}"
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRequest(request.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 ml-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
                        <h4 className="font-bold text-gray-900 text-xl flex items-center space-x-2">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                          <span>Provide Status Confirmation:</span>
                        </h4>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label className="block text-sm font-semibold mb-3 text-gray-700">Actual Status</Label>
                            <Select
                              value={responseStatus[request.id] || ""}
                              onValueChange={(value) => handleStatusChange(request.id, value)}
                            >
                              <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/80 backdrop-blur-sm">
                                <SelectValue placeholder="What actually happened?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="checked-in">✅ Child HAS checked in</SelectItem>
                                <SelectItem value="checked-out">✅ Child HAS checked out</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="block text-sm font-semibold mb-3 text-gray-700">Time</Label>
                            <Input
                              type="time"
                              value={checkTime[request.id] || ""}
                              onChange={(e) => handleTimeChange(request.id, e.target.value)}
                              placeholder="What time?"
                              className="h-14 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/80 backdrop-blur-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="block text-sm font-semibold mb-3 text-gray-700">
                            Additional Information (Optional)
                          </Label>
                          <Textarea
                            placeholder="Any additional details for the parent..."
                            value={feedbackText[request.id] || ""}
                            onChange={(e) => handleFeedbackChange(request.id, e.target.value)}
                            className="min-h-[100px] border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/80 backdrop-blur-sm"
                          />
                        </div>

                        <div className="flex space-x-4">
                          <Button
                            onClick={() => updateRequestStatus(request.id, "approved")}
                            className="flex-1 h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 hover:from-green-700 hover:via-emerald-700 hover:to-teal-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl text-lg"
                            disabled={isLoading[request.id] || !responseStatus[request.id] || !checkTime[request.id]}
                          >
                            <Check className="h-5 w-5 mr-3" />
                            {isLoading[request.id] ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Sending...</span>
                              </div>
                            ) : (
                              "Confirm Status to Parent"
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => updateRequestStatus(request.id, "rejected")}
                            className="flex-1 h-14 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl text-lg"
                            disabled={isLoading[request.id]}
                          >
                            <X className="h-5 w-5 mr-3" />
                            {isLoading[request.id] ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Sending...</span>
                              </div>
                            ) : (
                              "Cannot Confirm"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-green-50 to-emerald-100 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <MessageSquare className="h-6 w-6 text-green-600" />
                <span>Response History</span>
              </CardTitle>
              <CardDescription className="text-lg">Status confirmations you've sent to parents</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {processedRequests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-3 text-xl font-semibold">No responses sent yet</p>
                  <p className="text-gray-400 text-lg">Your status confirmations will appear here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {processedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border-2 border-white/50 rounded-2xl p-6 bg-gradient-to-r from-white via-gray-50 to-white shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <span className="font-bold text-xl text-gray-900">
                              Status Request: {request.childName} check-{request.type === "checkin" ? "in" : "out"}
                            </span>
                            <Badge
                              className={`${getStatusColor(request.status)} text-white ml-3 px-3 py-1 text-sm font-semibold`}
                            >
                              {request.status === "approved" ? "Confirmed" : "Could not confirm"}
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
                        <p className="text-sm text-blue-800 font-medium">Parent: {request.parentName}</p>
                      </div>
                      {request.feedback && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-green-800 text-lg">Your Response:</span>
                          </div>
                          <p className="text-green-800 font-medium mb-2 text-lg">{request.feedback}</p>
                          {request.responseTime && (
                            <p className="text-green-600 text-sm font-medium">Sent: {request.responseTime}</p>
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
    </div>
  )
}
