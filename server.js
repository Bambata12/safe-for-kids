const express = require("express")
const path = require("path")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// In-memory storage (replace with database in production)
const users = []
const requests = []

// Helper functions
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function findUser(email) {
  return users.find((user) => user.email === email)
}

function findRequest(id) {
  return requests.find((request) => request.id === id)
}

// Auth routes
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, password, childName, userType } = req.body

    // Check if user already exists
    if (findUser(email)) {
      return res.status(400).json({ success: false, error: "User already exists" })
    }

    // Create new user
    const newUser = {
      id: generateId(),
      name,
      email,
      password, // In production, hash this password
      childName,
      userType,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    res.json({
      success: true,
      user: { ...newUser, password: undefined }, // Don't send password back
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ success: false, error: "Registration failed" })
  }
})

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password, userType } = req.body

    // Find user
    const user = findUser(email)
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid credentials" })
    }

    // Check user type for parents
    if (userType === "parent" && user.userType !== "parent") {
      return res.status(401).json({ success: false, error: "Invalid user type" })
    }

    res.json({
      success: true,
      user: { ...user, password: undefined }, // Don't send password back
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ success: false, error: "Login failed" })
  }
})

// Request routes
app.get("/api/requests", (req, res) => {
  try {
    // Sort requests by timestamp (newest first)
    const sortedRequests = requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    res.json({ success: true, requests: sortedRequests })
  } catch (error) {
    console.error("Get requests error:", error)
    res.status(500).json({ success: false, error: "Failed to get requests" })
  }
})

app.post("/api/requests", (req, res) => {
  try {
    const { type, childName, childGrade, parentEmail, parentName, requestMessage } = req.body

    const newRequest = {
      id: generateId(),
      type,
      childName,
      childGrade,
      parentEmail,
      parentName,
      requestMessage,
      status: "pending",
      timestamp: new Date().toISOString(),
    }

    requests.push(newRequest)

    res.json({ success: true, request: newRequest })
  } catch (error) {
    console.error("Create request error:", error)
    res.status(500).json({ success: false, error: "Failed to create request" })
  }
})

app.post("/api/requests/update", (req, res) => {
  try {
    const { id, status, feedback } = req.body

    const request = findRequest(id)
    if (!request) {
      return res.status(404).json({ success: false, error: "Request not found" })
    }

    // Update request
    request.status = status
    request.feedback = feedback
    request.responseTime = new Date().toLocaleString()
    request.updatedAt = new Date().toISOString()

    res.json({ success: true, request })
  } catch (error) {
    console.error("Update request error:", error)
    res.status(500).json({ success: false, error: "Failed to update request" })
  }
})

app.post("/api/requests/delete", (req, res) => {
  try {
    const { id } = req.body

    const requestIndex = requests.findIndex((request) => request.id === id)
    if (requestIndex === -1) {
      return res.status(404).json({ success: false, error: "Request not found" })
    }

    // Remove request
    requests.splice(requestIndex, 1)

    res.json({ success: true })
  } catch (error) {
    console.error("Delete request error:", error)
    res.status(500).json({ success: false, error: "Failed to delete request" })
  }
})

// Serve the main HTML file for all routes (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KidCheck server running on port ${PORT}`)
  console.log(`📱 Open http://localhost:${PORT} to view the app`)
  console.log(`👨‍💼 Admin password: 123456`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Server shutting down gracefully...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("👋 Server shutting down gracefully...")
  process.exit(0)
})
