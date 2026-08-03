# 🎨 Chat App Frontend Client

This is the modern, responsive web frontend for the Real-Time Chat Application. It is built using **Next.js 14 (App Router)**, styled using **Tailwind CSS** and **DaisyUI**, and utilizes **Framer Motion** to deliver fluid user transitions and premium micro-animations.

---

## 🛠 Frontend Tech Stack

*   **Next.js 14**: React framework featuring static optimization, file-system routing, and client-side page rendering.
*   **Tailwind CSS & DaisyUI**: Utility-first styling with structured component themes (supporting beautiful palettes and dark mode variants).
*   **Framer Motion**: State-driven visual micro-animations and route transition animations.
*   **Socket.io-client**: Persistent, real-time bidirectional WebSocket client synchronization.
*   **Context API**: Global state management (Authentication and Chat Messaging states).
*   **Axios**: Promise-based HTTP client for calling REST APIs with global request/response interceptors.

---

## 📂 Folder Layout

```yaml
frontend/
├── app/
│   ├── Components/       # Modular client UI components
│   │   ├── ChatContainer # Manages message inputs, thread messages, headers
│   │   ├── Homepage      # Landing page for guests (Login/Register CTAs)
│   │   ├── SideBar       # Left column navigation (conversations, groups, profile)
│   │   ├── RightSidebar  # Contextual side panel (group settings, member lists)
│   │   └── Loader        # High-fidelity loading animation overlay
│   ├── Context/          # Global React state management
│   │   ├── AuthContext   # Logged-in user state, token refresh, authentication status
│   │   └── MessageContext# Active conversation, direct message threads, socket events
│   ├── Pages/            # Modular page views
│   │   ├── Admin/        # Administrative console interface
│   │   ├── Login/        # User authentication portal
│   │   ├── Profile/      # User settings & profile picture customizer
│   │   ├── Register/     # New user sign-up
│   │   ├── Setting/      # Chat configurations and app preferences
│   │   └── Users/        # Direct contacts search interface
│   ├── Skeletons/        # Placeholder skeletons during loading frames
│   ├── globals.css       # Custom global styles and DaisyUI variables
│   ├── layout.jsx        # App-wide wrapping layout wrapper
│   └── page.jsx          # Client router entry point
├── public/               # Static assets (images, icons)
├── postcss.config.mjs    # PostCSS configurations
└── tailwind.config.js    # Tailwind CSS layout configurations
```

---

## ⚡ React State & Context Flow

The client maintains state across components using two main contexts:

### 🔒 1. `AuthContext`
*   Manages authenticated user data (`authUser`).
*   Handles login, registration, and logout operations.
*   Attaches authorization tokens to API requests and refreshes them seamlessly.

### ✉️ 2. `MessageContext`
*   Tracks current selected direct chat (`selectedUser`), group (`selectedGroup`), or channel (`selectedChannel`).
*   Listens to live Socket.io events (`newMessage`, `typingStatus`, `userStatusUpdate`, `messagesSeen`).
*   Stores loaded conversation lists and keeps track of typing indicators and user presence in real-time.

---

## 🚀 Setup & Execution

### 1. Configure Environments
Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 2. Install & Run
```bash
# Install packages
npm install

# Start Next.js development server
npm run dev
```

### 3. Build for Production
To test the production build and verify compliance:
```bash
# Build production bundle
npm run build

# Start production server
npm run start
```
The app will run by default on `http://localhost:3000`.
