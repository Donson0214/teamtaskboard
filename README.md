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

Cloudinary (attachments):

```
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Brevo (email notifications):

```
BREVO_API_KEY=YOUR_BREVO_API_KEY
BREVO_SENDER_EMAIL=YOUR_SENDER_EMAIL
BREVO_SENDER_NAME=YOUR_SENDER_NAME
```

### Frontend (`frontend/.env`)

Required:

```
VITE_FIREBASE_VAPID_KEY=YOUR_FIREBASE_VAPID_KEY
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
```

Optional:

```
VITE_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
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

Migration script (MongoDB):

```bash
cd backend
npm run db:migrate
```

If you need to allow destructive changes:

```bash
cd backend
npm run db:migrate:force
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
