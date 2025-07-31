"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Mail, Lock, User, Baby, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"

export default function LoginForm({ onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")

    // Simple validation
    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    // Check localStorage for user - fixed logic
    const savedUser = localStorage.getItem(`user_${email}`)
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        if (userData.password === password) {
          onLogin({
            email: userData.email,
            name: userData.name,
            userType: "parent",
          })
        } else {
          setError("Invalid password. Please try again.")
        }
      } catch (e) {
        setError("Error reading user data. Please try signing up again.")
      }
    } else {
      // For demo purposes, allow any email/password combination to work
      // In production, this would check against a real database
      if (email.includes("@") && password.length >= 6) {
        const userData = {
          email,
          name: email.split("@")[0], // Use email prefix as name
          userType: "parent",
        }
        onLogin(userData)
      } else {
        setError("Please enter a valid email and password (minimum 6 characters)")
      }
    }

    setIsLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")
    const childName = formData.get("childName")

    // Simple validation
    if (!name || !email || !password || !childName) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Save user data with fixed key
    const userData = {
      name,
      email,
      childName,
      password,
      userType: "parent",
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(`user_${email}`, JSON.stringify(userData))

    setSuccess("Account created successfully! Redirecting...")
    setTimeout(() => {
      onSignup({
        email: userData.email,
        name: userData.name,
        userType: "parent",
      })
    }, 1000)

    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Login Card */}
        <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10"></div>
          <CardHeader className="relative text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Users className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">Sign in to access your parent dashboard</CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-6 px-8 pb-8">
            {error && !isLogin && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    className="pl-12 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-12 pr-12 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && isLogin && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:transform-none disabled:opacity-50 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Create one here
                </button>
              </p>
            </div>

            <div className="text-center text-xs text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-200">
              <p className="font-medium">Demo Mode: Use any email and password (6+ characters) to login</p>
            </div>
          </CardContent>
        </Card>

        {/* Signup Card */}
        <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-green-50 to-emerald-100 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10"></div>
          <CardHeader className="relative text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Baby className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Join KidCheck
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">Create your account to get started</CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-6 px-8 pb-8">
            {error && isLogin && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="signup-name" className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-green-500 transition-colors" />
                  <Input
                    id="signup-name"
                    name="name"
                    required
                    className="pl-12 h-14 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-green-500 transition-colors" />
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    className="pl-12 h-14 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-green-500 transition-colors" />
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    className="pl-12 h-14 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                    placeholder="Create a password (6+ characters)"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="child-name" className="text-sm font-semibold text-gray-700">
                  Child's Name
                </Label>
                <div className="relative group">
                  <Baby className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-green-500 transition-colors" />
                  <Input
                    id="child-name"
                    name="childName"
                    required
                    className="pl-12 h-14 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl text-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your child's name"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 hover:from-green-700 hover:via-emerald-700 hover:to-teal-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:transform-none disabled:opacity-50 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
