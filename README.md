# 🛡️ HuntrNepal

> Nepal's responsible vulnerability disclosure and bug bounty platform.

HuntrNepal is a web-based vulnerability disclosure platform designed to connect security researchers with organizations in Nepal. It provides a secure environment for reporting vulnerabilities, managing coordinated disclosure, and rewarding ethical hackers while helping organizations strengthen their security posture.

---

## ✨ Features

### 👨‍💻 For Security Researchers
- Submit vulnerability reports securely
- Upload encrypted Proof-of-Concept (PoC) files
- Track report status in real time
- Receive recognition and rewards
- Manage personal researcher profile
- View submission history

### 🏢 For Organizations
- Create and manage vulnerability disclosure programs
- Receive and triage security reports
- Collaborate with researchers
- Assign report severity
- Manage rewards and acknowledgements
- Dashboard with security metrics

### 🔐 Security Features
- JWT Authentication
- Role-Based Access Control (RBAC)
- Password hashing using bcrypt
- Two-Factor Authentication (TOTP)
- Encrypted Proof-of-Concept storage
- Secure file upload validation
- Input sanitization
- Rate limiting
- CSRF protection
- HTTPS support

---

# 🏗️ Tech Stack

## Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS

## Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM

## Database
- MongoDB Atlas

## Authentication
- JWT
- HttpOnly Cookies
- bcrypt
- TOTP (2FA)

---

# 📂 Project Structure

```
HuntrNepal/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── public/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── prisma/
│   │   └── utils/
│   │
│   └── uploads/
│
└── README.md
```

---

# 🚀 Installation

## Clone the repository

```bash
git clone https://github.com/yourusername/huntrnepal.git
```

```bash
cd huntrnepal
```

---

## Backend

Install dependencies

```bash
cd backend
npm install
```

Create a `.env` file.

Example:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d

EMAIL_USER=
EMAIL_PASS=

ENCRYPTION_KEY=

PORT=5000
```

Generate Prisma Client

```bash
npx prisma generate
```

Push schema

```bash
npx prisma db push
```

Run development server

```bash
npm run dev
```

---

## Frontend

```bash
cd frontend
npm install
```

Run

```bash
npm run dev
```

The frontend will be available at

```
http://localhost:3000
```

Backend

```
http://localhost:5000
```

---

# 🔄 User Workflow

```
Researcher
     │
     ▼
Submit Vulnerability
     │
     ▼
Organization Reviews Report
     │
     ▼
Triaging
     │
     ▼
Communication
     │
     ▼
Fix Verified
     │
     ▼
Reward & Recognition
```

---

# 🔒 Security Architecture

- JWT Authentication
- HttpOnly Cookies
- Role-Based Authorization
- bcrypt Password Hashing
- TOTP Multi-Factor Authentication
- Encrypted PoC Storage
- Secure File Upload Validation
- Rate Limiting
- Input Validation
- XSS Protection
- CSRF Protection

---

# 📈 Future Improvements

- Integrated Bug Bounty Payments
- CVSS Calculator
- Public Hall of Fame
- Automated Vulnerability Classification
- AI-assisted Report Analysis
- Mobile Application
- Security Researcher Reputation System
- Public Program Directory

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Authors

Developed as a cybersecurity research project to promote responsible vulnerability disclosure and improve cybersecurity practices within Nepal.

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
