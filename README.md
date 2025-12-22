# Team Task Board

Local setup guide for running the full stack (frontend + backend) and seeding demo data.

## Requirements

- Node.js 18+ (npm included)
- MongoDB connection string
- Firebase project (client + admin service account)

## Project Structure

- `frontend/` Vite + Vue app
- `backend/` Express + Prisma (MongoDB)
- `backend/prisma/schema.prisma` Prisma schema

## Installation

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Configuration

### Backend (`backend/.env`)

Set at minimum:

```
DATABASE_URL="mongodb+srv://USER:PASS@HOST/DBNAME"
```

Optional demo overrides:

```
DEMO_EMAIL="demo@taskflow.dev"
DEMO_PASSWORD="Demo123!"
DEMO_NAME="Demo User"
DEMO_WORKSPACE="Demo Workspace"
DEMO_BOARD="Demo Board"
```

Firebase Admin:

- Place your service account JSON at `backend/src/config/firebaseServiceKey.json`.
- The backend uses this file to verify tokens and create admin tasks.

### Frontend (`frontend/.env`)

Required:

```
VITE_FIREBASE_VAPID_KEY=YOUR_FIREBASE_VAPID_KEY
```

Optional:

```
VITE_API_URL=http://localhost:5000
VITE_DEMO_EMAIL=demo@taskflow.dev
VITE_DEMO_PASSWORD=Demo123!
VITE_DEMO_NAME="Demo User"
VITE_DEMO_WORKSPACE="Demo Workspace"
VITE_DEMO_BOARD="Demo Board"
```

## Prisma (MongoDB)

MongoDB uses `prisma db push` (no SQL migrations).

```bash
cd backend
npm run db:push
```

## Seeding Demo Data

This creates one demo workspace, one board, and sample tasks.

```bash
cd backend
npm run db:seed
# or
npm run db:seed:demo
```

## Running the Project

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Demo Login

Use the Demo button on the auth screen (top-right). It signs in with the demo
credentials and ensures a demo workspace/board/tasks exist.
