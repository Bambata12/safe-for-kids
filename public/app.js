// Global state
let currentUser = null
let currentPage = "login"
let children = []
let requests = []
let isLoading = false

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.setAttribute("data-theme", savedTheme)
  updateThemeButtons()
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"
  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
  updateThemeButtons()
}

function updateThemeButtons() {
  const theme = document.documentElement.getAttribute("data-theme")
  const buttons = document.querySelectorAll(".theme-toggle")
  buttons.forEach((btn) => {
    btn.textContent = theme === "dark" ? "☀️" : "🌙"
  })
}

// Page navigation
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active")
  })
  document.getElementById(pageId).classList.add("active")
  currentPage = pageId
}

// Alert functions
function showAlert(elementId, message, type = "error") {
  const alert = document.getElementById(elementId)
  alert.textContent = message
  alert.className = `alert ${type}`
  alert.classList.remove("hidden")

  setTimeout(() => {
    alert.classList.add("hidden")
  }, 5000)
}

function hideAlert(elementId) {
  document.getElementById(elementId).classList.add("hidden")
}

// API functions
async function apiCall(endpoint, method = "GET", data = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(`http://localhost:8080/api${endpoint}`, options)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Request failed")
    }

    return result
  } catch (error) {
    console.error("API call failed:", error)
    // Fallback to localStorage for demo
    return handleOfflineOperation(endpoint, method, data)
  }
}

// Offline fallback operations
function handleOfflineOperation(endpoint, method, data) {
  switch (endpoint) {
    case "/auth/login":
      return handleOfflineLogin(data)
    case "/auth/register":
      return handleOfflineRegister(data)
    case "/requests":
      if (method === "GET") return handleOfflineGetRequests()
      if (method === "POST") return handleOfflineCreateRequest(data)
      break
    case "/requests/update":
      return handleOfflineUpdateRequest(data)
    case "/requests/delete":
      return handleOfflineDeleteRequest(data)
  }
  return { success: false, error: "Operation not available offline" }
}

function handleOfflineLogin(data) {
  if (data.email && data.password) {
    // Check for demo user
    const savedUser = localStorage.getItem(`demo_user_${data.email}`)
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (userData.password === data.password) {
        return { success: true, user: userData }
      }
    }
  }
  return { success: false, error: "Invalid credentials" }
}

function handleOfflineRegister(data) {
  const userData = {
    id: Date.now().toString(),
    name: data.name,
    email: data.email,
    password: data.password,
    childName: data.childName,
    userType: "parent",
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(`demo_user_${data.email}`, JSON.stringify(userData))
  return { success: true, user: userData }
}

function handleOfflineGetRequests() {
  const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
  return { success: true, requests: allRequests }
}

function handleOfflineCreateRequest(data) {
  const request = {
    id: Date.now().toString(),
    ...data,
    status: "pending",
    timestamp: new Date().toISOString(),
  }

  const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
  allRequests.unshift(request)
  localStorage.setItem("allRequests", JSON.stringify(allRequests))

  return { success: true, request }
}

function handleOfflineUpdateRequest(data) {
  const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
  const requestIndex = allRequests.findIndex((req) => req.id === data.id)

  if (requestIndex !== -1) {
    allRequests[requestIndex] = {
      ...allRequests[requestIndex],
      status: data.status,
      feedback: data.feedback,
      responseTime: new Date().toLocaleString(),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem("allRequests", JSON.stringify(allRequests))
    return { success: true }
  }

  return { success: false, error: "Request not found" }
}

function handleOfflineDeleteRequest(data) {
  const allRequests = JSON.parse(localStorage.getItem("allRequests") || "[]")
  const updatedRequests = allRequests.filter((req) => req.id !== data.id)
  localStorage.setItem("allRequests", JSON.stringify(updatedRequests))
  return { success: true }
}

// Authentication functions
async function handleParentLogin(event) {
  event.preventDefault()
  if (isLoading) return

  isLoading = true
  const form = event.target
  const formData = new FormData(form)

  const loginData = {
    email: formData.get("email"),
    password: formData.get("password"),
    userType: "parent",
  }

  try {
    const result = await apiCall("/auth/login", "POST", loginData)

    if (result.success) {
      currentUser = result.user
      localStorage.setItem("userEmail", result.user.email)
      localStorage.setItem("userName", result.user.name)
      localStorage.setItem("userType", "parent")

      showPage("parentDashboard")
      initParentDashboard()
    } else {
      showAlert("errorAlert", result.error)
    }
  } catch (error) {
    showAlert("errorAlert", "Login failed. Please try again.")
  } finally {
    isLoading = false
  }
}

async function handleParentSignup(event) {
  event.preventDefault()
  if (isLoading) return

  isLoading = true
  const form = event.target
  const formData = new FormData(form)

  const signupData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    childName: formData.get("childName"),
    userType: "parent",
  }

  try {
    const result = await apiCall("/auth/register", "POST", signupData)

    if (result.success) {
      showAlert("successAlert", "Account created successfully! Redirecting...", "success")

      setTimeout(() => {
        currentUser = result.user
        localStorage.setItem("userEmail", result.user.email)
        localStorage.setItem("userName", result.user.name)
        localStorage.setItem("userType", "parent")

        showPage("parentDashboard")
        initParentDashboard()
      }, 2000)
    } else {
      showAlert("errorAlert", result.error)
    }
  } catch (error) {
    showAlert("errorAlert", "Registration failed. Please try again.")
  } finally {
    isLoading = false
  }
}

async function handleAdminLogin(event) {
  event.preventDefault()
  if (isLoading) return

  isLoading = true
  const form = event.target
  const formData = new FormData(form)

  const name = formData.get("name")
  const password = formData.get("password")

  if (password === "123456" && name.trim()) {
    localStorage.setItem("isAdmin", "true")
    localStorage.setItem("adminName", name)

    showPage("adminDashboard")
    initAdminDashboard()
  } else {
    showAlert("errorAlert", "Invalid admin credentials. Please check your name and password.")
  }

  isLoading = false
}

function handleLogout() {
  currentUser = null
  localStorage.removeItem("userEmail")
  localStorage.removeItem("userName")
  localStorage.removeItem("userType")
  localStorage.removeItem("isAdmin")
  localStorage.removeItem("adminName")

  showPage("loginPage")
}

// Parent Dashboard functions
function initParentDashboard() {
  const userName = localStorage.getItem("userName") || "Parent"
  const userEmail = localStorage.getItem("userEmail")

  document.getElementById("parentWelcome").textContent = `Welcome, ${userName}`

  // Load saved children
  const savedChildren = localStorage.getItem(`children_${userEmail}`)
  if (savedChildren) {
    children = JSON.parse(savedChildren)
  } else {
    children = [{ name: "", grade: "" }]
  }

  renderChildren()
  loadParentRequests()

  // Set up auto-refresh
  setInterval(loadParentRequests, 2000)
}

function renderChildren() {
  const container = document.getElementById("childrenList")
  const select = document.getElementById("childSelect")

  container.innerHTML = ""
  select.innerHTML = '<option value="">Choose a child</option>'

  children.forEach((child, index) => {
    // Render child form
    const childDiv = document.createElement("div")
    childDiv.className = "child-item"
    childDiv.innerHTML = `
            <div class="form-group">
                <label>Child Name</label>
                <input type="text" value="${child.name}" onchange="updateChild(${index}, 'name', this.value)" placeholder="Enter child's name">
            </div>
            <div class="form-group">
                <label>Grade</label>
                <select onchange="updateChild(${index}, 'grade', this.value)">
                    <option value="">Select grade</option>
                    <option value="Pre-K" ${child.grade === "Pre-K" ? "selected" : ""}>Pre-K</option>
                    <option value="Kindergarten" ${child.grade === "Kindergarten" ? "selected" : ""}>Kindergarten</option>
                    <option value="1st" ${child.grade === "1st" ? "selected" : ""}>1st Grade</option>
                    <option value="2nd" ${child.grade === "2nd" ? "selected" : ""}>2nd Grade</option>
                    <option value="3rd" ${child.grade === "3rd" ? "selected" : ""}>3rd Grade</option>
                    <option value="4th" ${child.grade === "4th" ? "selected" : ""}>4th Grade</option>
                    <option value="5th" ${child.grade === "5th" ? "selected" : ""}>5th Grade</option>
                    <option value="6th" ${child.grade === "6th" ? "selected" : ""}>6th Grade</option>
                    <option value="7th" ${child.grade === "7th" ? "selected" : ""}>7th Grade</option>
                    <option value="8th" ${child.grade === "8th" ? "selected" : ""}>8th Grade</option>
                    <option value="9th" ${child.grade === "9th" ? "selected" : ""}>9th Grade</option>
                    <option value="10th" ${child.grade === "10th" ? "selected" : ""}>10th Grade</option>
                    <option value="11th" ${child.grade === "11th" ? "selected" : ""}>11th Grade</option>
                    <option value="12th" ${child.grade === "12th" ? "selected" : ""}>12th Grade</option>
                </select>
            </div>
            ${children.length > 1 ? `<button type="button" class="btn outline" onclick="removeChild(${index})">🗑️</button>` : ""}
        `
    container.appendChild(childDiv)

    // Add to select if valid
    if (child.name && child.grade) {
      const option = document.createElement("option")
      option.value = `${child.name} - Grade ${child.grade}`
      option.textContent = `${child.name} - Grade ${child.grade}`
      select.appendChild(option)
    }
  })
}

function updateChild(index, field, value) {
  children[index][field] = value
  const userEmail = localStorage.getItem("userEmail")
  localStorage.setItem(`children_${userEmail}`, JSON.stringify(children))
  renderChildren()
}

function addChild() {
  children.push({ name: "", grade: "" })
  renderChildren()
}

function removeChild(index) {
  children.splice(index, 1)
  const userEmail = localStorage.getItem("userEmail")
  localStorage.setItem(`children_${userEmail}`, JSON.stringify(children))
  renderChildren()
}

async function createRequest(type) {
  const selectedChild = document.getElementById("childSelect").value
  if (!selectedChild) {
    showAlert("parentErrorAlert", "Please select a child first")
    return
  }

  const [childName, gradeText] = selectedChild.split(" - Grade ")
  const childGrade = gradeText

  const requestData = {
    type,
    childName,
    childGrade,
    parentEmail: localStorage.getItem("userEmail"),
    parentName: localStorage.getItem("userName"),
    requestMessage: `Please confirm if ${childName} has ${type === "checkin" ? "checked in to" : "checked out from"} school and provide the time.`,
  }

  try {
    const result = await apiCall("/requests", "POST", requestData)
    if (result.success) {
      hideAlert("parentErrorAlert")
      loadParentRequests()
    } else {
      showAlert("parentErrorAlert", result.error)
    }
  } catch (error) {
    showAlert("parentErrorAlert", "Failed to create request")
  }
}

async function loadParentRequests() {
  try {
    const result = await apiCall("/requests")
    if (result.success) {
      const userEmail = localStorage.getItem("userEmail")
      const userRequests = result.requests.filter((req) => req.parentEmail === userEmail)
      renderParentRequests(userRequests)
    }
  } catch (error) {
    console.error("Failed to load requests:", error)
  }
}

function renderParentRequests(requests) {
  const container = document.getElementById("parentRequestsList")

  if (requests.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <h4>No status requests yet.</h4>
                <p>Send a request above to ask the school about your child's check-in/out status.</p>
            </div>
        `
    return
  }

  container.innerHTML = requests
    .map(
      (request) => `
        <div class="request-item ${request.status}">
            <div class="request-header">
                <div class="request-title">
                    <span>${getStatusIcon(request.status)}</span>
                    <span>Status Request: Has ${request.childName} checked ${request.type === "checkin" ? "IN" : "OUT"}?</span>
                    <span class="status-badge ${request.status}">
                        ${request.status === "pending" ? "Waiting for school response" : request.status}
                    </span>
                </div>
                <div class="request-actions">
                    <span class="request-meta">${formatDate(request.timestamp)}</span>
                    <button class="btn outline" onclick="deleteRequest('${request.id}')" title="Delete request">🗑️</button>
                </div>
            </div>
            <div class="request-meta">Child: ${request.childName} - Grade ${request.childGrade}</div>
            <div class="request-message">Your request: "${request.requestMessage}"</div>
            
            ${
              request.status === "pending"
                ? `
                <div class="response-box" style="background: #fffbeb; border: 1px solid #fbbf24;">
                    <div class="response-text" style="color: #92400e;">
                        ⏳ Waiting for school admin to confirm your child's status...
                    </div>
                </div>
            `
                : ""
            }
            
            ${
              request.feedback
                ? `
                <div class="response-box" style="background: #eff6ff; border: 1px solid #3b82f6;">
                    <div class="response-header" style="color: #1d4ed8;">
                        💬 School Response:
                    </div>
                    <div class="response-text" style="color: #1e40af;">${request.feedback}</div>
                    ${request.responseTime ? `<div class="response-time">Response received: ${request.responseTime}</div>` : ""}
                </div>
            `
                : ""
            }
        </div>
    `,
    )
    .join("")
}

// Admin Dashboard functions
function initAdminDashboard() {
  const adminName = localStorage.getItem("adminName") || "Admin"
  document.getElementById("adminWelcome").textContent = `Welcome, ${adminName}`

  loadAdminRequests()

  // Set up auto-refresh
  setInterval(loadAdminRequests, 2000)
}

async function loadAdminRequests() {
  try {
    const result = await apiCall("/requests")
    if (result.success) {
      requests = result.requests
      renderAdminStats()
      renderPendingRequests()
      renderProcessedRequests()
    }
  } catch (error) {
    console.error("Failed to load requests:", error)
  }
}

function renderAdminStats() {
  const pendingCount = requests.filter((req) => req.status === "pending").length
  const totalCount = requests.length
  const respondedCount = requests.filter((req) => req.status !== "pending").length

  document.getElementById("pendingCount").textContent = pendingCount
  document.getElementById("totalCount").textContent = totalCount
  document.getElementById("respondedCount").textContent = respondedCount
}

function renderPendingRequests() {
  const container = document.getElementById("pendingRequestsList")
  const pendingRequests = requests.filter((req) => req.status === "pending")

  if (pendingRequests.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <h4>No pending status requests</h4>
                <p>Parent requests will appear here when they ask about their child's status</p>
            </div>
        `
    return
  }

  container.innerHTML = pendingRequests
    .map(
      (request) => `
        <div class="request-item pending">
            <div class="request-header">
                <div class="request-title">
                    <span>⏰</span>
                    <span>Parent asking: Has ${request.childName} checked ${request.type === "checkin" ? "IN" : "OUT"}?</span>
                </div>
                <button class="btn outline" onclick="deleteRequest('${request.id}')" title="Delete request">🗑️</button>
            </div>
            <div class="request-meta">Child: ${request.childName} - Grade ${request.childGrade}</div>
            <div class="request-meta">Parent: ${request.parentName}</div>
            <div class="request-meta">Request sent: ${formatDate(request.timestamp)}</div>
            <div class="request-message">"${request.requestMessage}"</div>
            
            <div class="admin-response">
                <h4>Provide Status Confirmation:</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Actual Status</label>
                        <select id="status_${request.id}">
                            <option value="">What actually happened?</option>
                            <option value="checked-in">✅ Child HAS checked in</option>
                            <option value="checked-out">✅ Child HAS checked out</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Time</label>
                        <input type="time" id="time_${request.id}" placeholder="What time?">
                    </div>
                </div>
                <div class="form-group">
                    <label>Additional Information (Optional)</label>
                    <textarea id="feedback_${request.id}" placeholder="Any additional details for the parent..." rows="3"></textarea>
                </div>
                <div class="response-actions">
                    <button class="btn success" onclick="updateRequestStatus('${request.id}', 'approved')">
                        ✅ Confirm Status to Parent
                    </button>
                    <button class="btn danger" onclick="updateRequestStatus('${request.id}', 'rejected')">
                        ❌ Cannot Confirm
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function renderProcessedRequests() {
  const container = document.getElementById("processedRequestsList")
  const processedRequests = requests.filter((req) => req.status !== "pending")

  if (processedRequests.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <h4>No responses sent yet</h4>
                <p>Your status confirmations will appear here</p>
            </div>
        `
    return
  }

  container.innerHTML = processedRequests
    .map(
      (request) => `
        <div class="request-item">
            <div class="request-header">
                <div class="request-title">
                    <span>Status Request: ${request.childName} check-${request.type === "checkin" ? "in" : "out"}</span>
                    <span class="status-badge ${request.status}">
                        ${request.status === "approved" ? "Confirmed" : "Could not confirm"}
                    </span>
                </div>
                <div class="request-actions">
                    <span class="request-meta">${formatDate(request.timestamp)}</span>
                    <button class="btn outline" onclick="deleteRequest('${request.id}')" title="Delete request">🗑️</button>
                </div>
            </div>
            <div class="request-meta">Child: ${request.childName} - Grade ${request.childGrade}</div>
            <div class="request-meta">Parent: ${request.parentName}</div>
            
            ${
              request.feedback
                ? `
                <div class="response-box" style="background: #f0fdf4; border: 1px solid #10b981;">
                    <div class="response-header" style="color: #065f46;">
                        💬 Your Response:
                    </div>
                    <div class="response-text" style="color: #047857;">${request.feedback}</div>
                    ${request.responseTime ? `<div class="response-time">Sent: ${request.responseTime}</div>` : ""}
                </div>
            `
                : ""
            }
        </div>
    `,
    )
    .join("")
}

async function updateRequestStatus(requestId, status) {
  const selectedStatus = document.getElementById(`status_${requestId}`).value
  const selectedTime = document.getElementById(`time_${requestId}`).value
  const additionalFeedback = document.getElementById(`feedback_${requestId}`).value

  if (!selectedStatus) {
    showAlert("adminErrorAlert", "Please select whether the child has checked in or out")
    return
  }

  if (!selectedTime) {
    showAlert("adminErrorAlert", "Please provide the time")
    return
  }

  const request = requests.find((r) => r.id === requestId)
  if (!request) return

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

  try {
    const result = await apiCall("/requests/update", "POST", {
      id: requestId,
      status,
      feedback: responseMessage,
    })

    if (result.success) {
      hideAlert("adminErrorAlert")
      loadAdminRequests()
    } else {
      showAlert("adminErrorAlert", result.error)
    }
  } catch (error) {
    showAlert("adminErrorAlert", "Failed to update request")
  }
}

// Utility functions
async function deleteRequest(requestId) {
  if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) {
    return
  }

  try {
    const result = await apiCall("/requests/delete", "POST", { id: requestId })
    if (result.success) {
      if (currentPage === "parentDashboard") {
        loadParentRequests()
      } else if (currentPage === "adminDashboard") {
        loadAdminRequests()
      }
    }
  } catch (error) {
    console.error("Failed to delete request:", error)
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "pending":
      return "⏰"
    case "approved":
      return "✅"
    case "rejected":
      return "❌"
    default:
      return "⏰"
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// Connection status
function updateConnectionStatus() {
  const isOnline = navigator.onLine
  const statusElements = document.querySelectorAll('[id$="ConnectionStatus"]')

  statusElements.forEach((element) => {
    element.className = `badge ${isOnline ? "online" : "offline"}`
    element.textContent = isOnline ? "📶 Online" : "📵 Offline"
  })
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme
  initTheme()

  // Theme toggle buttons
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", toggleTheme)
  })

  // Tab switching
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabName = this.dataset.tab

      // Update tab buttons
      document.querySelectorAll(".tab-button").forEach((b) => b.classList.remove("active"))
      this.classList.add("active")

      // Update tab panels
      document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"))
      document.getElementById(`${tabName}Tab`).classList.add("active")
    })
  })

  // Auth forms
  document.getElementById("parentLoginForm").addEventListener("submit", handleParentLogin)
  document.getElementById("parentSignupForm").addEventListener("submit", handleParentSignup)
  document.getElementById("adminLoginForm").addEventListener("submit", handleAdminLogin)

  // Logout buttons
  document.getElementById("parentLogout").addEventListener("click", handleLogout)
  document.getElementById("adminLogout").addEventListener("click", handleLogout)

  // Parent dashboard buttons
  document.getElementById("addChildBtn").addEventListener("click", addChild)
  document.getElementById("checkinBtn").addEventListener("click", () => createRequest("checkin"))
  document.getElementById("checkoutBtn").addEventListener("click", () => createRequest("checkout"))

  // Connection status
  updateConnectionStatus()
  window.addEventListener("online", updateConnectionStatus)
  window.addEventListener("offline", updateConnectionStatus)

  // Check if user is already logged in
  const userType = localStorage.getItem("userType")
  const isAdmin = localStorage.getItem("isAdmin") === "true"

  if (userType === "parent") {
    showPage("parentDashboard")
    initParentDashboard()
  } else if (isAdmin) {
    showPage("adminDashboard")
    initAdminDashboard()
  }
})

// Service Worker registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}
