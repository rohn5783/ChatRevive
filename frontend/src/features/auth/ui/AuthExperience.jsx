import { useState } from 'react'
import { useAuth } from '../../../app/providers/useAuth.js'
import { AppButton } from '../../../shared/ui/AppButton.jsx'
import { PasswordToggle } from '../../../shared/ui/PasswordToggle.jsx'
import { TextField } from '../../../shared/ui/TextField.jsx'
import './AuthExperience.scss'

const initialLoginState = {
  email: '',
  password: '',
}

const initialRegisterState = {
  fullName: '',
  email: '',
  password: '',
}

export function AuthExperience() {
  const {
    register,
    login,
    loginWithGoogle,
    pendingVerification,
    verifyEmailOtp,
    resendEmailOtp,
  } = useAuth()
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState(initialLoginState)
  const [registerForm, setRegisterForm] = useState(initialRegisterState)
  const [otp, setOtp] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [isVerificationDone, setIsVerificationDone] = useState(false)
  const [status, setStatus] = useState({
    type: 'idle',
    message: '',
  })
  const [loadingAction, setLoadingAction] = useState('')

  const isOtpMode = Boolean(pendingVerification?.email)

  const setFeedback = (type, message) => {
    setStatus({ type, message })
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  const handleRegisterChange = (event) => {
    const { name, value } = event.target
    setRegisterForm((current) => ({ ...current, [name]: value }))
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setLoadingAction('login')

    try {
      const response = await login(loginForm)
      setFeedback('success', response.message || 'Login successful')
    } catch (error) {
      setFeedback('error', error.message)
    } finally {
      setLoadingAction('')
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setLoadingAction('register')

    try {
      const response = await register(registerForm)
      setOtp('')
      setMode('register')
      setIsVerificationDone(false)
      setFeedback(
        'success',
        response.message || 'Registration started. Check your OTP and verify your email.',
      )
    } catch (error) {
      setFeedback('error', error.message)
    } finally {
      setLoadingAction('')
    }
  }

  const handleVerifySubmit = async (event) => {
    event.preventDefault()
    setLoadingAction('verify')

    try {
      const response = await verifyEmailOtp({
        email: pendingVerification.email,
        otp,
      })
      setFeedback(
        'success',
        `${response.message}. You can log in now with your email and password.`,
      )
      setIsVerificationDone(true)
      setMode('login')
      setLoginForm((current) => ({
        ...current,
        email: pendingVerification.email,
      }))
      setOtp('')
    } catch (error) {
      setFeedback('error', error.message)
    } finally {
      setLoadingAction('')
    }
  }

  const handleResendOtp = async () => {
    setLoadingAction('resend')

    try {
      const response = await resendEmailOtp(pendingVerification.email)
      setFeedback('success', response.message || 'OTP sent again')
    } catch (error) {
      setFeedback('error', error.message)
    } finally {
      setLoadingAction('')
    }
  }

  const handleGoogleSignIn = async () => {
    setLoadingAction('google')

    try {
      const response = await loginWithGoogle()
      setFeedback('success', response.message)
    } catch (error) {
      setFeedback('error', error.message)
    } finally {
      setLoadingAction('')
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-card__glow auth-card__glow--cyan" />
      <div className="auth-card__glow auth-card__glow--amber" />
      <div className="auth-card__frame" />
      <div className="auth-card__header">
        <div className="auth-card__badge-wrap">
          <span className="auth-card__badge">Live onboarding</span>
          <h2 className="auth-card__heading">
            {isOtpMode ? 'Secure your access' : mode === 'login' ? 'Welcome back' : 'Create your space'}
          </h2>
        </div>
        <div className="auth-tabs" role="tablist" aria-label="Auth modes">
          <button
            type="button"
            className={mode === 'login' && !isOtpMode ? 'is-active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' || isOtpMode ? 'is-active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>
      </div>

      {isOtpMode ? (
        <form className="auth-form" onSubmit={handleVerifySubmit}>
          <div className="auth-form__title-block">
            <h2>Verify your email</h2>
            <p>
              Enter the 6-digit OTP sent for <strong>{pendingVerification.email}</strong>
            </p>
          </div>

          <div className="otp-panel">
            <div className="otp-panel__icon">{isVerificationDone ? 'OK' : 'OTP'}</div>
            <div>
              <strong>{isVerificationDone ? 'Verification done' : 'Enter verification code'}</strong>
              <p>
                {isVerificationDone
                  ? 'Your account is verified. You can log in now.'
                  : 'Paste the 6-digit code from your Gmail inbox.'}
              </p>
            </div>
          </div>

          <TextField
            label="email"
            name="email"
            value={pendingVerification.email}
            readOnly
            placeholder="email"
          />
          <TextField
            label="otp"
            name="otp"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="enter otp"
            inputMode="numeric"
            maxLength={6}
          />

          {pendingVerification.otpPreview ? (
            <div className="dev-note">
              <span>Dev OTP</span>
              <strong>{pendingVerification.otpPreview}</strong>
            </div>
          ) : null}

          <div className="auth-form__actions">
            <AppButton type="submit" disabled={loadingAction === 'verify'}>
              {loadingAction === 'verify' ? 'Verifying...' : 'Verify email'}
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              disabled={loadingAction === 'resend'}
              onClick={handleResendOtp}
            >
              {loadingAction === 'resend' ? 'Sending...' : 'Resend OTP'}
            </AppButton>
          </div>
        </form>
      ) : mode === 'login' ? (
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <div className="auth-form__title-block">
            <h2>login</h2>
          </div>

          <TextField
            label="email"
            name="email"
            value={loginForm.email}
            onChange={handleLoginChange}
            placeholder="enter gmail"
            autoComplete="email"
          />
          <TextField
            label="password"
            name="password"
            value={loginForm.password}
            onChange={handleLoginChange}
            placeholder="enter password"
            type={showLoginPassword ? 'text' : 'password'}
            autoComplete="current-password"
            trailingAction={
              <PasswordToggle
                visible={showLoginPassword}
                onToggle={() => setShowLoginPassword((current) => !current)}
              />
            }
          />

          <AppButton
            type="button"
            variant="secondary"
            onClick={handleGoogleSignIn}
            disabled={loadingAction === 'google'}
          >
            {loadingAction === 'google' ? 'Checking...' : 'sign in with gmail'}
          </AppButton>

          <AppButton type="submit" disabled={loadingAction === 'login'}>
            {loadingAction === 'login' ? 'Logging in...' : 'login'}
          </AppButton>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleRegisterSubmit}>
          <div className="auth-form__title-block">
            <h2>register</h2>
          </div>

          <TextField
            label="username"
            name="fullName"
            value={registerForm.fullName}
            onChange={handleRegisterChange}
            placeholder="enter username"
            autoComplete="name"
          />
          <TextField
            label="email"
            name="email"
            value={registerForm.email}
            onChange={handleRegisterChange}
            placeholder="enter gmail"
            autoComplete="email"
          />
          <TextField
            label="password"
            name="password"
            value={registerForm.password}
            onChange={handleRegisterChange}
            placeholder="enter password"
            type={showRegisterPassword ? 'text' : 'password'}
            autoComplete="new-password"
            trailingAction={
              <PasswordToggle
                visible={showRegisterPassword}
                onToggle={() => setShowRegisterPassword((current) => !current)}
              />
            }
          />

          <AppButton type="submit" disabled={loadingAction === 'register'}>
            {loadingAction === 'register' ? 'Creating...' : 'register'}
          </AppButton>
        </form>
      )}

      <footer className="auth-card__footer">
        <div className="auth-card__footer-meta">
          <span>Encrypted cookie session</span>
          <span>OTP protected entry</span>
        </div>
        <p className={`status-banner status-banner--${status.type}`}>
          {status.message || 'Use local auth now. Google sign-in is ready for backend enablement later.'}
        </p>
      </footer>
    </section>
  )
}
