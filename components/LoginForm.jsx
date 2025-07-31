"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Mail, Lock, User, Baby, AlertCircle, CheckCircle } from "lucide-react"

export default function LoginForm({ onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

    // Check localStorage for demo user
    const savedUser = localStorage.getItem(`demo_user_${email}`)
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (userData.password === password) {
        onLogin({
          email: userData.email,
          name: userData.name,
          userType: "parent",
        })
      } else {
        setError("Invalid email or password")
      }
    } else {
      setError("User not found. Please sign up first.")
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

    // Check if user already exists
    const existingUser = localStorage.getItem(`demo_user_${email}`)
    if (existingUser) {
      setError("User already exists. Please login instead.")
      setIsLoading(false)
      return
    }

    // Save user data
    const userData = {
      name,
      email,
      childName,
      password,
      userType: "parent",
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(`demo_user_${email}`, JSON.stringify(userData))

    setSuccess("Account created successfully! Redirecting...")
    setTimeout(() => {
      onSignup({
        email: userData.email,
        name: userData.name,
        userType: "parent",
      })
    }, 1500)

    setIsLoading(false)
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Login Card */}
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Parent Login
          </CardTitle>
          <CardDescription className="text-gray-600">Access your dashboard to manage check-in requests</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && !isLogin && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && isLogin && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button onClick={() => setIsLogin(false)} className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Signup Card */}
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Baby className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Parent Sign Up
          </CardTitle>
          <CardDescription className="text-gray-600">Create an account to start monitoring your child</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && isLogin && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="signup-name"
                  name="name"
                  required
                  className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="child-name" className="text-sm font-medium text-gray-700">
                Child's Name
              </Label>
              <div className="relative">
                <Baby className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="child-name"
                  name="childName"
                  required
                  className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  placeholder="Enter your child's name"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button onClick={() => setIsLogin(true)} className="text-green-600 hover:text-green-700 font-medium">
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
