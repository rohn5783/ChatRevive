import nodemailer from "nodemailer";

export const isEmailConfigured = () => {
  return Boolean(process.env.EMAIL_USER && (process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD));
};

export const sendOTPEmail = async ({ email, otp, fullName, expiresInMinutes = 10 }) => {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email configuration is missing");
    }
    return { skipped: true, reason: "Email configuration is missing" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD,
    },
  });

  const previewName = fullName?.trim() || "there";

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `ChatRevive <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your ChatRevive account",
      text: `Hi ${previewName}, your ChatRevive verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`,
      html: `
        <div style="margin:0;padding:24px;background:#075E54;font-family:Arial,sans-serif;color:#ffffff;">
          <div style="max-width:560px;margin:0 auto;padding:32px;border-radius:16px;background:#ffffff;color:#111B21;">
            <p style="color:#128C7E;letter-spacing:1px;text-transform:uppercase;font-size:12px;font-weight:bold;">ChatRevive</p>
            <h1 style="margin:8px 0 16px;font-size:24px;">Verify your account</h1>
            <p style="color:#667781;font-size:14px;line-height:1.6;">
              Hi ${previewName}, use the OTP below to complete your email verification and unlock 5 free uploads.
            </p>
            <div style="margin:24px 0;padding:16px;border-radius:12px;background:#F0F2F5;text-align:center;">
              <span style="font-size:32px;letter-spacing:8px;font-weight:700;color:#075E54;">${otp}</span>
            </div>
            <p style="color:#8696A0;font-size:12px;">
              This code expires in ${expiresInMinutes} minutes.
            </p>
          </div>
        </div>
      `,
    });
    return { skipped: false };
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return { skipped: true, reason: error.message };
  }
};

