# Backend API

Express.js backend API for Month Goal Tracker.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

## Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Building for Lambda

To build for AWS Lambda deployment:
```bash
./scripts/build-for-lambda.sh
```

This will:
- Compile TypeScript
- Generate Prisma Client
- Copy necessary files for Lambda

## API Routes

- `GET /api/health` - Health check
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create a goal
- `GET /api/goals/:id` - Get goal by ID
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

- `GET /api/day-entries/goal/:goalId` - Get entries for a goal
- `GET /api/day-entries/:id` - Get entry by ID
- `POST /api/day-entries` - Create/update entry
- `PUT /api/day-entries/:id` - Update entry
- `DELETE /api/day-entries/:id` - Delete entry

- `GET /api/eisenhower` - List Eisenhower tasks
- `POST /api/eisenhower` - Create task
- `GET /api/eisenhower/:id` - Get task by ID
- `PUT /api/eisenhower/:id` - Update task
- `POST /api/eisenhower/:id/complete` - Complete task
- `POST /api/eisenhower/:id/uncomplete` - Uncomplete task
- `POST /api/eisenhower/:id/move` - Move task to different quadrant
- `DELETE /api/eisenhower/:id` - Delete task

- `GET /api/backlog` - List backlog items
- `POST /api/backlog` - Create item
- `GET /api/backlog/:id` - Get item by ID
- `PUT /api/backlog/:id` - Update item
- `POST /api/backlog/:id/complete` - Complete item
- `POST /api/backlog/:id/uncomplete` - Uncomplete item
- `DELETE /api/backlog/:id` - Delete item
