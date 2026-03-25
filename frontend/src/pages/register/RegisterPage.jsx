import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import { TextField } from '../../shared/ui/TextField.jsx'
import './RegisterPage.scss'

const initialRegisterState = {
  fullName: '',
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

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialRegisterState)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [loadingAction, setLoadingAction] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setLoadingAction('register')

    try {
      const response = await register(form)
      setStatus({
        type: 'success',
        message: response.message || 'Registration successful. You can log in now.',
      })
      setForm(initialRegisterState)
      navigate('/login')
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoadingAction('')
    }
  }

  return (
    <main className="register-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-three" />
      <div className="ambient-grid" />
      <div className="orbit-ring orbit-ring--two" />
      <section className="register-layout">
        <div className="register-copy">
          <p className="eyebrow">Start Fresh</p>
          <h1>Build your account and unlock a cleaner way to revisit exported chats.</h1>
          <p className="register-copy__lede">
            Register once and move directly into text uploads and searchable
            message views.
          </p>
          <div className="register-copy__stats">
            <article>
              <strong>Ready instantly</strong>
              <p>Create your account now and head straight to login.</p>
            </article>
            <article>
              <strong>Ready to upload</strong>
              <p>Your next stop after sign-in is a focused workspace for `.txt` imports.</p>
            </article>
          </div>
        </div>

        <section className="register-card">
          <div className="register-card__header">
            <span className="register-card__badge">Register</span>
            <h2>Create your space</h2>
            <p>Set up your account to continue into the app.</p>
          </div>

          <form className="register-form" onSubmit={handleRegisterSubmit}>
            <TextField
              label="username"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="enter username"
              autoComplete="name"
            />
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
              autoComplete="new-password"
              trailingAction={
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((current) => !current)}
                />
              }
            />

            <AppButton type="submit" disabled={loadingAction === 'register'}>
              {loadingAction === 'register' ? 'Creating...' : 'register'}
            </AppButton>
          </form>

          <p className={`page-status page-status--${status.type}`}>
            {status.message || 'Create an account to start uploading archived chats.'}
          </p>

          <p className="page-link-row">
            Already registered? <Link to="/login">Go to login</Link>
          </p>
        </section>
      </section>
    </main>
  )
}
