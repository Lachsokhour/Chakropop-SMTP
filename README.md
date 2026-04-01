# ✉️ Chakropop SMTP (ចក្រភព SMTP)

A professional, privacy-first SMTP email client with a **real Node.js backend** that actually tests connections and sends emails via nodemailer. Recently overhauled with a **Premium UI** and a **Dual-Theme Engine**.

---

## 🎨 Premium Experience
Chakropop SMTP has been redesigned from the ground up for a world-class user experience:
- **Dual-Theme Engine:** Seamlessly switch between a rich, deep **Dark Mode** and a crisp, clean **Light Mode**. Your preference is saved locally.
- **Modern Typography:** Standardized on **Inter** for superior legibility and **JetBrains Mono** for technical data.
- **Glassmorphism & Depth:** Optimized with backdrop blurs, layered shadows, and high-quality transitions for a premium "app" feel.
- **Refined Components:** Every button, input, and card has been polished for balance and clarity.

---

## 🇰🇭 Native Khmer Support
Designed with a premium Khmer experience in mind:
- **Kantumruy Pro Typography:** Integrated modern Khmer typography for beautiful, legible text across all interfaces.
- **Localized Privacy:** Dedicated Khmer section for "Privacy & Trust" (ឯកជនភាព និង ទំនុកចិត្ត).
- **Hybrid Interface:** Optimized for both English and Khmer technical workflows.

---

## 🔒 Privacy Commitment
Built with a **zero-tracking** and local-first philosophy: 
- **No Data Retention:** We do not store, collect, or log your email content or SMTP credentials on our servers.
- **Client-Side Storage:** All your SMTP configurations are stored exclusively in your browser's `localStorage`.
- **Direct SMTP Relay:** Your backend acts as a direct relay to your SMTP provider; nothing is cached or analyzed.
- **Open Transparency:** Fully open-source codebase for auditability and trust.

---

## 🚀 Deployment

### Vercel (Official Support)
Chakropop SMTP is ready for one-click deployment on Vercel:
1.  **Install Vercel CLI:** `npm i -g vercel`
2.  **Deploy:** Run `vercel` in the project root.
3.  **Production:** Run `vercel --prod`.

The project includes a `vercel.json` and a serverless-optimized `server.js` for seamless hosting.

---

## Local Setup

### Requirements
- Node.js 16+

### Install & Run
```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

Then open: **http://localhost:3500**

---

## Main Features

### ⚙ SMTP Dynamic Config
- **Real-time Verification:** Calls the backend for a real `transporter.verify()` check to debug connection issues instantly.
- **Wide Compatibility:** Support for SSL/TLS, STARTTLS, and Plain connections.
- **Advanced Auth:** Support for PLAIN, LOGIN, and OAuth mechanisms.

### ✏ Professional Composer
- **Adaptive Rich Text Editor:** Completely redesigned toolbar that ensures high contrast and clarity in both themes.
- **Recipient Management:** Smart chip-based input for To, CC, and BCC.
- **Attachments:** Seamless support for sending files via Base64 encoding.

### 📋 Live Delivery Log
- **Detailed Auditing:** Monitor real-time SMTP handshakes and server responses with polished status badges.
- **Status Tracking:** Color-coded entries for SUCCESS, FAIL, INFO, and WARNING.

---

## Gmail Setup

1. Enable 2-Step Verification on your Google account.
2. Go to Google Account → Security → App Passwords.
3. Generate a password for "Mail".
4. Use that 16-char password in **Chakropop SMTP**.

| Field | Value |
|---|---|
| Host | smtp.gmail.com |
| Port | 587 |
| Encryption | STARTTLS |
| Username | your@gmail.com |
| Password | 16-char App Password |

---

## API Endpoints

### POST /api/test
Tests SMTP connection with nodemailer `verify()`.

### POST /api/send
Sends an email using the provided SMTP and Mail configuration.
