# KidCheck - Child Check-in System

A comprehensive child check-in system that enables secure communication between parents and school administrators for tracking student attendance.

## 🎯 Features

### For Parents
- **Account Management**: Sign up and login to manage your children
- **Child Profiles**: Add multiple children with their grades
- **Status Requests**: Ask school admins to confirm check-in/out status
- **Real-time Updates**: Receive instant responses from school staff
- **Request History**: View all past requests and responses

### For School Administrators
- **Request Management**: View and respond to parent status requests
- **Status Confirmation**: Confirm actual check-in/out times with details
- **Response Tracking**: Monitor all responses sent to parents
- **Dashboard Analytics**: View pending, total, and responded request counts

### Technical Features
- **Offline Support**: Works without internet using localStorage
- **Progressive Web App**: Install on mobile devices like a native app
- **Dark/Light Theme**: Toggle between themes for better user experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Sync**: Auto-refresh every 2 seconds for live updates

## 🚀 Quick Start

### Option 1: Static HTML Version (Recommended)
Simply open `index.html` in your web browser - no installation required!

### Option 2: Next.js Development
\`\`\`bash
npm install
npm run dev
\`\`\`
Access at: `http://localhost:3000`

## 🔑 Demo Credentials

### Admin Access
- **Password**: `123456`
- **Name**: Any name you prefer

### Parent Access
- Create a new account or use any email/password combination
- The app uses localStorage for demo purposes

## 📱 How It Works

### Parent Workflow
1. **Sign Up**: Create an account with your details
2. **Add Children**: Enter your children's names and grades
3. **Request Status**: Ask "Has my child checked IN/OUT?"
4. **Receive Updates**: Get confirmation from school admin with exact times

### Admin Workflow
1. **Login**: Access admin dashboard with credentials
2. **View Requests**: See all pending parent requests
3. **Confirm Status**: Select actual status (checked in/out) and time
4. **Send Response**: Provide confirmation to parents with details

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Framework**: Next.js (optional development mode)
- **Styling**: Custom CSS with CSS Variables for theming
- **Storage**: localStorage (with Firebase integration ready)
- **PWA**: Service Worker for offline functionality

## 📂 Project Structure

\`\`\`
├── index.html          # Main application file
├── app.js             # Application logic and functionality
├── styles.css         # Styling and responsive design
├── manifest.json      # PWA configuration
├── sw.js             # Service worker for offline support
├── app/              # Next.js pages (optional)
├── components/       # React components (optional)
└── README.md         # This file
\`\`\`

## 🌟 Key Benefits

- **No Backend Required**: Runs entirely in the browser
- **Instant Setup**: Open HTML file and start using
- **Mobile Friendly**: Responsive design works on all devices
- **Offline Capable**: Continue working without internet
- **Secure**: All data stored locally on user's device
- **Fast**: No server requests needed for basic functionality

## 🔧 Customization

### Themes
The app supports custom themes through CSS variables. Modify the `:root` and `[data-theme="dark"]` sections in `styles.css`.

### Branding
Update the logo, colors, and text in `index.html` and `styles.css` to match your school's branding.

### Features
Add new functionality by modifying `app.js`. The modular structure makes it easy to extend.

## 📱 Mobile Installation

1. Open the app in your mobile browser
2. Look for "Add to Home Screen" option
3. Install as a PWA for native app experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For support or questions:
1. Check the code comments for implementation details
2. Review the browser console for any error messages
3. Ensure localStorage is enabled in your browser

---

**KidCheck** - Making school communication simple and secure! 👶📚
