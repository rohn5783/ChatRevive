let mediaRegistry = new Map()

function normalizeFileName(fileName) {
  return String(fileName || '').trim().toLowerCase()
}

function inferMediaKind(file) {
  if (file.type.startsWith('image/')) {
    return 'image'
  }

  if (file.type.startsWith('video/')) {
    return 'video'
  }

  if (file.type.startsWith('audio/')) {
    return 'audio'
  }

  return 'document'
}

function clearMediaRegistry() {
  mediaRegistry.forEach((entry) => {
    URL.revokeObjectURL(entry.url)
  })

  mediaRegistry = new Map()
}

export function clearMediaSession() {
  clearMediaRegistry()
}

export function replaceMediaFiles(files) {
  clearMediaRegistry()

  files.forEach((file) => {
    const normalizedName = normalizeFileName(file.name)

    if (!normalizedName) {
      return
    }

    mediaRegistry.set(normalizedName, {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      kind: inferMediaKind(file),
      size: file.size,
      url: URL.createObjectURL(file),
    })
  })
}

export function getMediaEntry(fileName) {
  return mediaRegistry.get(normalizeFileName(fileName)) ?? null
}

export function hasMediaInSession() {
  return mediaRegistry.size > 0
}
