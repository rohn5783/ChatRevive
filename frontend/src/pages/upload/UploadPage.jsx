import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import './UploadPage.scss'

export function UploadPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus] = useState('Drop in a `.txt` export to prepare the next analysis step.')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setSelectedFile(nextFile)

    if (nextFile) {
      setStatus(`Loaded ${nextFile.name}. You can route this into parsing next.`)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      navigate('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="upload-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="upload-shell">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Upload Workspace</p>
            <h1>Bring in a chat export and start shaping the archive.</h1>
            <p className="workspace-header__lede">
              Signed in as <strong>{user?.email}</strong>. Use this page as the intake
              point for plain-text exports before reviewing the message stream.
            </p>
          </div>
          <div className="workspace-header__actions">
            <Link to="/chat" className="workspace-link">
              Open chat view
            </Link>
            <AppButton
              type="button"
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </AppButton>
          </div>
        </header>

        <section className="upload-grid">
          <article className="upload-card upload-card--dropzone">
            <p className="upload-card__label">Text file upload</p>
            <h2>Drop a `.txt` conversation export here</h2>
            <p>
              This route is ready for wiring into real parsing. For now it gives you a
              dedicated upload-focused entry point in the app flow.
            </p>

            <button
              type="button"
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="upload-dropzone__icon">TXT</span>
              <span>
                {selectedFile ? selectedFile.name : 'Choose a text export from your machine'}
              </span>
            </button>

            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileChange}
            />

            <p className="upload-status">{status}</p>
          </article>

          <article className="upload-card">
            <p className="upload-card__label">Session snapshot</p>
            <h2>{user?.fullName || 'ChatRevive user'}</h2>
            <p>Plan: {user?.plan || 'free'}</p>
            <p>Verification: {user?.isVerified ? 'completed' : 'pending'}</p>
            <p>Trial uploads used: {user?.trialUploadsUsed ?? 0}</p>
          </article>
        </section>
      </section>
    </main>
  )
}
