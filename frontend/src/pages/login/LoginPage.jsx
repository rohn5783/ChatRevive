import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import { MotionReveal } from '../../shared/ui/MotionReveal.jsx'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import { PasswordToggle } from '../../shared/ui/PasswordToggle.jsx'
import { TextField } from '../../shared/ui/TextField.jsx'
import './LoginPage.scss'

const initialLoginState = {
  email: '',
  password: '',
}

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialLoginState)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [loadingAction, setLoadingAction] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoadingAction('login')

    try {
      const response = await login(form)
      setStatus({ type: 'success', message: response.message || 'Login successful.' })
      navigate('/upload')
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoadingAction('')
    }
  }

  const handleGoogleSignIn = async () => {
    setLoadingAction('google')

    try {
      const response = await loginWithGoogle()
      setStatus({ type: 'success', message: response.message || 'Google sign-in started.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoadingAction('')
    }
  }

  return (
    <main className="login-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient-grid" />
      <div className="orbit-ring orbit-ring--one" />
      <MotionReveal as="section" className="login-layout" mode="enter">
        <MotionReveal as="div" className="login-copy" delay={0.06} mode="enter">
          <p className="eyebrow">ChatRevive Access</p>
          <h1>Return to the workspace where your chats become useful again.</h1>
          <p className="login-copy__lede">
            Pick up where you left off, upload fresh exports, and jump straight back
            into a structured conversation timeline.
          </p>
          <div className="login-copy__points">
            <article>
              <strong>Fast sign-in</strong>
              <p>Use local auth today, with Google flow ready for backend expansion.</p>
            </article>
            <article>
              <strong>Protected session</strong>
              <p>Your account stays behind cookie-backed auth and verification checks.</p>
            </article>
          </div>
        </MotionReveal>

        <MotionReveal as="section" className="login-card" delay={0.12} mode="enter">
          <div className="login-card__header">
            <span className="login-card__badge">Login</span>
            <h2>Welcome back</h2>
            <p>Sign in to reach your upload queue and chat archive.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <TextField
              label="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="enter gmail"
              autoComplete="email"
            />
            <TextField
              label="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="enter password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              trailingAction={
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((current) => !current)}
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

          <p className={`page-status page-status--${status.type}`}>
            {status.message || 'Use your account credentials to continue.'}
          </p>

          <p className="page-link-row">
            Need an account? <Link to="/register">Create one here</Link>
          </p>
        </MotionReveal>
      </MotionReveal>
    </main>
  )
}
