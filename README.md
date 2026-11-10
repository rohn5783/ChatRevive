# ChatRevive 🟢

> **WhatsApp Chat Archiver & Viewer** built with **Next.js 15 App Router**, styled with authentic WhatsApp color themes, **Razorpay** payment integration, and a **5 free chat uploads** quota system.

🌐 **Live app:** [chat-revive-seven.vercel.app](https://chat-revive-seven.vercel.app/)

---

## 🚀 Features

- **Authentic WhatsApp Web Interface**:
  - Two-pane layout: chat conversation list on the left, interactive chat viewer on the right.
  - Authentic WhatsApp colors (`#075E54`, `#128C7E`, `#25D366`, `#D9FDD3`, `#FFFFFF`, `#EFEAE2`).
  - WhatsApp doodle wallpaper background, authentic speech bubble tails, and double blue ticks (`✓✓`).
  - Media support: audio voice note player, image lightbox previews, and document attachment cards.
  - In-chat full-text search and sender filtering.

- **5 Free Uploads Quota System**:
  - Every new account gets **5 free chat export uploads** automatically.
  - Real-time quota indicator in navigation bar (`2/5 Free Uploads` or `PRO UNLIMITED`).
  - On the 6th upload attempt, access is blocked and the user is prompted to upgrade to Pro Unlimited.

- **Razorpay Payment Integration**:
  - **Razorpay**: UPI (Google Pay, PhonePe, Paytm), Net Banking, RuPay, and Cards (₹499 INR one-time).
  - **Cryptographic Signature Verification**: HMAC SHA-256 signature verification protects every transaction.
  - **Zero-Friction Test Mode**: Instant test activation mode included for development and evaluation without live bank credentials.

- **Full Next.js 15 Architecture**:
  - Unified frontend and backend in one Next.js App Router codebase.
  - API Routes: `/api/chats/upload`, `/api/payment/*`, `/api/users/*`.
  - MongoDB stores user accounts, verified payment details, chat imports, conversations, and parsed messages (not the original uploaded text file).
  - API requests that need persistent data require a working MongoDB connection; they do not silently fall back to local JSON files.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, Tailwind CSS, Lucide React, Framer Motion
- **Backend & APIs**: Next.js Server Components & Route Handlers
- **Authentication**: JWT Cookies & Bearer Tokens, Bcrypt password hashing
- **Payments**: Razorpay Node SDK (₹499 INR)
- **Testing**: Native Node.js Test Runner

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20 & 24)
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/your-username/chatrevive.git
cd chatrevive
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set `MONGODB_URI` to your MongoDB Atlas connection string and replace the demo JWT and payment secrets with your own values. Google sign-in is not configured. Keep `.env` private and never commit it.

Existing local user records in `data/users.json` are not moved automatically. After configuring a secure MongoDB URI, run `npm run migrate:local-users` to copy them into MongoDB without replacing existing accounts. The JSON file is left untouched.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

ChatRevive includes a comprehensive test suite covering WhatsApp parsing, validations, user authentication, 5-upload quota enforcement, Razorpay payments, and full E2E user lifecycle.

Run all 42 tests:
```bash
npm test
```

### Test Coverage Highlights:
- **WhatsApp Parser**: Android 12h/24h, iOS bracket formats, audio voice notes, attached filenames, omitted media, multi-line chats, emojis.
- **Validation**: Registration, login, OTP verification, edge cases.
- **Quota & Uploads**: 5 free uploads limit enforcement, 6th upload blocked with 403 `paymentRequired`, multi-user isolation.
- **Razorpay**: Order creation in paise, cryptographic HMAC SHA-256 signature verification, rejection of tampered signatures.
- **E2E Lifecycle**: Registration → 5 free uploads → 6th blocked → Razorpay unlock → unlimited Pro uploads.

---

## 🏗️ Production Build

```bash
npm run build
npm start
```
Compiles static and dynamic routes with zero warnings or errors.

---

## 📄 License
MIT License. Free to use and customize.
