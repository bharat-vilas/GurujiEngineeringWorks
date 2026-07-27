# Guruji Engineering Works — Business Management System

A full-stack business management web application for Guruji Engineering Works. Handles quotations, tax invoices, delivery challans, client management, employee records, attendance, and financials — all in one dashboard.

---

## Features

- **Quotations** — Generate and download professional quotation PDFs
- **Tax Invoices** — Create GST-compliant billing invoices with supply details
- **Delivery Challans** — Generate delivery challans with consignee/shipped-to support
- **Document Queue** — Track pending/completed documents; auto-clears checked items after 30 days
- **Client Management** — Register and manage clients with GSTIN, state, and pin code
- **Employee Management** — Full-time/part-time employee records with designation and salary
- **Attendance Tracking** — Monthly attendance with present/absent/half-day/leave statuses
- **Financials** — Income and expense tracking with category, payment mode, and monthly summaries
- **Email Integration** — Send documents via Gmail using Google OAuth2
- **Landing Page** — Public-facing company landing page with services and contact info

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS + shadcn/ui | Styling and components |
| React Router v7 | Routing |
| Framer Motion | Animations |
| html2pdf.js | PDF generation |
| dayjs | Date handling |
| Sonner | Toast notifications |
| Lucide React | Icons |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express 5 | Server framework |
| MongoDB + Mongoose | Database and ORM |
| JWT (access + refresh tokens) | Authentication |
| bcrypt | Password hashing |
| Google APIs (googleapis) | Gmail OAuth2 integration |
| dotenv | Environment configuration |
| Nodemon | Development auto-reload |

---

## Project Structure

```
GurujiEngineeringWorks/
├── Guruji/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/         # Login page
│   │   │   ├── landing/       # Public landing page
│   │   │   └── main-page/     # Main dashboard shell
│   │   ├── component/         # Feature components
│   │   ├── components/ui/     # Reusable UI (shadcn/ui)
│   │   ├── config/            # Company config
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # API client, auth, email utils
│   ├── public/                # Static assets (logo, images)
│   └── package.json
│
└── server/                    # Backend (Node.js + Express)
    ├── models/                # Mongoose schemas
    ├── routes/                # API route handlers
    ├── middleware/            # Auth middleware
    ├── utils/                 # DB connect, email service, JWT
    ├── server.js              # Express entry point
    └── package.json
```

---

## API Endpoints

| Group | Base Route | Description |
|---|---|---|
| Auth | `/api/auth` | Login, token refresh, logout |
| Clients | `/api/clients` | CRUD for client records |
| Employees | `/api/employees` | CRUD for employee records |
| Attendance | `/api/attendance` | Monthly attendance tracking |
| Transactions | `/api/transactions` | Income and expense records |
| Serial Numbers | `/api/serial-numbers` | Auto-incrementing document numbers |
| Document Queue | `/api/document-queue` | Pending/checked document tracking |
| Email | `/api/email` | Gmail OAuth2 send/inbox |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Cloud project (for Gmail OAuth2 — optional)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/GurujiEngineeringWorks.git
cd GurujiEngineeringWorks
```

### 2. Backend setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?ssl=true&...
MONGO_DB=guruji_dev
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:5000/oauth2callback
FRONTEND_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd Guruji
npm install
```

Create `Guruji/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start the dev server:
```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Deployment

### Frontend → Vercel
1. Import the GitHub repo on [vercel.com](https://vercel.com)
2. Set root directory to `Guruji/`
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com`

### Backend → Render
1. Create a new Web Service on [render.com](https://render.com)
2. Set root directory to `server/`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all env vars from `.env` in the Render dashboard — use `MONGO_DB=guruji_prod`

Every `git push` to `main` triggers an automatic redeploy on both platforms.

---

## Environment Variables Reference

| Variable | Used In | Description |
|---|---|---|
| `MONGO_URI` | Backend | MongoDB Atlas connection string |
| `MONGO_DB` | Backend | Database name (`guruji_dev` / `guruji_prod`) |
| `PORT` | Backend | Server port (default 5000) |
| `JWT_SECRET` | Backend | Access token signing secret |
| `JWT_REFRESH_SECRET` | Backend | Refresh token signing secret |
| `GOOGLE_CLIENT_ID` | Backend | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth2 client secret |
| `GOOGLE_REDIRECT_URL` | Backend | OAuth2 callback URL |
| `FRONTEND_URL` | Backend | Frontend URL for redirects |
| `VITE_API_URL` | Frontend | Backend API base URL |

---

## License

Private — Guruji Engineering Works. All rights reserved.
