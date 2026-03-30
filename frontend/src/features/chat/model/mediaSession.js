let mediaRegistry = new Map()
const INVISIBLE_CHARACTER_REGEX = /[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g

function sanitizeFileName(fileName) {
  let normalizedFileName = String(fileName || '').replace(INVISIBLE_CHARACTER_REGEX, '').trim()

  try {
    normalizedFileName = decodeURIComponent(normalizedFileName)
  } catch {
    // Ignore malformed URI sequences and keep the original file name.
  }

  normalizedFileName = normalizedFileName.replace(/\\/g, '/')
  normalizedFileName = normalizedFileName.split('/').pop() ?? normalizedFileName
  normalizedFileName = normalizedFileName.replace(/^["']+|["']+$/g, '')

  return normalizedFileName.trim()
}

function normalizeFileName(fileName) {
  return sanitizeFileName(fileName).toLowerCase()
}

function buildLookupKeys(fileName) {
  const normalizedName = normalizeFileName(fileName)
  const normalizedWithoutSpaces = normalizedName.replace(/\s+/g, '')
  const normalizedWithoutHyphenSpaces = normalizedName.replace(/\s*-\s*/g, '-')

  return [...new Set([normalizedName, normalizedWithoutSpaces, normalizedWithoutHyphenSpaces])]
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

  const normalizedFileName = normalizeFileName(file.name)

  if (/\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(normalizedFileName)) {
    return 'image'
  }

  if (/\.(mp4|mov|avi|mkv|webm|3gp)$/i.test(normalizedFileName)) {
    return 'video'
  }

  if (/\.(mp3|aac|wav|ogg|m4a|opus)$/i.test(normalizedFileName)) {
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

    const mediaEntry = {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      kind: inferMediaKind(file),
      size: file.size,
      url: URL.createObjectURL(file),
    }

    buildLookupKeys(file.name).forEach((lookupKey) => {
      mediaRegistry.set(lookupKey, mediaEntry)
    })
  })
}

export function getMediaEntry(fileName) {
  const lookupKeys = buildLookupKeys(fileName)

  for (const lookupKey of lookupKeys) {
    const mediaEntry = mediaRegistry.get(lookupKey)

    if (mediaEntry) {
      return mediaEntry
    }
  }

  return null
}

export function getMediaEntries() {
  const seenUrls = new Set()
  const mediaEntries = []

  mediaRegistry.forEach((entry) => {
    if (!entry?.url || seenUrls.has(entry.url)) {
      return
    }

    seenUrls.add(entry.url)
    mediaEntries.push(entry)
  })

  return mediaEntries.sort((leftEntry, rightEntry) =>
    leftEntry.fileName.localeCompare(rightEntry.fileName, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  )
}

export function hasMediaInSession() {
  return mediaRegistry.size > 0
}
