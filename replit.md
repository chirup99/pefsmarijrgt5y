# Project Overview

PERSONA — a full-stack TypeScript web application for managing profiles and data cards (pitch, reel, revenue, product) with a modern mesh-styled dashboard UI.

## Architecture

- **Frontend**: React 18 + Vite, Tailwind CSS, shadcn/ui components, Wouter for routing, TanStack Query for data fetching
- **Backend**: Express.js server (TypeScript) with REST API
- **Database**: AWS DynamoDB via `@aws-sdk/lib-dynamodb`
- **Auth**: bcrypt password hashing (12 rounds), custom session-less auth (login/register endpoints)

## Project Structure

```
client/         # React frontend (Vite)
  src/          # App source code
server/         # Express backend
  index.ts      # Server entry point
  routes.ts     # API route handlers
  storage.ts    # DynamoDB access layer (DynamoDBStorage)
  vite.ts       # Vite dev middleware
  static.ts     # Static file serving (production)
shared/         # Shared types and schemas
  schema.ts     # Zod schemas and User types
  routes.ts     # Typed API route definitions
script/         # Build scripts
```

## Key Configuration

- Port: 5000 (mapped to external port 80)
- `NODE_ENV=development` uses Vite dev middleware via Express
- `NODE_ENV=production` serves static dist/public files

## Required Environment Variables

- `AWS_ACCESS_KEY_ID` — AWS credentials for DynamoDB
- `AWS_SECRET_ACCESS_KEY` — AWS credentials for DynamoDB
- `AWS_REGION` — AWS region (defaults to ap-south-1)
- `DYNAMODB_TABLE_NAME` — DynamoDB table name (defaults to "Users")
- `LIVEKIT_API_KEY` — LiveKit API key (optional, for LiveKit features)
- `LIVEKIT_API_SECRET` — LiveKit API secret (optional, for LiveKit features)

## Running the App

- **Dev**: `npm run dev` (tsx server/index.ts)
- **Build**: `npm run build`
- **Production**: `npm start`

## Dependencies

- Express 5, AWS DynamoDB SDK, Zod validation
- React 18, TanStack Query, React Hook Form
- shadcn/ui (Radix UI primitives + Tailwind)
- bcrypt for password hashing
- Framer Motion for animations
- LiveKit for video features
