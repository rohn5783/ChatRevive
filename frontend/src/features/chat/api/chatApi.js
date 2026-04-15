const API_BASE_URL = "https://chatrevive.onrender.com"

export async function uploadChatFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/chats/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const details = [data.message, data.error].filter(Boolean).join(': ')
    throw new Error(details || 'Upload failed')
  }

  return data
}
