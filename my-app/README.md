# Student Portal - MERN Registration System

A comprehensive student registration and academic management portal built with the MERN stack (MongoDB, Express, React, Node.js). This system facilitates seamless interaction between Students, Faculty, and Administrators for course registration, fee approval, and academic announcements.

## 🚀 Features

### 🎓 Student Portal
- **Dashboard**: View recent announcements and academic status.
- **Registration**: Apply for semester courses and track approval status.
- **Academic Calendar**: View and download official academic calendars.
- **Notifications**: Receive real-time updates on registration and fee status.

### 👨‍🏫 Faculty Portal
- **Advisor Dashboard**: Manage assigned students and track their progress.
- **Registration Approval**: Review and approve/reject student course selections.
- **Academic Stats**: Monitor semester-wise enrollment metrics.

### 🛠️ Admin Portal
- **User Management**: Add, update, or remove student and faculty accounts.
- **Fee Management**: Review and verify fee transaction records.
- **Academic Control**: Manage academic years, course offerings, and calendar uploads.
- **Announcements**: Publish global or role-specific notifications.

## 💻 Tech Stack
- **Frontend**: React (v19), Tailwind CSS, React Bootstap, Lucide Icons.
- **Backend**: Node.js, Express.
- **Database**: MongoDB with Mongoose (ODM).
- **Security**: JWT Authentication, Bcrypt password hashing, Helmet security headers, Compression.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Setup Steps
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd studentportal/my-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Copy `.env.example` to `.env` in the `my-app` directory, then update values:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_secret_key
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   REACT_APP_API_URL=
   ```

4. **Seed the Database (Optional)**:
   To populate the system with test accounts and data:
   ```bash
   node seed.js
   ```

## 🏃 Running the Application

### Development Mode
Runs the backend and frontend separately for active development.
- **Backend**: `npm run dev` (Starts on port 5000)
- **Frontend**: `npm run client` (Starts on port 3000)

### Production Mode
Builds the frontend and serves it through the Express backend on a single port.
1. **Build the frontend**:
   ```bash
   npm run build
   ```
2. **Start the server**:
   ```bash
   npm start
   ```
   The app will be accessible at `http://localhost:5000`.

## 🚢 Deployment Checklist

- Set `NODE_ENV=production` on your host.
- Set secure environment values for `MONGO_URI`, `JWT_SECRET`, `PORT`, and `FRONTEND_URL`.
- Use `FRONTEND_URL` as a comma-separated allowlist if you have multiple domains.
- Ensure your platform health check points to `/api/health`.
- Build and run with:
  ```bash
  npm ci
  npm run build
  npm start
  ```

## 🐳 Docker Deployment

Build and run using Docker:

```bash
docker build -t student-portal .
docker run -p 5000:5000 --env-file .env student-portal
```

## 🔒 Security Features
- **Bcrypt Hashing**: All user passwords are salted and hashed.
- **JWT Protection**: Secure, token-based authentication for all API routes.
- **Content Security Policy**: Optimized `helmet` configuration to protect against XSS.
- **Route Guarding**: Middleware-protected endpoints for Admin and Faculty roles.

##
Rener deployed link:https://student-portal01.onrender.com/
