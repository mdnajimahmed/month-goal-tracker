# Month Goal Tracker

A smart todo app with execution tracking, Eisenhower matrix for operations, and vision backlog management.

## Features

- **Execution**: Daily tracking of goals with time blocks and analytics
- **Operation**: Eisenhower matrix for day-to-day unplanned chores
- **Vision**: Long-term goals and backlog management

## Architecture

- **Frontend**: React + TypeScript + Vite + shadcn/ui
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL
- **Infrastructure**: AWS CDK (Lambda, RDS, S3, CloudFront, API Gateway)

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- AWS CLI configured (for deployment)
- AWS CDK CLI (`npm install -g aws-cdk`)

## Local Development

### Quick Start

Run everything with one command:

```bash
npm run dev:full
```

This will:
1. Start PostgreSQL in Docker
2. Run database migrations
3. Start the backend API server (port 3002)
4. Start the frontend dev server (port 8080, or next available port)

**Note**: Make sure you have Docker running before executing this command.

### Manual Setup

If you prefer to run services separately:

1. **Start Database**:
   ```bash
   docker-compose up -d
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

3. **Setup Frontend** (in another terminal):
   ```bash
   npm install
   # Copy .env.example to .env if you want to customize API URL
   npm run dev
   ```

The frontend will automatically connect to `http://localhost:3002/api` by default.

### Manual Setup

1. **Start PostgreSQL**:
   ```bash
   docker-compose up -d
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

3. **Setup Frontend** (in another terminal):
   ```bash
   npm install
   npm run dev
   ```

## Deployment

Deploy everything to AWS with one command:

```bash
npm run deploy
```

This will:
1. Build the frontend
2. Build the backend
3. Build the CDK infrastructure
4. Deploy everything to AWS

### First Time Setup

Before deploying, you need to bootstrap CDK:

```bash
cd infrastructure
npx cdk bootstrap
cd ..
```

### Environment Variables

For local development, create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/goal_tracker?schema=public"
NODE_ENV=development
PORT=3001
```

For AWS deployment, the database connection is automatically configured via SSM Parameter Store.

## Project Structure

```
.
├── backend/              # Express API server
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── config/      # Database and env config
│   │   └── lambda.ts   # Lambda handler
│   └── prisma/          # Prisma schema and migrations
├── infrastructure/      # AWS CDK infrastructure
│   ├── lib/            # CDK stack definitions
│   └── bin/            # CDK app entry point
├── scripts/            # Deployment scripts
└── src/                # Frontend React app
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create a goal
- `GET /api/day-entries` - List day entries
- `POST /api/day-entries` - Create/update day entry
- `GET /api/eisenhower` - List Eisenhower tasks
- `POST /api/eisenhower` - Create Eisenhower task
- `GET /api/backlog` - List backlog items
- `POST /api/backlog` - Create backlog item

## Database Schema

The app uses Prisma ORM with PostgreSQL. Run migrations with:

```bash
cd backend
npm run prisma:migrate
```

View database with Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

## License

MIT
