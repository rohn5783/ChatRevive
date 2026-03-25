import { AuthExperience } from '../../features/auth/ui/AuthExperience.jsx'
import './AuthPage.scss'

export function AuthPage() {
  return (
    <main className="auth-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="ambient-grid" />
      <div className="orbit-ring orbit-ring--one" />
      <div className="orbit-ring orbit-ring--two" />
      <section className="auth-layout">
        <div className="auth-layout__copy">
          <p className="eyebrow">ChatRevive SaaS</p>
          <div className="auth-kicker">
            <span />
            Memory intelligence for modern conversations
          </div>
          <h1>Turn exported chats into a cinematic, searchable command center.</h1>
          <p className="auth-layout__lede">
            Import history, revive lost context, and surface patterns across your
            conversations inside an interface that feels more like a premium product
            than a plain auth form.
          </p>
          <div className="auth-stats">
            <article>
              <strong>03</strong>
              <span>free trial uploads</span>
            </article>
            <article>
              <strong>OTP</strong>
              <span>email verification flow</span>
            </article>
            <article>
              <strong>24/7</strong>
              <span>workspace access readiness</span>
            </article>
          </div>
          <div className="auth-highlights">
            <article>
              <span>Pulse</span>
              <h2>Private by default</h2>
              <p>Session cookies, local auth, and a crisp verification sequence.</p>
            </article>
            <article>
              <span>Signal</span>
              <h2>Designed for growth</h2>
              <p>Ready to expand from personal chat recovery into a full SaaS workflow.</p>
            </article>
            <article>
              <span>Flow</span>
              <h2>Fast first run</h2>
              <p>Register, verify OTP, log in, and land inside the workspace in minutes.</p>
            </article>
          </div>
        </div>
        <AuthExperience />
      </section>
    </main>
  )
}
