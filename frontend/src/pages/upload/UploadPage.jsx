import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import { uploadChatFile } from '../../features/chat/api/chatApi.js'
import {
  clearChatSession,
  getChatSession,
  saveChatSession,
} from '../../features/chat/model/chatSession.js'
import {
  clearMediaSession,
  replaceMediaFiles,
} from '../../features/chat/model/mediaSession.js'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import './UploadPage.scss'

export function UploadPage() {
  const { user, logout, hydrateVerifiedUser } = useAuth()
  const navigate = useNavigate()
  const existingChatSession = getChatSession()
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus] = useState('Drop in a `.txt` export to prepare the next analysis step.')
  const [hasUploadedChat, setHasUploadedChat] = useState(Boolean(existingChatSession))
  const [uploadSummary, setUploadSummary] = useState(existingChatSession)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isFreeUploadLimitReached =
    user?.plan === 'free' && (user?.trialUploadsUsed ?? 0) >= (user?.trialUploadsLimit ?? 3)

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    const chatFile =
      selectedFiles.find((file) => file.name.toLowerCase().endsWith('.txt')) ?? null
    const mediaFiles = selectedFiles.filter((file) => file !== chatFile)

    setSelectedFile(chatFile)
    setHasUploadedChat(false)
    setUploadSummary(null)

    if (!chatFile) {
      setStatus('Drop in a `.txt` export to prepare the next analysis step.')
      return
    }

    if (isFreeUploadLimitReached) {
      setStatus('You have used all 3 free uploads. Upgrade to continue uploading chats.')
      return
    }

    try {
      setIsUploading(true)
      setStatus(`Uploading ${chatFile.name} and preparing the chat view...`)

      const response = await uploadChatFile(chatFile)
      if (response.user) {
        hydrateVerifiedUser(response.user)
      }
      replaceMediaFiles(mediaFiles)

      const nextSummary = {
        fileName: response.fileName || chatFile.name,
        uploadedAt: new Date().toISOString(),
        messages: response.messages ?? [],
        mediaCount: mediaFiles.length,
      }

      saveChatSession(nextSummary)
      setUploadSummary(nextSummary)
      setHasUploadedChat(true)
      setStatus(
        nextSummary.messages.length > 0
          ? `${nextSummary.fileName} is ready. Open the new chat view to review ${nextSummary.messages.length} messages${mediaFiles.length > 0 ? ` with ${mediaFiles.length} media file${mediaFiles.length === 1 ? '' : 's'}` : ''}.`
          : `${nextSummary.fileName} uploaded, but no WhatsApp-style messages were detected.`
      )
    } catch (error) {
      setStatus(error.message || 'The upload could not be completed.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteViewedChat = () => {
    clearChatSession()
    clearMediaSession()
    setSelectedFile(null)
    setHasUploadedChat(false)
    setUploadSummary(null)
    setStatus('The viewed `.txt` chat was removed from this session.')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
            {hasUploadedChat ? (
              <Link to="/chat" className="workspace-link">
                Open latest chat
              </Link>
            ) : null}
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
            <h2>Drop a `.txt` export with optional media files</h2>
            <p>
              Upload the WhatsApp `.txt` export, plus any exported media files, and
              we&apos;ll build a chat screen that can preview them in place.
            </p>

            <button
              type="button"
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isFreeUploadLimitReached}
            >
              <span className="upload-dropzone__icon">TXT</span>
              <span>
                {isUploading
                  ? 'Uploading your export...'
                  : isFreeUploadLimitReached
                    ? 'Free plan upload limit reached'
                  : selectedFile
                    ? selectedFile.name
                    : 'Choose the chat export and any media files from your machine'}
              </span>
            </button>

            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              multiple
              accept=".txt,text/plain,image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
              onChange={handleFileChange}
            />

            <p className="upload-status">{status}</p>

            {hasUploadedChat && uploadSummary ? (
              <div className="upload-actions">
                <div className="upload-actions__buttons">
                  <AppButton type="button" onClick={() => navigate('/chat')}>
                    New chat
                  </AppButton>
                  <AppButton type="button" variant="ghost" onClick={handleDeleteViewedChat}>
                    Delete viewed txt file
                  </AppButton>
                </div>
                <p className="upload-summary">
                  Parsed {uploadSummary.messages.length} messages from {uploadSummary.fileName}
                  {uploadSummary.mediaCount ? ` and linked ${uploadSummary.mediaCount} media files.` : '.'}
                </p>
              </div>
            ) : null}
          </article>

          <article className="upload-card">
            <p className="upload-card__label">Session snapshot</p>
            <h2>{user?.fullName || 'ChatRevive user'}</h2>
            <p>Plan: {user?.plan || 'free'}</p>
            <p>Verification: {user?.isVerified ? 'completed' : 'pending'}</p>
            <p>
              Trial uploads used: {user?.trialUploadsUsed ?? 0} / {user?.trialUploadsLimit ?? 3}
            </p>
          </article>
        </section>
      </section>
    </main>
  )
}
