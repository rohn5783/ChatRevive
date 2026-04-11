import { Link } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../../app/providers/useAuth.js'
import { MotionReveal } from '../../shared/ui/MotionReveal.jsx'
import './LandingPage.scss'

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.59 2 12.24c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.71 1.03 1.62 1.03 2.74 0 3.93-2.34 4.79-4.57 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.24C22 6.59 17.52 2 12 2Z"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.94 8.5A1.56 1.56 0 1 1 6.93 5.4a1.56 1.56 0 0 1 .01 3.1ZM5.6 9.67h2.67V18H5.6V9.67Zm4.34 0h2.56v1.14h.04c.36-.67 1.23-1.38 2.53-1.38 2.7 0 3.2 1.83 3.2 4.2V18H15.6v-3.89c0-.93-.02-2.12-1.25-2.12-1.26 0-1.46.99-1.46 2.05V18H9.94V9.67Z"
      />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 2H21l-4.59 5.24L21.8 22h-4.22l-3.31-4.34L10.47 22H8.36l4.91-5.61L2.2 2h4.33l2.99 3.92L12.95 2h2.11l-4.25 4.86 3.63 4.75L18.9 2Zm-1.48 17.45h1.17L5.95 4.45H4.7l12.72 15Z"
      />
    </svg>
  )
}

export function LandingPage() {
  const { user } = useAuth()
  const [isNavOpen, setIsNavOpen] = useState(false)

  const handleNavLinkClick = () => {
    setIsNavOpen(false)
  }

  return (
    <main className="landing-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="ambient-grid" />
      <div className="orbit-ring orbit-ring--one" />
      <div className="orbit-ring orbit-ring--two" />

      <MotionReveal as="section" className="landing-shell" mode="enter">
        <MotionReveal as="header" className="landing-header" delay={0.05} mode="enter">
          <Link to="/" className="landing-brand">
            ChatRevive
          </Link>

          <button
            type="button"
            className={`landing-nav-toggle${isNavOpen ? ' is-open' : ''}`}
            aria-expanded={isNavOpen}
            aria-controls="landing-primary-nav"
            aria-label={isNavOpen ? 'Close primary navigation' : 'Open primary navigation'}
            onClick={() => setIsNavOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            id="landing-primary-nav"
            className={`landing-nav${isNavOpen ? ' is-open' : ''}`}
            aria-label="Primary"
          >
            <Link to="/" onClick={handleNavLinkClick}>
              Home
            </Link>
            <Link to="/login" onClick={handleNavLinkClick}>
              Login
            </Link>
            <Link to="/register" onClick={handleNavLinkClick}>
              Register
            </Link>
            <Link
              to={user ? '/upload' : '/login'}
              className="landing-nav__highlight"
              onClick={handleNavLinkClick}
            >
              {user ? 'Upload' : 'Start now'}
            </Link>
          </nav>
        </MotionReveal>

        <section className="landing-hero">
          <MotionReveal as="div" className="landing-hero__copy" delay={0.1} mode="enter">
            <p className="eyebrow">ChatRevive SaaS</p>
            <h1>Turn exported chats into a searchable workspace instead of a forgotten file.</h1>
            <p className="landing-hero__lede">
              ChatRevive helps users recover value from old conversation exports by turning
              them into a cleaner SaaS workflow with account access, upload intake, and a
              dedicated transcript-style viewing experience.
            </p>
            <div className="landing-hero__actions">
              <Link to={user ? '/upload' : '/register'} className="landing-cta landing-cta--primary">
                {user ? 'Go to upload workspace' : 'Create your account'}
              </Link>
              <Link to="/chat" className="landing-cta landing-cta--secondary">
                Preview chat view
              </Link>
            </div>
          </MotionReveal>

          <MotionReveal as="article" className="landing-spotlight" delay={0.16} mode="enter">
            <p className="landing-spotlight__label">What ChatRevive does</p>
            <h2>A smoother path from raw `.txt` exports to useful conversation review.</h2>
            <ul className="landing-list">
              <li>Account registration with OTP email verification</li>
              <li>Login flow for returning users</li>
              <li>Dedicated text upload page for chat exports</li>
              <li>Separate chat display page for reviewing transcript data</li>
            </ul>
          </MotionReveal>
        </section>

        <section className="landing-grid">
          <MotionReveal as="article" className="landing-card" delay={0.04}>
            <p className="landing-card__label">Problem</p>
            <h2>Exported chats are hard to reuse</h2>
            <p>
              Most chat backups sit in raw files, buried in folders, with no clean way to
              search, revisit, or transform them into actionable context.
            </p>
          </MotionReveal>

          <MotionReveal as="article" className="landing-card" delay={0.1}>
            <p className="landing-card__label">Solution</p>
            <h2>ChatRevive creates structure</h2>
            <p>
              The product gives users a proper SaaS entry point: secure auth, import flow,
              and a workspace designed for reading and extending message history.
            </p>
          </MotionReveal>

          <MotionReveal as="article" className="landing-card" delay={0.16}>
            <p className="landing-card__label">Audience</p>
            <h2>Built for heavy chat users</h2>
            <p>
              Freelancers, researchers, founders, support teams, and anyone who needs to
              recover insight from long-form conversations can benefit from the workflow.
            </p>
          </MotionReveal>
        </section>

        <section className="landing-feature-band">
          <MotionReveal as="article" className="landing-feature" delay={0.04}>
            <span>01</span>
            <h2>Secure onboarding</h2>
            <p>Register, verify with OTP, and keep workspace access behind authenticated sessions.</p>
          </MotionReveal>
          <MotionReveal as="article" className="landing-feature" delay={0.1}>
            <span>02</span>
            <h2>Upload intake</h2>
            <p>Bring plain-text chat exports into a focused upload screen built for future parsing.</p>
          </MotionReveal>
          <MotionReveal as="article" className="landing-feature" delay={0.16}>
            <span>03</span>
            <h2>Readable transcript view</h2>
            <p>Move from raw text blobs to a dedicated chat page that can evolve into full conversation analysis.</p>
          </MotionReveal>
        </section>

        <MotionReveal as="section" className="landing-flow">
          <MotionReveal as="div" className="landing-flow__copy" delay={0.04}>
            <p className="landing-card__label">Product flow</p>
            <h2>How users move through the product</h2>
            <p>
              A visitor lands on the marketing site, signs up or logs in, uploads a text
              file export, and then transitions to a chat viewing page where imported
              conversations can be explored.
            </p>
          </MotionReveal>
          <div className="landing-flow__steps">
            <MotionReveal as="article" delay={0.08}>
              <strong>Landing</strong>
              <p>Explain the product and invite users into the platform.</p>
            </MotionReveal>
            <MotionReveal as="article" delay={0.12}>
              <strong>Register or login</strong>
              <p>Create an account, verify it, or re-enter an existing workspace.</p>
            </MotionReveal>
            <MotionReveal as="article" delay={0.16}>
              <strong>Upload</strong>
              <p>Select a `.txt` export to begin the import pipeline.</p>
            </MotionReveal>
            <MotionReveal as="article" delay={0.2}>
              <strong>Chat view</strong>
              <p>Read the transcript in a cleaner interface with room for future search and analysis.</p>
            </MotionReveal>
          </div>
        </MotionReveal>

        <MotionReveal as="footer" className="landing-social" delay={0.1}>
          <div className="landing-social__copy">
            <p className="landing-card__label">Connect</p>
            <h2>Follow the project and stay close to the build.</h2>
          </div>

          <div className="landing-social__links">
            <a
              href="https://github.com/rohn5783"
              target="_blank"
              rel="noreferrer"
              className="landing-social__link"
              aria-label="Visit ChatRevive on GitHub"
            >
              <span className="landing-social__icon">
                <GithubIcon />
              </span>
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/rohit-pandey-bb9468355"
              target="_blank"
              rel="noreferrer"
              className="landing-social__link"
              aria-label="Visit ChatRevive on LinkedIn"
            >
              <span className="landing-social__icon">
                <LinkedInIcon />
              </span>
              <span>LinkedIn</span>
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="landing-social__link"
              aria-label="Visit ChatRevive on Twitter"
            >
              <span className="https://x.com/rohitn5783">
                <TwitterIcon />
              </span>
              <span>Twitter</span>
            </a>
          </div>

          <p className="landing-social__signature">Made with love by Rohit</p>
        </MotionReveal>
      </MotionReveal>
    </main>
  )
}
