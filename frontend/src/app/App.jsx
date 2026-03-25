import { AuthProvider } from './providers/AuthProvider.jsx'
import { AppRouter } from './router.jsx'
import './App.scss'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
