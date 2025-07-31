# KidCheck - Child Check-in System

A modern web application that helps parents and school administrators manage child check-in/check-out status requests.

## 🎯 Features

### For Parents:
- **Account Registration**: Create parent accounts with child information
- **Child Management**: Add multiple children with their grades
- **Status Requests**: Ask school admins "Has my child checked IN/OUT?"
- **Real-time Updates**: Get instant confirmations from school staff
- **Request History**: View all past requests and responses

### For School Administrators:
- **Request Dashboard**: View all pending parent requests
- **Status Confirmation**: Confirm actual check-in/out times
- **Response Management**: Send detailed feedback to parents
- **Request Statistics**: Track pending and processed requests

## 🚀 Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + localStorage
- **Database**: Firebase Firestore (with localStorage fallback)
- **Authentication**: Custom auth system
- **PWA**: Service Worker for offline functionality

## 📱 Key Features

- ✅ **Responsive Design** - Works on all devices
- 🌙 **Dark/Light Theme** - Toggle between themes
- 📶 **Offline Support** - Works without internet connection
- 🔄 **Real-time Updates** - Auto-refresh every 2 seconds
- 🗑️ **Request Management** - Delete unwanted requests
- 📱 **PWA Ready** - Install as mobile app

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/kidcheck-app.git
   cd kidcheck-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   \`\`\`
   http://localhost:3000
   \`\`\`

### Alternative: Static Version

You can also run the static HTML version directly:

1. **Open in browser**
   \`\`\`bash
   open public/index.html
   \`\`\`

This version works completely offline with localStorage.

## 🔑 Demo Credentials

### Admin Access
- **Password**: `123456`
- **Name**: Any name you choose

### Parent Access
- Create a new account or use any email/password combination
- The app uses localStorage for demo purposes

## 📖 How to Use

### For Parents:
1. **Sign Up**: Create an account with your information
2. **Add Children**: Enter your children's names and grades
3. **Request Status**: Ask if your child has checked in/out
4. **View Responses**: See admin confirmations with timestamps

### For Administrators:
1. **Login**: Use admin credentials to access dashboard
2. **Review Requests**: See all pending parent requests
3. **Confirm Status**: Select actual status and provide time
4. **Send Response**: Confirm to parents with additional details

## 🏗️ Project Structure

\`\`\`
kidcheck-app/
├── app/                          # Next.js app directory
│   ├── admin-dashboard/          # Admin dashboard page
│   ├── parent-dashboard/         # Parent dashboard page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home/login page
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── theme-provider.tsx       # Theme context
│   └── theme-toggle.tsx         # Theme switcher
├── lib/                         # Utility libraries
│   ├── firebase.ts              # Firebase configuration
│   ├── firebase-service.ts      # Firebase operations
│   └── utils.ts                 # Helper functions
├── public/                      # Static assets & standalone app
│   ├── index.html              # Standalone HTML app
│   ├── app.js                  # Standalone JavaScript
│   ├── styles.css              # Standalone styles
│   └── sw.js                   # Service worker
└── hooks/                       # Custom React hooks
\`\`\`

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Set source to `main` branch
3. Access via: `https://yourusername.github.io/kidcheck-app/public/`

## 🔧 Configuration

### Firebase Setup (Optional)
1. Create a Firebase project
2. Enable Firestore
3. Add your config to `lib/firebase.ts`
4. Update Firestore rules in `firestore.rules`

### Environment Variables
Create `.env.local`:
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
\`\`\`

## 📱 PWA Features

- **Offline Functionality**: Works without internet
- **Install Prompt**: Add to home screen
- **Background Sync**: Sync when connection returns
- **Push Notifications**: (Ready for implementation)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/kidcheck-app/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Future Enhancements

- [ ] Email notifications for parents
- [ ] Attendance reports and analytics
- [ ] Parent profile management
- [ ] Advanced search and filtering
- [ ] Bulk actions for administrators
- [ ] Database integration options
- [ ] User authentication tokens
- [ ] File upload support
- [ ] Export functionality
- [ ] Mobile app versions

---

**Made with ❤️ for safer school environments**
\`\`\`

The Java backend has been completely removed! Your app now runs as:

1. **Next.js Application** - Full React app with TypeScript
2. **Static HTML Version** - Standalone app in the `public/` folder that works offline

Both versions use localStorage for data persistence, so they work without any backend server. The app maintains all its functionality:

- ✅ Parent registration and login
- ✅ Child management
- ✅ Status requests
- ✅ Admin dashboard
- ✅ Real-time updates
- ✅ Offline support
- ✅ Dark/light themes

To run your app now:

**Next.js version:**
\`\`\`bash
npm run dev
\`\`\`

**Static version:**
Just open `public/index.html` in your browser!
