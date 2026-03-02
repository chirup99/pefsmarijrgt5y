# Project Overview

A full-stack TypeScript web application with user authentication built on Express.js and React.

## Architecture

- **Frontend**: React 18 + Vite, using Tailwind CSS, shadcn/ui components, and Wouter for routing
- **Backend**: Express.js server (TypeScript) with REST API
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: bcrypt password hashing, custom session-less auth (login/register endpoints)

## Project Structure

```
client/         # React frontend (Vite)
  src/          # App source code
server/         # Express backend
  index.ts      # Server entry point
  routes.ts     # API route handlers
  storage.ts    # Database access layer
  db.ts         # Drizzle/pg connection
  vite.ts       # Vite dev middleware
  static.ts     # Static file serving (production)
shared/         # Shared types and schemas
  schema.ts     # Drizzle table definitions + Zod schemas
  routes.ts     # Typed API route definitions
script/         # Build scripts
```

## Key Configuration

- Port: 5000 (mapped to external port 80)
- `NODE_ENV=development` uses Vite dev middleware via Express
- `NODE_ENV=production` serves static dist/public files
- Database: Requires `DATABASE_URL` env variable (Replit PostgreSQL)

## Running the App

- **Dev**: `npm run dev` (tsx server/index.ts)
- **Build**: `npm run build`
- **Production**: `npm start`
- **DB schema push**: `npm run db:push`

## Dependencies

- Express 5, Drizzle ORM, Zod validation
- React 18, TanStack Query, React Hook Form
- shadcn/ui (Radix UI primitives + Tailwind)
- bcrypt for password hashing
