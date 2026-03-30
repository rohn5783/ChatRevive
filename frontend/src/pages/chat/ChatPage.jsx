import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../../app/providers/useAuth.js'
import {
  clearChatSession,
  getChatSession,
} from '../../features/chat/model/chatSession.js'
import {
  clearMediaSession,
  getMediaEntries,
  getMediaEntry,
  hasMediaInSession,
} from '../../features/chat/model/mediaSession.js'
import { MotionReveal } from '../../shared/ui/MotionReveal.jsx'
import { AppButton } from '../../shared/ui/AppButton.jsx'
import './ChatPage.scss'

const MotionDiv = motion.div

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
  const messages = Array.isArray(chatSession?.messages)
    ? chatSession.messages.filter((message) => message && typeof message === 'object')
    : []
  const mediaEntries = getMediaEntries()
  const mediaAvailable = hasMediaInSession()
  const uniqueSenders = [...new Set(messages.map((message) => message.sender).filter(Boolean))]
  const senderSideMap = new Map(
    uniqueSenders.map((sender, index) => [sender, index % 2 === 0 ? 'them' : 'me'])
  )
  const linkedMediaCount = mediaEntries.length
  const assignedMediaUrls = new Set()
  const renderedMessages = messages.map((message) => ({
    ...message,
    sender: message.sender || 'Unknown sender',
    date: message.date || 'Unknown date',
    time: message.time || 'Unknown time',
    message: typeof message.message === 'string' ? message.message : String(message.message ?? ''),
    linkedMedia: null,
  }))

  renderedMessages.forEach((message, index) => {
    if (!message.media?.fileName) {
      return
    }

    const exactMediaEntry = getMediaEntry(message.media.fileName)

    if (!exactMediaEntry || assignedMediaUrls.has(exactMediaEntry.url)) {
      return
    }

    assignedMediaUrls.add(exactMediaEntry.url)
    renderedMessages[index] = {
      ...message,
      linkedMedia: exactMediaEntry,
    }
  })

  renderedMessages.forEach((message, index) => {
    if (!message.media || message.linkedMedia) {
      return
    }

    const nextMediaEntry =
      mediaEntries.find(
        (entry) =>
          !assignedMediaUrls.has(entry.url) &&
          (message.media.kind && message.media.kind !== 'unknown'
            ? entry.kind === message.media.kind
            : true)
      ) ?? null

    if (!nextMediaEntry) {
      return
    }

    assignedMediaUrls.add(nextMediaEntry.url)
    renderedMessages[index] = {
      ...message,
      linkedMedia: nextMediaEntry,
    }
  })
  const uploadedAtLabel = chatSession?.uploadedAt
    ? new Date(chatSession.uploadedAt).toLocaleString()
    : 'Unknown'

  if (!chatSession) {
    return <Navigate to="/upload" replace />
  }

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
      <MotionReveal as="section" className="chat-shell" mode="enter">
        <MotionReveal as="header" className="chat-header" delay={0.05} mode="enter">
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
        </MotionReveal>

        <section className="chat-grid">
          <MotionReveal as="aside" className="chat-sidebar" delay={0.1} mode="enter">
            <p className="chat-sidebar__label">Active workspace</p>
            <h2>{user?.fullName || 'ChatRevive user'}</h2>
            <p>{user?.email}</p>
            <div className="chat-sidebar__meta">
              <span>File: {chatSession.fileName}</span>
              <span>Messages: {messages.length}</span>
              <span>Media files: {linkedMediaCount}</span>
              <span>Plan: {user?.plan || 'free'}</span>
              <span>Uploaded: {uploadedAtLabel}</span>
            </div>
          </MotionReveal>

          <MotionReveal as="section" className="chat-thread" delay={0.16} mode="enter">
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

            {mediaEntries.length > 0 ? (
              <div className="chat-attachments">
                <div className="chat-attachments__header">
                  <p className="chat-thread__label">Uploaded media</p>
                  <span>{mediaEntries.length} file{mediaEntries.length === 1 ? '' : 's'}</span>
                </div>
                <div className="chat-attachments__grid">
                  {mediaEntries.map((mediaEntry) => (
                    <div key={mediaEntry.url} className="chat-attachments__item">
                      {mediaEntry.kind === 'image' ? (
                        <button
                          type="button"
                          className="chat-media-card chat-media-card--image"
                          onClick={() => setActiveMedia(mediaEntry)}
                        >
                          <img src={mediaEntry.url} alt={mediaEntry.fileName} />
                          <span>{mediaEntry.fileName}</span>
                        </button>
                      ) : null}

                      {mediaEntry.kind === 'video' ? (
                        <div className="chat-media-card chat-media-card--video">
                          <video controls preload="metadata">
                            <source src={mediaEntry.url} type={mediaEntry.mimeType} />
                          </video>
                          <span>{mediaEntry.fileName}</span>
                        </div>
                      ) : null}

                      {mediaEntry.kind === 'audio' ? (
                        <div className="chat-media-card chat-media-card--audio">
                          <span>{mediaEntry.fileName}</span>
                          <audio controls preload="metadata">
                            <source src={mediaEntry.url} type={mediaEntry.mimeType} />
                          </audio>
                        </div>
                      ) : null}

                      {mediaEntry.kind === 'document' ? (
                        <a
                          className="chat-media-card chat-media-card--document"
                          href={mediaEntry.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <strong>{mediaEntry.fileName}</strong>
                          <span>Open attachment</span>
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </MotionReveal>
        </section>
      </MotionReveal>

      <AnimatePresence>
        {activeMedia ? (
          <MotionDiv
            className="chat-lightbox"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <button
              type="button"
              className="chat-lightbox__backdrop"
              aria-label="Close media viewer"
              onClick={() => setActiveMedia(null)}
            />
            <MotionDiv
              className="chat-lightbox__panel"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className="chat-lightbox__close"
                onClick={() => setActiveMedia(null)}
              >
                Close
              </button>
              <img src={activeMedia.url} alt={activeMedia.fileName} />
              <p>{activeMedia.fileName}</p>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </main>
  )
}
