import { Link } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../../app/providers/useAuth.js'
import { MotionReveal } from '../../shared/ui/MotionReveal.jsx'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import './DashboardPage.scss'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)

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

  const handleNavLinkClick = () => {
    setIsNavOpen(false)
  }

  return (
    <main className="dashboard-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <MotionReveal as="section" className="dashboard-shell" mode="enter">
        <MotionReveal as="header" className="dashboard-topbar" delay={0.04} mode="enter">
          <Link to="/" className="dashboard-brand">
            ChatRevive
          </Link>

          <button
            type="button"
            className={`dashboard-nav-toggle${isNavOpen ? ' is-open' : ''}`}
            aria-expanded={isNavOpen}
            aria-controls="dashboard-topbar-nav"
            aria-label={isNavOpen ? 'Close dashboard navigation' : 'Open dashboard navigation'}
            onClick={() => setIsNavOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            id="dashboard-topbar-nav"
            className={`dashboard-topbar__nav${isNavOpen ? ' is-open' : ''}`}
            aria-label="Dashboard navigation"
          >
            <a href="#overview" onClick={handleNavLinkClick}>
              Overview
            </a>
            <a href="#usage" onClick={handleNavLinkClick}>
              Usage
            </a>
            <a href="#account" onClick={handleNavLinkClick}>
              Account
            </a>
            <Link to="/upload" onClick={handleNavLinkClick}>
              Upload
            </Link>
            <Link to="/chat" onClick={handleNavLinkClick}>
              Chat
            </Link>
          </nav>

          <AppButton
            type="button"
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out...' : 'Logout'}
          </AppButton>
        </MotionReveal>

        <section className="dashboard-hero" id="overview">
          <MotionReveal as="div" className="dashboard-hero__copy" delay={0.08} mode="enter">
            <p className="eyebrow">Workspace Active</p>
            <h1>Welcome back, {user?.fullName?.split(' ')[0] || 'there'}.</h1>
            <p className="dashboard-hero__lede">
              Your frontend is now connected to the auth backend and ready for the
              next feature layer like chat import, parser uploads, and conversation
              analytics.
            </p>
            <div className="dashboard-hero__actions">
              <Link to="/upload" className="dashboard-cta dashboard-cta--primary">
                Upload another chat
              </Link>
              <Link to="/chat" className="dashboard-cta dashboard-cta--secondary">
                Open current chat
              </Link>
            </div>
          </MotionReveal>

          <MotionReveal as="article" className="dashboard-spotlight" delay={0.14} mode="enter">
            <p className="dashboard-card__label">Workspace pulse</p>
            <h2>Your account is set up for import and review.</h2>
            <p>
              Keep the navbar anchored while the dashboard content scrolls, so the
              main actions stay close at hand as you move through usage, account,
              and workspace details.
            </p>
          </MotionReveal>
        </section>

        <section className="dashboard-grid" id="usage">
          <MotionReveal as="article" className="dashboard-card dashboard-card--primary" delay={0.04}>
            <p className="dashboard-card__label">Current plan</p>
            <h2>{user?.plan || 'free'}</h2>
            <p>
              Verified: <strong>{user?.isVerified ? 'Yes' : 'No'}</strong>
            </p>
            <p>
              Provider: <strong>{user?.authProvider || 'local'}</strong>
            </p>
          </MotionReveal>

          <MotionReveal as="article" className="dashboard-card" delay={0.1}>
            <p className="dashboard-card__label">Trial usage</p>
            <h2>
              {user?.trialUploadsUsed ?? 0} / {user?.trialUploadsLimit ?? 0}
            </h2>
            <div className="usage-bar" aria-hidden="true">
              <span style={{ width: `${usagePercent}%` }} />
            </div>
            <p>{user?.isTrialActive ? 'Trial currently active' : 'Trial ended'}</p>
          </MotionReveal>

          <MotionReveal as="article" className="dashboard-card" delay={0.16} id="account">
            <p className="dashboard-card__label">Account email</p>
            <h2>{user?.email}</h2>
            <p>
              Last login:{' '}
              {user?.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : 'First authenticated session'}
            </p>
          </MotionReveal>
        </section>

        <section className="dashboard-detail-grid">
          <MotionReveal as="article" className="dashboard-card dashboard-card--wide" delay={0.04}>
            <p className="dashboard-card__label">Next steps</p>
            <h2>Keep your workspace moving</h2>
            <p>
              Import a fresh `.txt` export, review the parsed chat thread, and keep
              an eye on your free upload usage as the product grows into search and
              analysis workflows.
            </p>
          </MotionReveal>

          <MotionReveal as="article" className="dashboard-card" delay={0.1}>
            <p className="dashboard-card__label">Quick status</p>
            <h2>{user?.isTrialActive ? 'Ready to upload' : 'Upgrade needed'}</h2>
            <p>
              Free uploads remaining:{' '}
              <strong>
                {Math.max(0, (user?.trialUploadsLimit ?? 0) - (user?.trialUploadsUsed ?? 0))}
              </strong>
            </p>
          </MotionReveal>
        </section>

        <section className="dashboard-stack">
          <MotionReveal as="article" className="dashboard-card" delay={0.04}>
            <p className="dashboard-card__label">Workspace notes</p>
            <h2>Why this layout works better</h2>
            <p>
              The sticky top bar keeps navigation and logout visible while the main
              dashboard cards scroll underneath. It feels more app-like and keeps the
              primary actions stable on longer pages.
            </p>
          </MotionReveal>

          <MotionReveal as="article" className="dashboard-card" delay={0.1}>
            <p className="dashboard-card__label">Session summary</p>
            <h2>Everything important is still in view</h2>
            <p>
              Your plan, usage, and account details stay grouped into distinct cards,
              with a stronger hero section up top to give the dashboard more visual
              structure.
            </p>
          </MotionReveal>

          <MotionReveal as="article" className="dashboard-card" delay={0.16}>
            <p className="dashboard-card__label">Navigation behavior</p>
            <h2>Scroll the content, not the top controls</h2>
            <p>
              The navbar now uses sticky positioning with blur and a subtle border, so
              it remains readable over the ambient background as the page moves.
            </p>
          </MotionReveal>
        </section>
      </MotionReveal>
    </main>
  )
}
