const API_BASE_URL = "https://chatrevive.onrender.com"
const TOKEN_STORAGE_KEY = 'chatrevive_auth_token'

function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export async function uploadChatFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const headers = {}
  
  // Add token to Authorization header if available
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/api/chats/upload`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const details = [data.message, data.error].filter(Boolean).join(': ')
    throw new Error(details || 'Upload failed')
  }

  return data
}
