"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Baby, Users, Shield, CheckCircle, Zap, Lock, Smartphone, Star, Heart, Award } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Baby className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                KidCheck
              </h1>
              <p className="text-gray-600 text-lg font-medium">Safe • Secure • Simple</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">4.9/5 Rating</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-full mb-8 shadow-lg backdrop-blur-sm border border-white/50">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-blue-800">Trusted by 10,000+ Schools Worldwide</span>
            <Heart className="h-4 w-4 text-pink-500 ml-2" />
          </div>

          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            Your Child's Safety,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Our Priority
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Experience peace of mind with real-time school attendance tracking, instant notifications, and secure
            communication between parents and administrators.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <Zap className="h-6 w-6 text-yellow-500" />
              <span className="text-lg font-semibold text-gray-700">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <Lock className="h-6 w-6 text-green-500" />
              <span className="text-lg font-semibold text-gray-700">Bank-Level Security</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <Smartphone className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-semibold text-gray-700">Mobile First</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <Award className="h-6 w-6 text-purple-500" />
              <span className="text-lg font-semibold text-gray-700">Award Winning</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10 group-hover:from-blue-500/20 group-hover:via-purple-500/10 group-hover:to-indigo-500/20 transition-all duration-500"></div>
            <CardHeader className="relative text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-3">For Parents</CardTitle>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                Stay connected with your child's school day through instant notifications and real-time status updates
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-3 rounded-xl border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">✨ Real-time notifications & peace of mind</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-green-50 to-emerald-100 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 group-hover:from-green-500/20 group-hover:via-emerald-500/10 group-hover:to-teal-500/20 transition-all duration-500"></div>
            <CardHeader className="relative text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-3">For Schools</CardTitle>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                Streamline attendance management with powerful admin tools and instant parent communication
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-3 rounded-xl border border-green-200">
                <span className="text-sm font-semibold text-green-700">🚀 Efficient management & happy parents</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-purple-50 to-pink-100 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-rose-500/10 group-hover:from-purple-500/20 group-hover:via-pink-500/10 group-hover:to-rose-500/20 transition-all duration-500"></div>
            <CardHeader className="relative text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-3">Always Connected</CardTitle>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                Never miss a moment with instant updates, offline support, and 24/7 reliable service
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3 rounded-xl border border-purple-200">
                <span className="text-sm font-semibold text-purple-700">💜 Always connected, always secure</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login/Signup Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="parent" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-2 border border-white/50">
              <TabsTrigger
                value="parent"
                className="flex items-center space-x-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-6 font-semibold transition-all duration-300"
              >
                <Users className="h-5 w-5" />
                <span>Parent Access</span>
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="flex items-center space-x-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl py-3 px-6 font-semibold transition-all duration-300"
              >
                <Shield className="h-5 w-5" />
                <span>School Admin</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="parent" className="mt-0">
              <LoginForm onLogin={handleParentLogin} onSignup={handleParentSignup} />
            </TabsContent>

            <TabsContent value="admin" className="mt-0">
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
    <div className="w-full max-w-lg mx-auto">
      <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-green-50 to-emerald-100 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10"></div>
        <CardHeader className="relative text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
            School Admin
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Access the admin panel to manage student check-ins
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-6 px-8 pb-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="admin-name" className="text-sm font-semibold text-gray-700">
                Admin Name
              </label>
              <input
                id="admin-name"
                name="name"
                type="text"
                required
                className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 text-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="admin-password" className="text-sm font-semibold text-gray-700">
                Admin Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 text-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 hover:from-green-700 hover:via-emerald-700 hover:to-teal-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:transform-none disabled:opacity-50 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Access Admin Panel"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 bg-green-50 p-4 rounded-xl border-2 border-green-200">
            <p className="font-semibold">Demo Credentials</p>
            <p>
              Password: <span className="font-mono font-bold">123456</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
