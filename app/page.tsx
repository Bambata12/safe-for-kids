"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Users, Shield, Baby, CheckCircle, AlertCircle } from "lucide-react"
import { registerUser, loginUser } from "@/lib/firebase-service"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleParentLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")

    // Try Firebase login first, fallback to localStorage
    const result = await loginUser(email, password)

    if (result.success) {
      // Store user info in localStorage for fallback
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userName", "Parent User")
      localStorage.setItem("userType", "parent")
      router.push("/parent-dashboard")
    } else {
      // Simple fallback for demo - check if user exists in localStorage
      const savedUser = localStorage.getItem(`demo_user_${email}`)
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        localStorage.setItem("userEmail", userData.email)
        localStorage.setItem("userName", userData.name)
        localStorage.setItem("userType", "parent")
        router.push("/parent-dashboard")
      } else {
        setError("Invalid email or password")
      }
    }

    setIsLoading(false)
  }

  const handleParentSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")
    const childName = formData.get("childName")

    // Try Firebase registration first
    const result = await registerUser(email, password, name, childName)

    if (result.success) {
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userName", name)
      localStorage.setItem("userType", "parent")
      setSuccess("Account created successfully! Redirecting...")
      setTimeout(() => router.push("/parent-dashboard"), 2000)
    } else {
      // Fallback to localStorage for demo
      const userData = {
        name,
        email,
        childName,
        password,
        userType: "parent",
      }
      localStorage.setItem(`demo_user_${email}`, JSON.stringify(userData))
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userName", name)
      localStorage.setItem("userType", "parent")
      setSuccess("Account created successfully! Redirecting...")
      setTimeout(() => router.push("/parent-dashboard"), 2000)
    }

    setIsLoading(false)
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name")
    const password = formData.get("password")

    if (password === "123456" && name.trim()) {
      localStorage.setItem("isAdmin", "true")
      localStorage.setItem("adminName", name)
      router.push("/admin-dashboard")
    } else {
      setError("Invalid admin credentials. Please check your name and password.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Baby className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">KidCheck</h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Safe & Secure Child Check-in System</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Keep track of your child's school attendance with real-time updates and secure communication between parents
            and administrators.
          </p>
        </div>

        {error && (
          <Alert className="max-w-md mx-auto mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="max-w-md mx-auto mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>For Parents</CardTitle>
              <CardDescription>Request check-ins and receive updates about your child</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>For Administrators</CardTitle>
              <CardDescription>Manage check-in requests and provide feedback to parents</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>Get instant notifications and updates</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="parent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="parent">Parent Access</TabsTrigger>
              <TabsTrigger value="admin">Admin Access</TabsTrigger>
            </TabsList>

            <TabsContent value="parent">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Parent Login</CardTitle>
                    <CardDescription>Access your dashboard to manage check-in requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleParentLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" name="email" type="email" required />
                      </div>
                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <Input id="login-password" name="password" type="password" required />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Parent Sign Up</CardTitle>
                    <CardDescription>Create an account to start monitoring your child</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleParentSignup} className="space-y-4">
                      <div>
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input id="signup-name" name="name" required />
                      </div>
                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" name="email" type="email" required />
                      </div>
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" name="password" type="password" required />
                      </div>
                      <div>
                        <Label htmlFor="child-name">Child's Name</Label>
                        <Input id="child-name" name="childName" required />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Sign Up"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="admin">
              <div className="max-w-md mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Administrator Login</CardTitle>
                    <CardDescription>Access the admin panel to manage check-in requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="admin-name">Admin Name</Label>
                        <Input id="admin-name" name="name" type="text" placeholder="Enter your name" required />
                      </div>
                      <div>
                        <Label htmlFor="admin-password">Admin Password</Label>
                        <Input
                          id="admin-password"
                          name="password"
                          type="password"
                          placeholder="Enter admin password"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Admin Sign In"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
