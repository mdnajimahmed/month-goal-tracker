# Frontend-Backend Integration Guide

## Overview

The frontend has been fully integrated with the backend API. All data operations now go through REST API endpoints instead of localStorage.

## Architecture

- **API Client**: `src/lib/api/` - Centralized API functions
- **React Query**: Used for data fetching, caching, and mutations
- **Hooks**: Updated to use API calls instead of localStorage

## API Configuration

The API base URL is configured via environment variable:

```env
VITE_API_URL=http://localhost:3001/api
```

For local development, this defaults to `http://localhost:3001/api` if not set.

## Data Flow

1. **Fetching Data**: React Query hooks fetch data from API
2. **Mutations**: React Query mutations update data and invalidate cache
3. **Optimistic Updates**: Mutations automatically refetch affected queries

## Updated Hooks

### `useGoalTracker`
- Fetches goals and day entries from API
- All CRUD operations go through API
- Maintains local state for non-office days (can be moved to backend later)

### `useEisenhower`
- Fetches Eisenhower tasks from API
- All operations (create, update, delete, complete, move) use API

### `useBacklog`
- Fetches backlog items from API
- All CRUD operations use API
- Client-side auto-completion for overdue items (can be moved to backend)

## Testing Locally

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   npm install
   npm run dev
   ```

3. **Verify Connection**:
   - Open browser console
   - Check for any API errors
   - Try creating a goal/task/item
   - Verify data persists after refresh

## Error Handling

- API errors are caught and displayed via error boundaries
- React Query handles retries automatically
- Network errors show user-friendly messages

## Data Migration

If you have existing localStorage data:

1. The app will start fresh with the backend
2. Old localStorage data won't be migrated automatically
3. You can manually create items through the UI

## Troubleshooting

### API Connection Issues

- Check backend is running on port 3001
- Verify `VITE_API_URL` in `.env` matches backend URL
- Check browser console for CORS errors
- Verify database is running and migrations are applied

### Data Not Persisting

- Check backend logs for errors
- Verify database connection
- Check Prisma migrations are applied
- Verify API endpoints are returning correct data

### CORS Errors

- Backend CORS is configured to allow all origins in development
- For production, update CORS settings in `backend/src/index.ts`
