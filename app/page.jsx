"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Baby, Users, Shield, CheckCircle, Zap, Lock, Smartphone } from "lucide-react"
import LoginForm from "@/components/LoginForm"
import ParentDashboard from "@/components/ParentDashboard"
import AdminDashboard from "@/components/AdminDashboard"

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [adminName, setAdminName] = useState("")

  useEffect(() => {
    // Check if user is already logged in
    const savedUserType = localStorage.getItem("userType")
    const savedUserEmail = localStorage.getItem("userEmail")
    const savedUserName = localStorage.getItem("userName")
    const savedAdminName = localStorage.getItem("adminName")
    const isAdmin = localStorage.getItem("isAdmin") === "true"

    if (savedUserType === "parent" && savedUserEmail && savedUserName) {
      setCurrentUser({
        email: savedUserEmail,
        name: savedUserName,
        userType: "parent",
      })
      setUserType("parent")
    } else if (isAdmin && savedAdminName) {
      setUserType("admin")
      setAdminName(savedAdminName)
    }
  }, [])

  const handleParentLogin = (userData) => {
    setCurrentUser(userData)
    setUserType("parent")
    localStorage.setItem("userEmail", userData.email)
    localStorage.setItem("userName", userData.name)
    localStorage.setItem("userType", "parent")
  }

  const handleParentSignup = (userData) => {
    setCurrentUser(userData)
    setUserType("parent")
    localStorage.setItem("userEmail", userData.email)
    localStorage.setItem("userName", userData.name)
    localStorage.setItem("userType", "parent")
  }

  const handleAdminLogin = (name, password) => {
    if (password === "123456" && name.trim()) {
      setUserType("admin")
      setAdminName(name)
      localStorage.setItem("isAdmin", "true")
      localStorage.setItem("adminName", name)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setUserType(null)
    setAdminName("")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userType")
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("adminName")
  }

  // Show dashboards if logged in
  if (userType === "parent" && currentUser) {
    return <ParentDashboard user={currentUser} onLogout={handleLogout} />
  }

  if (userType === "admin" && adminName) {
    return <AdminDashboard adminName={adminName} onLogout={handleLogout} />
  }

  // Show login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              KidCheck
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Trusted by 1000+ Schools</span>
          </div>

          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Safe & Secure Child
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Check-in System
            </span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Keep track of your child's school attendance with real-time updates and secure communication between parents
            and administrators.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Instant Updates</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Lock className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Smartphone className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Mobile Friendly</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">For Parents</CardTitle>
              <CardDescription className="text-gray-600">
                Request check-ins and receive instant updates about your child's attendance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Real-time notifications</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">For Administrators</CardTitle>
              <CardDescription className="text-gray-600">
                Manage check-in requests efficiently and provide quick feedback to parents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-green-700">Easy management</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Real-time Updates</CardTitle>
              <CardDescription className="text-gray-600">
                Get instant notifications and updates about your child's school attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-purple-700">Always connected</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login/Signup Tabs */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="parent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/80 backdrop-blur-sm shadow-lg">
              <TabsTrigger
                value="parent"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4" />
                <span>Parent Access</span>
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Access</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="parent">
              <LoginForm onLogin={handleParentLogin} onSignup={handleParentSignup} />
            </TabsContent>

            <TabsContent value="admin">
              <AdminLoginForm onLogin={handleAdminLogin} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Admin Login Component
function AdminLoginForm({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name")
    const password = formData.get("password")

    const success = onLogin(name, password)

    if (!success) {
      setError("Invalid admin credentials. Please check your name and password.")
    }

    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Administrator Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Access the admin panel to manage check-in requests
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-name" className="text-sm font-medium text-gray-700">
                Admin Name
              </label>
              <input
                id="admin-name"
                name="name"
                type="text"
                required
                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Admin Sign In"}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            Demo password: <strong>123456</strong>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
