const INVISIBLE_CHARACTER_REGEX = /[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g

function sanitizeText(value = '') {
  return String(value).replace(INVISIBLE_CHARACTER_REGEX, '').trim()
}

function normalizeMediaFileName(fileName = '') {
  let normalizedName = sanitizeText(fileName).replace(/\\/g, '/')

  try {
    normalizedName = decodeURIComponent(normalizedName)
  } catch {
    // Ignore malformed URI sequences and keep the original file name.
  }

  normalizedName = normalizedName.split('/').pop() ?? normalizedName
  normalizedName = normalizedName.replace(/^["']+|["']+$/g, '')

  return normalizedName.trim()
}

function inferMediaKind(fileName = '') {
  const normalizedName = normalizeMediaFileName(fileName).toLowerCase()

  if (/\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(normalizedName)) {
    return 'image'
  }

  if (/\.(mp4|mov|avi|mkv|webm|3gp)$/i.test(normalizedName)) {
    return 'video'
  }

  if (/\.(mp3|aac|wav|ogg|m4a|opus)$/i.test(normalizedName)) {
    return 'audio'
  }

  return 'document'
}

function extractMediaInfo(messageText) {
  const trimmedText = sanitizeText(messageText)
  const attachedMatch =
    trimmedText.match(/^<attached:\s*(.+?)>$/i) ??
    trimmedText.match(/^(.+?)\s\((?:file attached|attached)\)$/i)

  if (attachedMatch) {
    const fileName = normalizeMediaFileName(attachedMatch[1])

    return {
      fileName,
      kind: inferMediaKind(fileName),
      label: 'Attachment',
    }
  }

  const omittedMatch = trimmedText.match(
    /^<?(?:(image|video|audio|voice message|document|sticker|gif)|media)\s+omitted>?$/i
  )

  if (omittedMatch) {
    const omittedType = omittedMatch[1]?.toLowerCase() ?? 'media'
    const kind =
      omittedType === 'image' || omittedType === 'sticker' || omittedType === 'gif'
        ? 'image'
        : omittedType === 'video'
          ? 'video'
          : omittedType === 'audio' || omittedType === 'voice message'
            ? 'audio'
            : omittedType === 'document'
              ? 'document'
              : 'unknown'
    const label =
      omittedType === 'media'
        ? 'Media omitted'
        : `${omittedType.charAt(0).toUpperCase()}${omittedType.slice(1)} omitted`

    return {
      fileName: null,
      kind,
      label,
    }
  }

  return null
}

function parseWhatsAppChat(text, myName) {
  const lines = text.split(/\r?\n/)
  const messages = []

  const regex =
    /^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)??)\s-\s([^:]+?):\s([\s\S]*)$/i

  let lastMessage = null

  for (let line of lines) {
    const match = line.match(regex)

    if (match) {
      const message = {
        sender: match[3],
        message: match[4],
        date: match[1],
        time: match[2],
        isMe: match[3] === myName,
        media: extractMediaInfo(match[4])
      }

      messages.push(message)
      lastMessage = message
    } else if (lastMessage) {
      lastMessage.message += "\n" + line
    }
  }

  return messages
}

export { parseWhatsAppChat }
