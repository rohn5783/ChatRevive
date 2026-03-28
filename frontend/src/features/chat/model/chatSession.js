const CHAT_STORAGE_KEY = 'chatrevive:last-chat-upload'

export function saveChatSession(payload) {
  sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload))
}

export function clearChatSession() {
  sessionStorage.removeItem(CHAT_STORAGE_KEY)
}

export function getChatSession() {
  const rawSession = sessionStorage.getItem(CHAT_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession)
  } catch {
    sessionStorage.removeItem(CHAT_STORAGE_KEY)
    return null
  }
}
