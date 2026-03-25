import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import './ChatPage.scss'

const mockMessages = [
  {
    id: 1,
    role: 'system',
    title: 'Session restored',
    body: 'A new import has been indexed and is ready for review.',
    time: '09:04',
  },
  {
    id: 2,
    role: 'user',
    title: 'Planning thread',
    body: 'Need a better way to search old exported conversations by topic.',
    time: '09:06',
  },
  {
    id: 3,
    role: 'assistant',
    title: 'Suggested next step',
    body: 'Parse the file, normalize turns, and render them in a focused transcript view.',
    time: '09:07',
  },
]

export function ChatPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <main className="chat-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-three" />
      <section className="chat-shell">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Chat View</p>
            <h1>Review imported conversations in a calmer, searchable timeline.</h1>
            <p className="chat-header__lede">
              This page is the destination after upload. It gives you a dedicated route
              for showing message threads and account context.
            </p>
          </div>
          <div className="chat-header__actions">
            <Link to="/upload" className="workspace-link">
              Back to upload
            </Link>
            <AppButton type="button" variant="ghost" onClick={handleLogout}>
              Logout
            </AppButton>
          </div>
        </header>

        <section className="chat-grid">
          <aside className="chat-sidebar">
            <p className="chat-sidebar__label">Active workspace</p>
            <h2>{user?.fullName || 'ChatRevive user'}</h2>
            <p>{user?.email}</p>
            <div className="chat-sidebar__meta">
              <span>Plan: {user?.plan || 'free'}</span>
              <span>Provider: {user?.authProvider || 'local'}</span>
              <span>Verified: {user?.isVerified ? 'yes' : 'no'}</span>
            </div>
          </aside>

          <section className="chat-thread">
            <div className="chat-thread__header">
              <p className="chat-thread__label">Imported transcript</p>
              <h2>Prototype conversation view</h2>
            </div>

            <div className="chat-thread__list">
              {mockMessages.map((message) => (
                <article
                  key={message.id}
                  className={`chat-message chat-message--${message.role}`}
                >
                  <div className="chat-message__meta">
                    <strong>{message.title}</strong>
                    <span>{message.time}</span>
                  </div>
                  <p>{message.body}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}
