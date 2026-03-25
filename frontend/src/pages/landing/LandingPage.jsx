import { Link } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import './LandingPage.scss'

export function LandingPage() {
  const { user } = useAuth()

  return (
    <main className="landing-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="ambient-grid" />
      <div className="orbit-ring orbit-ring--one" />
      <div className="orbit-ring orbit-ring--two" />

      <section className="landing-shell">
        <header className="landing-header">
          <Link to="/" className="landing-brand">
            ChatRevive
          </Link>
          <nav className="landing-nav" aria-label="Primary">
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to={user ? '/upload' : '/login'}>{user ? 'Upload' : 'Start now'}</Link>
          </nav>
        </header>

        <section className="landing-hero">
          <div className="landing-hero__copy">
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
          </div>

          <article className="landing-spotlight">
            <p className="landing-spotlight__label">What ChatRevive does</p>
            <h2>A smoother path from raw `.txt` exports to useful conversation review.</h2>
            <ul className="landing-list">
              <li>Account registration with OTP email verification</li>
              <li>Login flow for returning users</li>
              <li>Dedicated text upload page for chat exports</li>
              <li>Separate chat display page for reviewing transcript data</li>
            </ul>
          </article>
        </section>

        <section className="landing-grid">
          <article className="landing-card">
            <p className="landing-card__label">Problem</p>
            <h2>Exported chats are hard to reuse</h2>
            <p>
              Most chat backups sit in raw files, buried in folders, with no clean way to
              search, revisit, or transform them into actionable context.
            </p>
          </article>

          <article className="landing-card">
            <p className="landing-card__label">Solution</p>
            <h2>ChatRevive creates structure</h2>
            <p>
              The product gives users a proper SaaS entry point: secure auth, import flow,
              and a workspace designed for reading and extending message history.
            </p>
          </article>

          <article className="landing-card">
            <p className="landing-card__label">Audience</p>
            <h2>Built for heavy chat users</h2>
            <p>
              Freelancers, researchers, founders, support teams, and anyone who needs to
              recover insight from long-form conversations can benefit from the workflow.
            </p>
          </article>
        </section>

        <section className="landing-feature-band">
          <article className="landing-feature">
            <span>01</span>
            <h2>Secure onboarding</h2>
            <p>Register, verify with OTP, and keep workspace access behind authenticated sessions.</p>
          </article>
          <article className="landing-feature">
            <span>02</span>
            <h2>Upload intake</h2>
            <p>Bring plain-text chat exports into a focused upload screen built for future parsing.</p>
          </article>
          <article className="landing-feature">
            <span>03</span>
            <h2>Readable transcript view</h2>
            <p>Move from raw text blobs to a dedicated chat page that can evolve into full conversation analysis.</p>
          </article>
        </section>

        <section className="landing-flow">
          <div className="landing-flow__copy">
            <p className="landing-card__label">Product flow</p>
            <h2>How users move through the product</h2>
            <p>
              A visitor lands on the marketing site, signs up or logs in, uploads a text
              file export, and then transitions to a chat viewing page where imported
              conversations can be explored.
            </p>
          </div>
          <div className="landing-flow__steps">
            <article>
              <strong>Landing</strong>
              <p>Explain the product and invite users into the platform.</p>
            </article>
            <article>
              <strong>Register or login</strong>
              <p>Create an account, verify it, or re-enter an existing workspace.</p>
            </article>
            <article>
              <strong>Upload</strong>
              <p>Select a `.txt` export to begin the import pipeline.</p>
            </article>
            <article>
              <strong>Chat view</strong>
              <p>Read the transcript in a cleaner interface with room for future search and analysis.</p>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}
