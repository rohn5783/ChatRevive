import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import { TextField } from '../../shared/ui/TextField.jsx'
import './LoginPage.scss'

const initialLoginState = {
  email: '',
  password: '',
}

function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      className="field-toggle"
      onClick={onToggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
    >
      {visible ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M3 4.5 19.5 21M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.6A10.9 10.9 0 0 1 12 5.4c5.4 0 9.1 5.1 9.8 6.1-.4.6-1.7 2.4-3.8 3.9M6.5 7.1C4.4 8.6 3.1 10.4 2.7 11c.7 1 4.4 6.1 9.3 6.1 1 0 1.9-.1 2.7-.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M2.7 12S6.4 5.9 12 5.9 21.3 12 21.3 12 17.6 18.1 12 18.1 2.7 12 2.7 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </button>
  )
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
      <section className="login-layout">
        <div className="login-copy">
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
        </div>

        <section className="login-card">
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
        </section>
      </section>
    </main>
  )
}
