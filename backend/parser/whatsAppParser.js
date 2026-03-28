function inferMediaKind(fileName = '') {
  const normalizedName = String(fileName).trim().toLowerCase()

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
  const trimmedText = String(messageText || '').trim()
  const attachedMatch =
    trimmedText.match(/^<attached:\s(.+?)>$/i) ??
    trimmedText.match(/^(.+?)\s\((?:file attached|attached)\)$/i)

  if (attachedMatch) {
    const fileName = attachedMatch[1].trim()

    return {
      fileName,
      kind: inferMediaKind(fileName),
      label: 'Attachment',
    }
  }

  if (/^<media omitted>$/i.test(trimmedText)) {
    return {
      fileName: null,
      kind: 'unknown',
      label: 'Media omitted',
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
