const API_BASE_URL = "https://chatrevive.onrender.com"
const TOKEN_STORAGE_KEY = 'chatrevive_auth_token'

// Store token in localStorage
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

// Get token from localStorage
function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Add token to Authorization header if available
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const details = [data.message, data.error].filter(Boolean).join(': ')
    throw new Error(details || 'Request failed')
  }

  return data
}

export function registerUser(payload) {
  return request('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyOtp(payload) {
  return request('/api/users/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resendOtp(payload) {
  return request('/api/users/resend-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload) {
  return request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(data => {
    // Store token after successful login
    if (data.token) {
      setAuthToken(data.token)
    }
    return data
  })
}

export function googleSignIn() {
  return request('/api/users/google-signin', {
    method: 'POST',
    body: JSON.stringify({}),
  }).then(data => {
    // Store token after successful Google sign in
    if (data.token) {
      setAuthToken(data.token)
    }
    return data
  })
}

export function getCurrentUser() {
  return request('/api/users/me')
}

export function logoutUser() {
  return request('/api/users/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  }).then(data => {
    // Clear token after logout
    setAuthToken(null)
    return data
  })
}
