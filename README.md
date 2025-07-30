# KidCheck - Child Check-in System (Java Backend)

A safe and secure child check-in system for parents and schools built with HTML, CSS, JavaScript frontend and Java Spring Boot backend.

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Java 17, Spring Boot 3.2.0
- **Storage**: In-memory (easily replaceable with database)
- **PWA**: Service Worker, Web App Manifest

## Features

### For Parents
- 👶 **Child Management** - Add and manage multiple children with grades
- 📤 **Status Requests** - Ask school to confirm check-in/out status
- 📱 **Real-time Updates** - Get instant responses from school admin
- 🗑️ **Request Management** - Delete old or unwanted requests
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📵 **Offline Support** - Works offline with localStorage fallback

### For School Administrators
- 📋 **Request Dashboard** - View all parent status requests
- ✅ **Status Confirmation** - Confirm actual check-in/out times
- 💬 **Response System** - Send detailed responses to parents
- 📊 **Statistics** - Track pending and processed requests
- 🗑️ **Request Management** - Delete completed or invalid requests

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Modern web browser

## Installation & Setup

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd kidcheck-app
\`\`\`

### 2. Build the Application
\`\`\`bash
mvn clean compile
\`\`\`

### 3. Run the Application
\`\`\`bash
mvn spring-boot:run
\`\`\`

Or build and run the JAR:
\`\`\`bash
mvn clean package
java -jar target/kidcheck-backend-1.0.0.jar
\`\`\`

### 4. Access the Application
Open your browser and navigate to:
\`\`\`
http://localhost:8080
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new parent account
- `POST /api/auth/login` - Login user

### Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create new status request
- `POST /api/requests/update` - Update request status
- `POST /api/requests/delete` - Delete request
- `GET /api/requests/stats` - Get request statistics

## Project Structure

\`\`\`
kidcheck-app/
├── src/
│   └── main/
│       ├── java/com/kidcheck/
│       │   ├── KidCheckApplication.java     # Main application class
│       │   ├── config/
│       │   │   └── WebConfig.java           # Web configuration
│       │   ├── controller/
│       │   │   ├── AuthController.java      # Authentication endpoints
│       │   │   ├── RequestController.java   # Request management endpoints
│       │   │   └── StaticController.java    # Static file serving
│       │   ├── dto/
│       │   │   ├── ApiResponse.java         # API response wrapper
│       │   │   ├── LoginRequest.java        # Login request DTO
│       │   │   └── RegisterRequest.java     # Registration request DTO
│       │   ├── model/
│       │   │   ├── User.java               # User entity
│       │   │   └── CheckinRequest.java     # Request entity
│       │   └── service/
│       │       ├── UserService.java        # User business logic
│       │       └── CheckinRequestService.java # Request business logic
│       └── resources/
│           └── application.properties       # Application configuration
├── public/
│   ├── index.html                          # Main HTML file
│   ├── styles.css                          # CSS styles
│   ├── app.js                             # Frontend JavaScript
│   ├── sw.js                              # Service Worker
│   └── manifest.json                      # PWA Manifest
├── pom.xml                                # Maven configuration
└── README.md                              # Documentation
\`\`\`

## Usage

### Parent Access
1. **Sign Up**: Create account with name, email, password, and child's name
2. **Login**: Use email and password to access parent dashboard
3. **Add Children**: Add children's names and grades
4. **Send Requests**: Ask school if child has checked in or out
5. **View Responses**: See real-time confirmations from school admin

### Admin Access
1. **Login**: Use admin credentials (password: `123456`)
2. **View Requests**: See all parent status requests
3. **Confirm Status**: Select actual status (checked in/out) and time
4. **Send Response**: Provide confirmation with optional details
5. **Manage History**: View and delete processed requests

## Configuration

### Server Port
Change the server port in `application.properties`:
\`\`\`properties
server.port=8080
\`\`\`

### CORS Configuration
CORS is configured to allow all origins for development. For production, update `WebConfig.java`:
\`\`\`java
.allowedOrigins("https://yourdomain.com")
\`\`\`

### Database Integration
To add database support, include JPA dependency in `pom.xml`:
\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
\`\`\`

## Development

### Hot Reload
The application includes Spring Boot DevTools for automatic restart during development.

### Building for Production
\`\`\`bash
mvn clean package -Dmaven.test.skip=true
\`\`\`

### Running Tests
\`\`\`bash
mvn test
\`\`\`

## Deployment

### JAR Deployment
\`\`\`bash
java -jar target/kidcheck-backend-1.0.0.jar
\`\`\`

### Docker Deployment
Create a `Dockerfile`:
\`\`\`dockerfile
FROM openjdk:17-jdk-slim
COPY target/kidcheck-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
\`\`\`

### Cloud Deployment
The application can be deployed to:
- **Heroku**: Add `Procfile` with `web: java -jar target/kidcheck-backend-1.0.0.jar`
- **AWS**: Use Elastic Beanstalk or ECS
- **Google Cloud**: Use App Engine or Cloud Run

## Security Considerations

- Passwords are stored in plain text (implement hashing for production)
- No authentication tokens (implement JWT for production)
- CORS allows all origins (restrict for production)
- Input validation should be enhanced for production use

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please contact the development team or create an issue in the repository.

---

**KidCheck** - Keeping children safe with secure check-in management! 👶🏫
\`\`\`

Perfect! I've successfully converted the entire application to use Java Spring Boot as the backend while removing all TypeScript/TSX files. Here's what I've created:

## ✅ **Complete Java Backend Conversion:**

### **Backend (Java Spring Boot):**
- 🚀 **Spring Boot 3.2.0** - Modern Java framework
- 📡 **RESTful API** - Clean REST endpoints
- 🏗️ **MVC Architecture** - Controllers, Services, Models, DTOs
- 💾 **In-memory Storage** - Easily replaceable with database
- 🔐 **CORS Configuration** - Cross-origin support
- 📊 **Statistics API** - Request tracking endpoints

### **Frontend (Pure Web Technologies):**
- 📄 **HTML5** - Single page application
- 🎨 **CSS3** - Complete styling with themes
- ⚡ **Vanilla JavaScript** - No frameworks, pure JS
- 📱 **PWA Support** - Service worker and manifest

## 🎯 **Java Backend Features:**

### **API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create new request
- `POST /api/requests/update` - Update request status
- `POST /api/requests/delete` - Delete request
- `GET /api/requests/stats` - Get statistics

### **Architecture:**
- **Controllers** - Handle HTTP requests
- **Services** - Business logic layer
- **Models** - Data entities (User, CheckinRequest)
- **DTOs** - Data transfer objects
- **Configuration** - CORS and web config

## 🚀 **How to Run:**

1. **Prerequisites:**
   - Java 17+
   - Maven 3.6+

2. **Build & Run:**
   \`\`\`bash
   mvn spring-boot:run
   \`\`\`

3. **Access:**
   \`\`\`
   http://localhost:8080
   \`\`\`

4. **Admin login:**
   - Password: `123456`

The application now runs with a robust Java Spring Boot backend while maintaining all the original functionality including real-time updates, offline support, and cross-dashboard synchronization!
