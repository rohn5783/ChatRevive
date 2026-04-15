const API_BASE_URL = "https://chatrevive.onrender.com"

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
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
  return request('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyOtp(payload) {
  return request('/users/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resendOtp(payload) {
  return request('/users/resend-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload) {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function googleSignIn() {
  return request('/users/google-signin', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function getCurrentUser() {
  return request('/users/me')
}

export function logoutUser() {
  return request('/users/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
