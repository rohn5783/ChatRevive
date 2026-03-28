import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import {
  clearChatSession,
  getChatSession,
} from '../../features/chat/model/chatSession.js'
import {
  clearMediaSession,
  getMediaEntry,
  hasMediaInSession,
} from '../../features/chat/model/mediaSession.js'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import './ChatPage.scss'

function renderMediaLabel(message) {
  if (message.media?.fileName) {
    return message.media.fileName
  }

  return message.media?.label || 'Media'
}

export function ChatPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const chatSession = getChatSession()
  const [activeMedia, setActiveMedia] = useState(null)

  if (!chatSession) {
    return <Navigate to="/upload" replace />
  }

  const messages = chatSession.messages ?? []
  const mediaAvailable = hasMediaInSession()
  const uniqueSenders = [...new Set(messages.map((message) => message.sender).filter(Boolean))]
  const senderSideMap = new Map(
    uniqueSenders.map((sender, index) => [sender, index % 2 === 0 ? 'them' : 'me'])
  )
  const linkedMediaCount = chatSession.mediaCount ?? 0
  const renderedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        linkedMedia: message.media?.fileName ? getMediaEntry(message.media.fileName) : null,
      })),
    [messages]
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleDeleteViewedChat = () => {
    clearChatSession()
    clearMediaSession()
    setActiveMedia(null)
    navigate('/upload')
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
            <AppButton type="button" variant="ghost" onClick={handleDeleteViewedChat}>
              Delete viewed txt file
            </AppButton>
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
              <span>File: {chatSession.fileName}</span>
              <span>Messages: {messages.length}</span>
              <span>Media files: {linkedMediaCount}</span>
              <span>Plan: {user?.plan || 'free'}</span>
              <span>Uploaded: {new Date(chatSession.uploadedAt).toLocaleString()}</span>
            </div>
          </aside>

          <section className="chat-thread">
            <div className="chat-thread__header">
              <p className="chat-thread__label">Imported transcript</p>
              <h2>WhatsApp-style chat</h2>
            </div>

            {messages.length > 0 ? (
              <div className="chat-thread__list">
                {renderedMessages.map((message, index) => {
                  const side = message.isMe ? 'me' : (senderSideMap.get(message.sender) ?? 'them')

                  return (
                    <article
                      key={`${message.sender}-${message.date}-${message.time}-${index}`}
                      className={`chat-message chat-message--${side}`}
                    >
                      <div className="chat-message__meta">
                        <strong>{message.sender}</strong>
                        <span>
                          {message.date} | {message.time}
                        </span>
                      </div>
                      {message.media ? (
                        <div className="chat-message__media">
                          {message.linkedMedia?.kind === 'image' ? (
                            <button
                              type="button"
                              className="chat-media-card chat-media-card--image"
                              onClick={() => setActiveMedia(message.linkedMedia)}
                            >
                              <img src={message.linkedMedia.url} alt={renderMediaLabel(message)} />
                              <span>{renderMediaLabel(message)}</span>
                            </button>
                          ) : null}

                          {message.linkedMedia?.kind === 'video' ? (
                            <div className="chat-media-card chat-media-card--video">
                              <video controls preload="metadata">
                                <source
                                  src={message.linkedMedia.url}
                                  type={message.linkedMedia.mimeType}
                                />
                              </video>
                              <span>{renderMediaLabel(message)}</span>
                            </div>
                          ) : null}

                          {message.linkedMedia?.kind === 'audio' ? (
                            <div className="chat-media-card chat-media-card--audio">
                              <span>{renderMediaLabel(message)}</span>
                              <audio controls preload="metadata">
                                <source
                                  src={message.linkedMedia.url}
                                  type={message.linkedMedia.mimeType}
                                />
                              </audio>
                            </div>
                          ) : null}

                          {message.linkedMedia?.kind === 'document' ? (
                            <a
                              className="chat-media-card chat-media-card--document"
                              href={message.linkedMedia.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <strong>{renderMediaLabel(message)}</strong>
                              <span>Open attachment</span>
                            </a>
                          ) : null}

                          {!message.linkedMedia ? (
                            <div className="chat-media-card chat-media-card--missing">
                              <strong>{renderMediaLabel(message)}</strong>
                              <span>
                                {mediaAvailable
                                  ? 'This media file was not included in the upload.'
                                  : 'Upload the exported media files together with the chat to preview them here.'}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      <p>{message.message}</p>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="chat-thread__empty">
                <p>No messages were parsed from this file.</p>
                <p>Upload a WhatsApp-exported `.txt` file to see the conversation here.</p>
              </div>
            )}
          </section>
        </section>
      </section>

      {activeMedia ? (
        <div className="chat-lightbox" role="dialog" aria-modal="true">
          <button
            type="button"
            className="chat-lightbox__backdrop"
            aria-label="Close media viewer"
            onClick={() => setActiveMedia(null)}
          />
          <div className="chat-lightbox__panel">
            <button
              type="button"
              className="chat-lightbox__close"
              onClick={() => setActiveMedia(null)}
            >
              Close
            </button>
            <img src={activeMedia.url} alt={activeMedia.fileName} />
            <p>{activeMedia.fileName}</p>
          </div>
        </div>
      ) : null}
    </main>
  )
}
