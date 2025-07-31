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
import { Shield, LogOut, Check, X, MessageSquare, Users, Clock, Wifi, WifiOff, AlertCircle, Trash2 } from "lucide-react"
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
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                School Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {adminName}</p>
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
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Status Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Parents waiting for confirmation</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{requests.length}</div>
              <p className="text-xs text-muted-foreground">All status requests</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Responded Today</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{processedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Confirmations sent</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span>Parent Status Requests</span>
              </CardTitle>
              <CardDescription>Parents are asking you to confirm their children's check-in/out status</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2 text-lg">No pending status requests</p>
                  <p className="text-sm text-gray-400">
                    Parent requests will appear here when they ask about their child's status
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border-2 border-yellow-200 rounded-xl p-6 bg-gradient-to-r from-yellow-50 to-orange-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <span className="font-bold text-lg text-yellow-800">
                              Parent asking: Has {request.childName} checked {request.type === "checkin" ? "IN" : "OUT"}
                              ?
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Child: {request.childName} - Grade {request.childGrade}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">Parent: {request.parentName}</p>
                          <p className="text-sm text-gray-500 mb-2">
                            Request sent: {new Date(request.timestamp).toLocaleString()}
                          </p>
                          <p className="text-sm text-blue-600 italic bg-blue-50 p-2 rounded">
                            "{request.requestMessage}"
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRequest(request.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
                        <h4 className="font-bold text-gray-900 text-lg">Provide Status Confirmation:</h4>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="block text-sm font-medium mb-2">Actual Status</Label>
                            <Select
                              value={responseStatus[request.id] || ""}
                              onValueChange={(value) => handleStatusChange(request.id, value)}
                            >
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="What actually happened?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="checked-in">✅ Child HAS checked in</SelectItem>
                                <SelectItem value="checked-out">✅ Child HAS checked out</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="block text-sm font-medium mb-2">Time</Label>
                            <Input
                              type="time"
                              value={checkTime[request.id] || ""}
                              onChange={(e) => handleTimeChange(request.id, e.target.value)}
                              placeholder="What time?"
                              className="h-12"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="block text-sm font-medium mb-2">Additional Information (Optional)</Label>
                          <Textarea
                            placeholder="Any additional details for the parent..."
                            value={feedbackText[request.id] || ""}
                            onChange={(e) => handleFeedbackChange(request.id, e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            onClick={() => updateRequestStatus(request.id, "approved")}
                            className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                            disabled={isLoading[request.id] || !responseStatus[request.id] || !checkTime[request.id]}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {isLoading[request.id] ? "Sending Confirmation..." : "Confirm Status to Parent"}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => updateRequestStatus(request.id, "rejected")}
                            className="flex-1 h-12"
                            disabled={isLoading[request.id]}
                          >
                            <X className="h-4 w-4 mr-2" />
                            {isLoading[request.id] ? "Sending..." : "Cannot Confirm"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>Response History</span>
              </CardTitle>
              <CardDescription>Status confirmations you've sent to parents</CardDescription>
            </CardHeader>
            <CardContent>
              {processedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2 text-lg">No responses sent yet</p>
                  <p className="text-sm text-gray-400">Your status confirmations will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {processedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 shadow-md"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="font-semibold text-lg">
                            Status Request: {request.childName} check-{request.type === "checkin" ? "in" : "out"}
                          </span>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status === "approved" ? "Confirmed" : "Could not confirm"}
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
                      <p className="text-sm text-gray-600 mb-1">
                        Child: {request.childName} - Grade {request.childGrade}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">Parent: {request.parentName}</p>
                      {request.feedback && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm text-green-800">Your Response:</span>
                          </div>
                          <p className="text-sm text-green-800 mb-2">{request.feedback}</p>
                          {request.responseTime && (
                            <p className="text-xs text-green-600">Sent: {request.responseTime}</p>
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
