import nodemailer from "nodemailer";

const getEmailConfig = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM || `ChatRevive <${emailUser}>`;

  return {
    emailUser,
    emailPass,
    emailFrom,
  };
};

export const isEmailConfigured = () => {
  const { emailUser, emailPass } = getEmailConfig();

  return Boolean(emailUser && emailPass);
};

const createTransporter = () => {
  const { emailUser, emailPass } = getEmailConfig();

  if (!isEmailConfigured()) {
    throw new Error("Email configuration is missing");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export const sendOTPEmail = async ({
  email,
  otp,
  fullName,
  expiresInMinutes = 10,
}) => {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email configuration is missing");
    }

    return {
      skipped: true,
      reason: "Email configuration is missing",
    };
  }

  const { emailFrom } = getEmailConfig();
  const transporter = createTransporter();
  const previewName = fullName?.trim() || "there";

  try {
    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: "Verify your ChatRevive account",
      text: `Hi ${previewName}, your ChatRevive verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`,
      html: `
        <div style="margin:0;padding:24px;background:#07111f;font-family:Arial,sans-serif;color:#f5f7ff;">
          <div style="max-width:560px;margin:0 auto;padding:32px;border-radius:24px;background:#0b1628;border:1px solid rgba(255,255,255,0.12);">
            <p style="margin:0 0 8px;color:#67e8f9;letter-spacing:2px;text-transform:uppercase;font-size:12px;">ChatRevive</p>
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;">Verify your account</h1>
            <p style="margin:0 0 18px;color:#c9d5ee;font-size:15px;line-height:1.6;">
              Hi ${previewName}, use the OTP below to complete your registration.
            </p>
            <div style="margin:24px 0;padding:18px 20px;border-radius:18px;background:#08101d;border:1px solid rgba(255,255,255,0.1);text-align:center;">
              <span style="display:block;font-size:32px;letter-spacing:10px;font-weight:700;color:#f5f7ff;">${otp}</span>
            </div>
            <p style="margin:0;color:#99a7c2;font-size:14px;line-height:1.6;">
              This code expires in ${expiresInMinutes} minutes. If you did not request this, you can ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    console.warn("OTP email delivery skipped in non-production:", error.message);

    return {
      skipped: true,
      reason: error.message,
    };
  }

  return {
    skipped: false,
  };
};
