import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import { PasswordToggle } from '../../shared/ui/PasswordToggle.jsx'
import { TextField } from '../../shared/ui/TextField.jsx'
import './RegisterPage.scss'

const initialRegisterState = {
  fullName: '',
  email: '',
  password: '',
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
