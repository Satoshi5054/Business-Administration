# 🏢 Business Administration Platform

A complete business management system for employees and managers. Request leaves, schedule meetings, track payments, manage projects, and maintain employee profiles — all in one integrated platform.

**Stack:** Next.js (App Router) • Prisma ORM • PostgreSQL • JWT Auth • TypeScript

---

## 📋 What's This About?

A **role-based dashboard system** where:
- **Employees** request leaves, view meetings, check schedules, manage profiles
- **Managers** approve leaves, create meetings, track payments, oversee projects

## ✨ Key Features

- 🔐 **JWT Authentication** — Secure token-based login & protected API routes
- 📋 **Leave Management** — Request, approve/reject, track balances
- 📅 **Meeting Scheduler** — Schedule meetings with participants & calendar views
- 💳 **Payment Tracking** — Record & monitor employee payments
- 🎯 **Project Management** — Create, assign & track projects
- 👤 **Employee Profiles** — Centralized employee information & updates
- 📊 **Role-Based Dashboards** — Different interfaces for employees vs managers

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | Next.js (App Router) + React + TypeScript |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL with Prisma ORM |
| **Auth** | JWT (JSON Web Tokens) |
| **Hosting** | Vercel (recommended) |

## 📁 Key Project Structure

```
src/
├── app/                          # Pages & API routes
│   ├── api/                      # Backend endpoints
│   │   ├── auth/                 # Login, register, logout
│   │   └── protected/            # JWT-protected routes
│   └── v1/                       # Versioned routes
│
├── components/                   # React UI components
│   ├── auth/                     # Login/Register forms
│   ├── dashboard/                # Dashboard stats & cards
│   ├── meeting/                  # Meeting calendar & popups
│   └── layout/                   # Sidebar, navbar
│
├── controllers/                  # Business logic
│   ├── leave.controller.ts
│   ├── meeting.controller.ts
│   ├── payment.controller.ts
│   └── project.controller.ts
│
├── lib/                          # Utilities
│   ├── prisma.ts                 # Database client
│   ├── jwt.ts                    # Token generation
│   └── server-auth.ts            # Auth helpers
│
├── middlewares/                  # Request validation
│   └── auth.ts                   # JWT verification
│
└── scripts/                      # Database seeding
    ├── leaveDummyData.ts
    └── paymentDummyData.ts

prisma/
├── schema.prisma                 # Database schema
└── migrations/                   # Migration history
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** & **npm**
- **PostgreSQL** (local or cloud: Supabase, Neon, Railway)

### Setup in 5 Steps

**1. Clone & Install**
```bash
git clone <repo-url>
cd company
npm install
```

**2. Configure Environment**
```bash
cp .env.example .env
```
Edit `.env` and add:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_secret_key_here
PAYMENT_SECRET=your_payment_secret
```

**3. Setup Database**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**4. Seed Test Data (optional)**
```bash
npx ts-node src/scripts/leaveDummyData.ts
npx ts-node src/scripts/paymentDummyData.ts
```

**5. Start Development Server**
```bash
npm run dev
```
Visit `http://localhost:3000` — register as employee or manager to test!

---

## 📚 Common Commands

```bash
npm run dev              # Development server with hot reload
npm run build            # Production build
npm run start            # Run production server
npm run lint             # Check code quality
npx prisma studio       # Open Prisma database UI
npx prisma migrate dev  # Create new migration
npx prisma migrate reset # Reset database (⚠️ deletes data)
```

---

## 🔐 How Authentication Works

1. User logs in with email & password
2. Server validates & creates a JWT token
3. Token stored in browser (localStorage/cookie)
4. Each API request includes token in header
5. Server verifies token & processes request

Protected routes automatically reject requests without valid tokens.

---

## 📤 Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables in Project Settings
4. Set build command to `npm run vercel-build`
5. Deploy

Database must be publicly accessible or use managed PostgreSQL services.


```
User
├── id (primary key)
├── email
├── password
├── role (employee, manager, admin)
└── profile (relationship to Profile)

Profile
├── id
├── firstName, lastName
├── department
└── userId (foreign key)

Leave
├── id
├── employeeId (who requested)
├── startDate, endDate
├── reason
├── status (pending, approved, rejected)
└── approvedBy (manager who approved)

Meeting
├── id
├── title, description
├── startTime, endTime
├── createdBy (organizer)
└── participants (many-to-many relationship)

Payment
├── id
├── employeeId
├── amount
├── date
└── status

Project
├── id
├── name, description
├── status
└── assignees (many-to-many relationship)
```

## 🔌 API Routes & Authentication

### Route Organization

```
src/app/
├── api/                    # API endpoints
│   ├── auth/              # Authentication
│   │   ├── login          # POST - User login
│   │   ├── logout         # POST - User logout
│   │   ├── register-employee    # POST - Register as employee
│   │   ├── register-manager     # POST - Register as manager
│   │   └── me             # GET - Current user info
│   └── protected/         # Requires JWT token
│       ├── employees/     # Manage employees
│       ├── leave/         # Leave requests
│       ├── meetings/      # Meetings
│       ├── payments/      # Payments
│       ├── projects/      # Projects
│       └── profile/       # User profiles
│
└── v1/                    # Versioned API (for stability)
    ├── auth/              # V1 auth endpoints
    ├── employees/         # V1 employee routes
    ├── manager/           # V1 manager routes
    └── profile/           # V1 profile routes
```

### How Authentication Works

#### 1. **User Registration/Login**

**Register a new employee:**
```bash
POST /api/auth/register-employee
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "SecurePass123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@company.com",
    "role": "employee"
  }
}
```

#### 2. **Using the Token**

Store the token in your browser (localStorage or cookie), then include it in all future requests:

```bash
GET /api/protected/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server validates the token and responds with your profile data
```

#### 3. **Token Validation**

- Tokens are validated using the secret in `JWT_SECRET` env var
- If the token is invalid or expired, the request returns **401 Unauthorized**
- All routes under `/api/protected/` require a valid token

### Code Locations

| Functionality | File Location |
|---|---|
| 🔐 JWT token creation & validation | [src/lib/jwt.ts](src/lib/jwt.ts) |
| 🛡️ Auth middleware (checks tokens) | [src/middlewares/auth.ts](src/middlewares/auth.ts) |
| 👤 Server-side auth helpers | [src/lib/server-auth.ts](src/lib/server-auth.ts) |
| 📝 Leave request API | [src/controllers/leave.controller.ts](src/controllers/leave.controller.ts) |
| 📅 Meeting API | [src/controllers/meeting.controller.ts](src/controllers/meeting.controller.ts) |
| 💳 Payment API | [src/controllers/payment.controller.ts](src/controllers/payment.controller.ts) |
| 📊 Project API | [src/controllers/project.controller.ts](src/controllers/project.controller.ts) |

### Testing the API with cURL

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/api/auth/register-employee \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123",
    "firstName": "Test",
    "lastName": "User"
  }'

# 2. Login (get token)
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}' \
  | jq -r '.token')

# 3. Use the token to access protected routes
curl -X GET http://localhost:3000/api/protected/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Deployment (Vercel)

1. Push the repo to GitHub and import it in Vercel as a new project.
2. In **Project Settings → Environment Variables**, add `DATABASE_URL`, `JWT_SECRET`, and `PAYMENT_SECRET`.
3. In **Build & Development Settings**, set the build command to:
   ```
   npm run vercel-build
   ```
   Leave the output directory as default.
4. Deploy. The `vercel-build` script handles Prisma client generation, migrations, and the Next.js build in one step.

> **Note:** Your PostgreSQL database must be publicly reachable from Vercel. If using a managed provider (Supabase, Neon, Railway, etc.), enable SSL and include `?sslmode=require` in `DATABASE_URL`.
