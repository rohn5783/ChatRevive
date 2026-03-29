import { MotionConfig } from 'framer-motion'
import { AuthProvider } from './providers/AuthProvider.jsx'
import { AppRouter } from './router.jsx'
import './App.scss'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </MotionConfig>
  )
}
