# 🎓 Blockchain-Backed, AI-Powered Identity Verification System for Online Examinations

> **Academic Capstone Project — Group 14**  
> An enterprise-grade, multi-role identity verification monorepo ensuring academic integrity for online examinations. Features real-time AI liveness detection, biometric facial matching, immutable Polygon blockchain audit trails, and unified role-based portals for students, verifiers, and administrators.

---

## 🏛️ System Architecture

The project is structured as a single unified monorepo containing all backend services, smart contracts, AI engines, and a unified React frontend:

```text
capstone-project/
├── backend/                  # Node.js + Express REST API Gateway (Port 5000)
│   ├── src/                  # Controllers, routes, services & middleware
│   ├── scripts/              # Seed scripts (seedExams, createAdmin, seedVerifier)
│   └── package.json
├── frontend/                 # Unified Vite + React 19 Frontend (Port 5173)
│   ├── src/
│   │   ├── components/       # Common, Admin, Student, and Verifier components
│   │   ├── context/          # Role-based AuthContext, AdminDataContext, ProfileContext
│   │   ├── layouts/          # StudentLayout, AdminLayout, VerifierLayout
│   │   ├── pages/            # Role-scoped pages (/student, /verifier, /admin, /auth)
│   │   ├── routes/           # Role-based ProtectedRoute & PublicOnlyRoute
│   │   ├── styles/           # Scoped styling (admin.css, verifier.css, Tailwind)
│   │   └── firebase/         # Client Firebase configuration (Auth, RTDB, Firestore)
│   ├── .env                  # Unified frontend environment variables
│   └── package.json
├── ai-service/               # Python Flask Microservice for Biometrics (Port 5001)
│   ├── venv/                 # Python virtual environment
│   ├── app.py                # Biometric API endpoints (/match-faces, /check-liveness)
│   ├── face_match.py         # Facial similarity comparison
│   ├── liveness.py           # Blink and motion anti-spoofing verification
│   └── requirements.txt
├── contracts/                # Solidity Smart Contracts
│   └── IdentityVerification.sol # On-chain verification proof ledger (Polygon network)
└── package.json              # Monorepo root dev runner (concurrently)
```

---

## 📸 System Screenshots

### 1. Unified Authentication & Role-Based Sign In (`/login`)
A single, clean entry point allowing Students, Verifiers, and Administrators to sign in with dynamic role switching, official Google OAuth for students, and university domain enforcement (`@ms.sab.ac.lk`) for administrative personnel.

![Unified Role-Based Sign In](docs/screenshots/01-unified-login.png)

---

### 2. Student Portal Dashboard (`/student`)
Overview dashboard displaying the student's profile, real-time identity verification status, enrolled exams, upcoming schedules, and recent activity logs.

![Student Portal Dashboard](docs/screenshots/02-student-dashboard.png)

---

### 3. Available Exams & Real-Time Enrollment (`/student/available`)
Course schedule directory allowing students to browse proctored exams, check duration and seat capacities, and proceed directly to pre-exam identity verification.

![Available Exams](docs/screenshots/03-available-exams.jpg)

---

### 4. Step-by-Step Identity Verification Flow (`/student/verification`)
Guided 5-step verification process: National ID/Passport upload, live webcam selfie capture, interactive liveness detection (anti-spoofing), AI facial matching, and blockchain ledger confirmation.

![Identity Verification Flow](docs/screenshots/04-identity-verification.png)

---

## ✨ Key Features & Role Portals

### 1. 👩‍🎓 Student Portal (`/student/*`)
* **Student Onboarding:** Email verification with global 6-digit OTP delivery (via Nodemailer) and official Google OAuth single sign-on.
* **Exam Management:** Browse upcoming university exams, view syllabus schedules, and register with real-time seat availability tracking.
* **Pre-Exam Identity Verification (`/student/verification`):**
  - **Step 1:** Upload National Identity Card (NIC) or passport document.
  - **Step 2:** Capture a high-resolution live webcam selfie.
  - **Step 3:** Interactive AI liveness detection (anti-spoofing challenge).
  - **Step 4:** Instant AI face-match and validation against government ID credentials.
* **Student Dashboard:** Real-time exam status, enrollment verification records, and profile customization.

### 2. 👁️ Identity Verifier Portal (`/verifier/*`)
* **Live Pending Queue (`/verifier/queue`):** Real-time list of student submissions requiring review.
* **Side-by-Side Comparison:** Interactive inspection view comparing uploaded ID documents with live selfie captures.
* **One-Click Decisions:** Approve or reject with structured reasons; automatically creates verifiable Polygon blockchain transaction hashes.
* **Audit History (`/verifier/history`):** Complete log of processed students with direct PolygonScan ledger links.
* **System Alerts & Staff Profile:** Operational notifications, verification accuracy analytics, and daily performance metrics.

### 3. 👨‍💼 Administrator Dashboard (`/admin/*`)
* **Dashboard Overview (`/admin/dashboard`):** Real-time system health, Polygon MATIC gas balance alerts, average AI inference latency, and pending verification counts.
* **User Management (`/admin/users`):** Comprehensive student directory with search by name/NIC/email, status overrides (Verified/Pending/Rejected), and record management.
* **Verifier Management (`/admin/verifiers`):** Add, update, or revoke access credentials for verification staff.
* **Exam Management (`/admin/exams`):** Create, update, and manage exams, course codes, schedules, and proctoring parameters.
* **Audit Logs (`/admin/audit`):** Complete audit trail with advanced filtering and one-click **jsPDF** export.
* **Blockchain Monitor (`/admin/blockchain`):** Live Polygon gas price tracker, transaction history, and smart contract registry details.
* **Settings & Security (`/admin/settings`):** Configurable alert thresholds, 2FA toggles, session controls, and RPC endpoints.

### 4. 🔐 Unified Authentication & Role-Based Access Control
* **Single Entrance Point (`/login`):** Modern unified login screen with dynamic role selector tabs (`Student`, `Verifier`, `Admin`).
* **Domain Security:** Admin portal strictly validates authorized university domains (`@ms.sab.ac.lk`).
* **Route Protection:** Custom `ProtectedRoute` and `PublicOnlyRoute` redirect users to their respective portals based on their active JWT session and role.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, Lucide React, jsPDF, jspdf-autotable |
| **Backend API** | Node.js, Express.js, Firebase Admin SDK, JWT, Nodemailer, Cloudinary |
| **Database** | Firebase Firestore (NoSQL) & Firebase Realtime Database |
| **AI Biometrics** | Python 3.13, Flask, DeepFace, OpenCV, MediaPipe |
| **Blockchain** | Solidity, Ethers.js, Polygon Mainnet / Amoy Testnet |
| **Orchestration** | Monorepo root scripts with `concurrently` |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **Python:** v3.9 or higher (Python 3.13 tested)
* **Firebase Project:** Firestore, Realtime Database, Authentication, and Storage enabled

---

### 1. Installation

From the `capstone-project` root directory:

```bash
# 1. Install root monorepo dependencies (concurrently)
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Install frontend dependencies
cd frontend && npm install && cd ..
```

---

### 2. Environment Variables Configuration

#### A. Backend Configuration (`backend/.env`)
Create `backend/.env` with the following variables:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
AI_SERVICE_URL=http://localhost:5001

# Nodemailer OTP Delivery
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password

# Cloudinary (Optional, for document image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Blockchain Configuration (Polygon)
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f6bEb1
```
> **Note:** Place your Firebase service account key in `backend/serviceAccountKey.json`.

#### B. Frontend Configuration (`frontend/.env`)
The unified frontend uses `frontend/.env`:
```env
# Backend API Configuration
VITE_API_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_HOST=localhost
VITE_BACKEND_PORT=5000

# Application Details
VITE_APP_NAME=University Blockchain Identity System
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
VITE_ENABLE_DEBUG_MODE=true

# AI Service Configuration
VITE_AI_SERVICE_URL=http://localhost:5001

# Firebase Client Configuration
VITE_FIREBASE_API_KEY=AIzaSyAkdSbDiamWSQeZQU7g3RsoyZiqwN-74GA
VITE_FIREBASE_AUTH_DOMAIN=identity-verification-sy-dd573.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=identity-verification-sy-dd573
VITE_FIREBASE_STORAGE_BUCKET=identity-verification-sy-dd573.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1008215164215
VITE_FIREBASE_APP_ID=1:1008215164215:web:20ffadf8ac74c9869646b2
VITE_FIREBASE_DATABASE_URL=https://identity-verification-sy-dd573-default-rtdb.asia-southeast1.firebasedatabase.app

# Blockchain Configuration
VITE_BLOCKCHAIN_NETWORK=polygon
VITE_BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
```

#### C. AI Service Setup (`ai-service/`)
```bash
cd ai-service
# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install required Python packages
pip install -r requirements.txt
cd ..
```

---

## 💻 Running the Application

You can start the entire stack using the root monorepo scripts:

### Option 1: Start All 3 Services Together (Frontend + Backend + AI Service)
```bash
npm run dev:all
```
*Starts Node.js Backend (`:5000`), Vite Frontend (`:5173`), and Python AI Service (`:5001`) concurrently with labeled, color-coded terminal output.*

---

### Option 2: Start Backend & Frontend Together (Default)
```bash
npm run dev
```
*Starts the Express backend on port `5000` and the Vite React app on port `5173`.*

---

### Option 3: Run Services Individually (Separate Terminals)

* **Frontend Only (Port 5173):**
  ```bash
  npm run dev:frontend
  # or: cd frontend && npm run dev
  ```

* **Backend Only (Port 5000):**
  ```bash
  npm run dev:backend
  # or: cd backend && npm run dev
  ```

* **AI Service Only (Port 5001):**
  ```bash
  npm run dev:ai
  # or: cd ai-service && .\venv\Scripts\python.exe app.py
  ```

* **Build Frontend for Production:**
  ```bash
  npm run build
  # or: cd frontend && npm run build
  ```

---

## 🌐 Application Routing Guide

Access the web portal at **`http://localhost:5173`**:

| Route | Role / Access | Description |
| :--- | :--- | :--- |
| `/login` | Public | Unified login with role tabs (`Student`, `Verifier`, `Admin`) |
| `/register` | Public | Student self-registration with OTP email confirmation |
| `/student` | Student | Student examination dashboard and upcoming tests |
| `/student/available` | Student | Browse and enroll in available university exams |
| `/student/my-exams` | Student | List of enrolled exams and identity approval statuses |
| `/student/verification` | Student | Step-by-step identity verification (ID upload + Live selfie + Liveness) |
| `/student/activity` | Student | Student verification activity and log trail |
| `/verifier/queue` | Verifier | Staff verification queue for live student submissions |
| `/verifier/history` | Verifier | Historical verification decisions with on-chain proofs |
| `/verifier/alerts` | Verifier | Operational alerts, image review notices, and queue status |
| `/verifier/profile` | Verifier | Verifier accuracy metrics and staff profile |
| `/admin/dashboard` | Admin | System overview, Polygon gas balance, and active vitals |
| `/admin/users` | Admin | Student management, verification status changes, and deletion |
| `/admin/verifiers` | Admin | Verification staff management and account creation |
| `/admin/audit` | Admin | Compliance audit logs with exportable PDF reports |
| `/admin/exams` | Admin | Exam creation, scheduling, and capacity controls |
| `/admin/blockchain` | Admin | Smart contract status, gas analytics, and on-chain explorer |
| `/admin/settings` | Admin | System configuration, alert preferences, and API credentials |

---

## 👥 Project Contributors

**Group 14 — University Capstone Project:**
* **Dinsanda Amajith** *(@DARajapaksha)*
* **Hashen Dilshan** *(@dilacode007)*
* **Janidu Viduranga**
* **Anoj Subodha Mohotti** *(@subodha78)*
* **Wathsala Indeevari** *(@WathsalaIndeevari)*

---

## 📄 License
This project is developed for educational and research purposes as an academic capstone project.
