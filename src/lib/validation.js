const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

export function validateEmail(email) {
  if (typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

export function validateRegisterInput({ fullName, email, password }) {
  const errors = [];

  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters");
  }

  if (!validateEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (typeof password !== "string" || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLoginInput({ email, password }) {
  const errors = [];

  if (!validateEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (typeof password !== "string" || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateOTPInput({ email, otp }) {
  const errors = [];

  if (!validateEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (typeof otp !== "string" || !OTP_REGEX.test(otp.trim())) {
    errors.push("OTP must be exactly 6 digits");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

