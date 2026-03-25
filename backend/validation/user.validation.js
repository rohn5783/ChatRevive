const sendValidationError = (res, message) =>
  res.status(400).json({
    success: false,
    message,
  });

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateRegister = (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return sendValidationError(
      res,
      "fullName, email and password are required"
    );
  }

  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    return sendValidationError(
      res,
      "fullName must be at least 2 characters long"
    );
  }

  if (typeof email !== "string" || !isValidEmail(email.trim().toLowerCase())) {
    return sendValidationError(res, "Please provide a valid email");
  }

  if (typeof password !== "string" || password.length < 6) {
    return sendValidationError(
      res,
      "password must be at least 6 characters long"
    );
  }

  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendValidationError(res, "email and password are required");
  }

  if (typeof email !== "string" || !isValidEmail(email.trim().toLowerCase())) {
    return sendValidationError(res, "Please provide a valid email");
  }

  if (typeof password !== "string" || password.length < 6) {
    return sendValidationError(
      res,
      "password must be at least 6 characters long"
    );
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

export const validateEmailOTPVerification = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return sendValidationError(res, "email and otp are required");
  }

  if (typeof email !== "string" || !isValidEmail(email.trim().toLowerCase())) {
    return sendValidationError(res, "Please provide a valid email");
  }

  if (typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
    return sendValidationError(res, "otp must be a 6 digit code");
  }

  req.body.email = email.trim().toLowerCase();
  req.body.otp = otp.trim();

  next();
};

export const validateEmailOnly = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return sendValidationError(res, "email is required");
  }

  if (typeof email !== "string" || !isValidEmail(email.trim().toLowerCase())) {
    return sendValidationError(res, "Please provide a valid email");
  }

  req.body.email = email.trim().toLowerCase();

  next();
};
