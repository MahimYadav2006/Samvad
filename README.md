# ConvoApp 🚀

A modern, feature-rich real-time messaging application built with the MERN stack and Socket.IO. ConvoApp provides a complete chat experience with advanced features like media sharing, audio messages, emoji integration, and much more.

## ✨ Features

### 🔐 Authentication & Security
- **Secure JWT Authentication** - Login and registration with JSON Web Tokens
- **Password Encryption** - bcryptjs for secure password hashing
- **OTP Email Verification** - Email-based user verification system
- **Rate Limiting** - Express rate limiting for API protection
- **Input Sanitization** - MongoDB injection and XSS protection

### 💬 Real-Time Messaging
- **One-to-One Chat** - Real-time messaging between users
- **Socket.IO Integration** - Instant message delivery
- **Typing Indicators** - Real-time typing status
- **Online/Offline Status** - Live user presence tracking
- **Message Persistence** - All messages stored in MongoDB

### 🎯 Rich Media Support
- **Image & Video Sharing** - Upload and share photos/videos
- **Document Sharing** - Send and receive files and documents
- **Audio Messages** - Record, send, and playback voice messages
- **Cloudinary Integration** - Cloud-based media storage
- **Link Enrichment** - Automatic link preview generation

### 🎨 User Experience
- **Emoji Integration** - Full emoji picker support
- **Giphy Integration** - Built-in GIF search and sharing
- **Profile Customization** - Update bio, job title, and avatar
- **Light/Dark Theme** - Toggle between theme modes
- **Responsive Design** - Mobile, tablet, and desktop optimized

### ⚡ Performance & State Management
- **Redux Toolkit** - Efficient state management
- **Redux Persist** - State persistence across sessions
- **Optimized Rendering** - Efficient React component updates

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Storage & Services
- **Cloudinary** - Media storage and optimization
- **Nodemailer** - Email service for OTP verification
- **Multer** - File upload handling

### Security & Utilities
- **bcryptjs** - Password hashing
- **JWT** - Authentication tokens
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Validator** - Input validation

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/MahimYadav2006/Samvad.git
cd Samvad/Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Backend directory:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
COOKIE_EXPIRES_IN=90

# Email Configuration
EMAIL_FROM=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the backend server:
```bash
npm run start:dev
```

### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd ../Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Frontend directory:
```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_GIPHY_API_KEY=your_giphy_api_key
```

4. Start the development server:
```bash
npm run dev
```

## 🚀 Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Verify your email using the OTP sent to your email address
4. Start chatting with other users in real-time!

## 📱 Features in Detail

### Real-Time Chat
- Instant message delivery using Socket.IO
- Message status indicators (sent, delivered, read)
- Typing indicators to show when someone is typing
- Online/offline status for all users

### Media Sharing
- **Images & Videos**: Upload and share media files with automatic compression
- **Documents**: Share PDFs, Word docs, and other file formats
- **Audio Messages**: Record voice messages with waveform visualization
- **Link Previews**: Automatic enrichment of shared links with metadata

### User Management
- **Profile Updates**: Change name, bio, job title, and profile picture
- **Avatar Upload**: Custom profile pictures with Cloudinary storage
- **Status Management**: Set online, offline, or busy status

### Security Features
- **Password Encryption**: All passwords hashed with bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against spam and abuse
- **Input Sanitization**: Prevention of XSS and injection attacks

## 🎨 Customization

### Themes
ConvoApp supports both light and dark themes. Users can toggle between themes using the theme switcher in the app settings.

### Emoji & GIFs
- Full emoji picker with categories and search
- Giphy integration for GIF sharing
- Emoji reactions to messages (coming soon)

## 🔮 Upcoming Features

- **Video Calling** - WebRTC integration for video calls
- **Group Chats** - Multi-user chat rooms
- **Message Reactions** - React to messages with emojis
- **File Preview** - In-app document and media preview
- **Push Notifications** - Real-time notifications
- **Message Search** - Search through chat history

## 📂 Project Structure

```
ConvoApp/
├── Backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── utils/
│   │   └── App.jsx
│   └── public/
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Mahim Yadav** - [GitHub Profile](https://github.com/MahimYadav2006)

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Cloudinary for media storage
- The React and Node.js communities
- All contributors and users of ConvoApp

---

**Live Demo**: [ConvoApp](https://samvad-neon.vercel.app)

For any questions or support, please open an issue on GitHub or contact the maintainer.
