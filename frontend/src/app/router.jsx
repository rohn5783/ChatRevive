import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from 'react-router'
import { motion } from 'framer-motion'
import { useAuth } from './providers/useAuth.js'
import { LandingPage } from '../pages/landing/LandingPage.jsx'
import { LoginPage } from '../pages/login/LoginPage.jsx'
import { RegisterPage } from '../pages/register/RegisterPage.jsx'
import { UploadPage } from '../pages/upload/UploadPage.jsx'
import { ChatPage } from '../pages/chat/ChatPage.jsx'

const MotionSection = motion.section

function BootScreen() {
  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <MotionSection
        className="boot-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="boot-card__pulse" />
        <p>Restoring your ChatRevive workspace...</p>
      </MotionSection>
    </main>
  )
}

function AppBootstrapGate() {
  const { isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <BootScreen />
  }

  return <Outlet />
}

function PublicRoute() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/upload" replace />
  }

  return <Outlet />
}

function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppBootstrapGate />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        element: <PublicRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'upload', element: <UploadPage /> },
          { path: 'chat', element: <ChatPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
