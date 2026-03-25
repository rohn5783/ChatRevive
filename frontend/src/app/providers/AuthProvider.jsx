import { useEffect, useState } from 'react'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  verifyOtp,
  googleSignIn,
} from '../../features/auth/api/authApi.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [pendingVerification, setPendingVerification] = useState(null)

  useEffect(() => {
    let ignore = false

    const bootstrap = async () => {
      try {
        const response = await getCurrentUser()

        if (!ignore) {
          setUser(response.user)
        }
      } catch {
        if (!ignore) {
          setUser(null)
        }
      } finally {
        if (!ignore) {
          setIsBootstrapping(false)
        }
      }
    }

    bootstrap()

    return () => {
      ignore = true
    }
  }, [])

  const value = {
    user,
    isBootstrapping,
    pendingVerification,
    async register(payload) {
      const response = await registerUser(payload)
      if (response.verificationRequired) {
        setPendingVerification({
          email: response.email,
          otpPreview: response.otpPreview ?? null,
          otpExpiresAt: response.otpExpiresAt ?? null,
        })
      } else {
        setPendingVerification(null)
      }
      return response
    },
    async verifyEmailOtp(payload) {
      const response = await verifyOtp(payload)
      setPendingVerification(null)
      return response
    },
    async resendEmailOtp(email) {
      const response = await resendOtp({ email })
      setPendingVerification({
        email: response.email,
        otpPreview: response.otpPreview ?? null,
        otpExpiresAt: response.otpExpiresAt ?? null,
      })
      return response
    },
    async login(payload) {
      const response = await loginUser(payload)
      setUser(response.user)
      return response
    },
    async loginWithGoogle() {
      return googleSignIn()
    },
    async logout() {
      await logoutUser()
      setUser(null)
      setPendingVerification(null)
    },
    clearPendingVerification() {
      setPendingVerification(null)
    },
    hydrateVerifiedUser(nextUser) {
      setUser(nextUser)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
