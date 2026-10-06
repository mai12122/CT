# 🎤 Concert Event Management App

A full-stack mobile concert ticketing app built with **React Native (Expo + NativeWind)** and a **Node.js + Express + TypeScript + Prisma + PostgreSQL** backend.

---

## ⚡ Teammate Quick Start Guide

Follow these simple steps after cloning the repository to get the app running on your machine.

---

### Step 1: Install Dependencies
Open your terminal in the cloned project folder and run:

```bash
npm install --legacy-peer-deps
```

---

### Step 2: Configure Environment (`.env`)
Create a `.env` file in the root of the project (if not already present) and configure your local "
```

> 💡 **Note**: Replace `your_password` with your actual local PostgreSQL password.

---

### Step 3: Setup & Seed Database
Ensure PostgreSQL is running, then run these two commands to sync the database schema and populate initial concert data:

```bash
npx prisma db push
npm run db:seed
```

---

### Step 4: Run the App (Single Command!)
Start both the **backend API server** and the **Expo mobile app** concurrently with one command:

```bash
npm start # for backend
```
```bash
# new powershell
npx expo start 
```

Once running in your terminal:
* **Web Browser**: Press <kbd>w</kbd> to open the app directly in your web browser.
* **Physical Phone**: Open the **Expo Go** app (available on iOS App Store & Android Play Store) and scan the QR code displayed in the terminal.
* **Android Emulator**: Press <kbd>a</kbd>.
* **iOS Simulator**: Press <kbd>i</kbd>.

---

## 🔑 Demo Login Credentials

You can use the seeded test user to test ticket booking immediately:

* **Email**: `user@example.com`
* **Password**: `password123`
*(There is also an **"Auto-fill Demo Account"** button directly on the Login screen for 1-tap sign in).*

---

## 🛠️ Common Commands

| Command | What it does |
|---|---|
| `npm start` | **Starts both backend API and Expo app together** |
| `npm run db:seed` | Re-seeds the database with fresh concerts and tickets |
| `npx tsc --noEmit` | Checks for TypeScript errors |
| `npx expo lint` | Runs ESLint |

---

## ❓ Troubleshooting

### Port 5000 is already in use (`EADDRINUSE: 5000`):
Because `npm start` automatically starts the backend server, make sure you don't have another instance running in a separate terminal. If port 5000 is stuck:

* **Windows (PowerShell)**:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
* **macOS / Linux**:
  ```bash
  kill -9 $(lsof -t -i:5000)
  ```

---

## 🏛️ AWS Architecture Explained — The Gated Concert Venue Analogy

| Application | Stack | Database |
| :--- | :--- | :--- |
| **Concert Ticketing System** | **Node.js + Express + Prisma** | **Multi-AZ RDS PostgreSQL** |

### The Analogy Mapping Table

| AWS Component | Concert Hall Analogy | What it Actually Does in Your App |
| :--- | :--- | :--- |
| **VPC (`ct-live-vpc`)** | **The Venue Perimeter** | High fence keeping all app servers and databases together in an isolated secure virtual network. |
| **Public Subnet** | **Front Gate / Parking Lot** | The only public area where fans arrive; hosts the internet-facing Load Balancer. |
| **Private App Subnet** | **Backstage Staff Rooms** | Restricted area housing Node.js EC2 servers; fans cannot access these directly. |
| **Private DB Subnet** | **The Vault / Cash Register** | Super-secure zone deep inside holding RDS PostgreSQL so raw data is protected. |
| **Application Load Balancer** | **Security at Entrance** | Checks incoming user traffic and balances requests evenly across active ticket booths. |
| **Target Group (`app-tg`)** | **Open Ticket Booths** | The list of active, healthy EC2 instances (port 5000) ready to take ticket requests. |
| **Launch Template** | **Standard Setup Blueprint** | The exact checklist/spec used whenever launching a new EC2 instance. |
| **UserData Script** | **Morning Automated Checklist** | Boot script that clones `mai12122/CT`, sets env vars, runs `prisma db push`, and starts PM2. |
| **Auto Scaling Group** | **On-Call Staff Manager** | Opens extra EC2 servers when lines get long (Sale Rush) and closes them when traffic cools. |

