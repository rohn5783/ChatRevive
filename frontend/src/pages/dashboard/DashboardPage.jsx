import { useState } from 'react'
import { useAuth } from '../../app/providers/useAuth.js'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import './DashboardPage.scss'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const usagePercent = Math.min(
    100,
    Math.round(((user?.trialUploadsUsed ?? 0) / (user?.trialUploadsLimit || 1)) * 100),
  )

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="dashboard-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="dashboard-shell">
        <header className="dashboard-hero">
          <div>
            <p className="eyebrow">Workspace Active</p>
            <h1>Welcome back, {user?.fullName?.split(' ')[0] || 'there'}.</h1>
            <p className="dashboard-hero__lede">
              Your frontend is now connected to the auth backend and ready for the
              next feature layer like chat import, parser uploads, and conversation
              analytics.
            </p>
          </div>
          <AppButton
            type="button"
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out...' : 'Logout'}
          </AppButton>
        </header>

        <section className="dashboard-grid">
          <article className="dashboard-card dashboard-card--primary">
            <p className="dashboard-card__label">Current plan</p>
            <h2>{user?.plan || 'free'}</h2>
            <p>
              Verified: <strong>{user?.isVerified ? 'Yes' : 'No'}</strong>
            </p>
            <p>
              Provider: <strong>{user?.authProvider || 'local'}</strong>
            </p>
          </article>

          <article className="dashboard-card">
            <p className="dashboard-card__label">Trial usage</p>
            <h2>
              {user?.trialUploadsUsed ?? 0} / {user?.trialUploadsLimit ?? 0}
            </h2>
            <div className="usage-bar" aria-hidden="true">
              <span style={{ width: `${usagePercent}%` }} />
            </div>
            <p>{user?.isTrialActive ? 'Trial currently active' : 'Trial ended'}</p>
          </article>

          <article className="dashboard-card">
            <p className="dashboard-card__label">Account email</p>
            <h2>{user?.email}</h2>
            <p>
              Last login:{' '}
              {user?.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : 'First authenticated session'}
            </p>
          </article>
        </section>
      </section>
    </main>
  )
}
