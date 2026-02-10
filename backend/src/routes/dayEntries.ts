import { Router } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { getParam } from '../utils/params.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

const dayEntrySchema = z.object({
  goalId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['hit', 'miss', 'partial']),
  actualMinutes: z.number().int().min(0).default(0),
  comment: z.string().default(''),
  missedReason: z.string().optional(),
  timeBlocks: z.array(z.object({
    id: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    type: z.enum(['executed', 'blocked']),
    note: z.string().optional(),
  })).default([]),
});

const updateDayEntrySchema = dayEntrySchema.partial().omit({ goalId: true, date: true });

// Get all day entries for a goal
router.get('/goal/:goalId', async (req: AuthRequest, res) => {
  const goalId = getParam(req, 'goalId');
  
  // Verify user owns the goal
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: req.userId! },
  });
  
  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  
  const entries = await prisma.dayEntry.findMany({
    where: { goalId },
    orderBy: { date: 'desc' },
  });
  res.json(entries);
});

// Get day entry by ID
router.get('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  const entry = await prisma.dayEntry.findFirst({
    where: { 
      id,
      goal: {
        userId: req.userId!, // Ensure user owns the goal
      },
    },
    include: { goal: true },
  });
  if (!entry) {
    return res.status(404).json({ error: 'Day entry not found' });
  }
  res.json(entry);
});

// Get day entries by date range
router.get('/date/:startDate/:endDate', async (req: AuthRequest, res) => {
  const startDate = getParam(req, 'startDate');
  const endDate = getParam(req, 'endDate');
  const entries = await prisma.dayEntry.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      goal: {
        userId: req.userId!, // Only entries for user's goals
      },
    },
    include: { goal: true },
    orderBy: { date: 'desc' },
  });
  res.json(entries);
});

// Create or update day entry
router.post('/', async (req: AuthRequest, res) => {
  const data = dayEntrySchema.parse(req.body);
  
  // Verify user owns the goal
  const goal = await prisma.goal.findFirst({
    where: { id: data.goalId, userId: req.userId! },
  });
  
  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  
  const entry = await prisma.dayEntry.upsert({
    where: {
      goalId_date: {
        goalId: data.goalId,
        date: data.date,
      },
    },
    update: {
      status: data.status,
      actualMinutes: data.actualMinutes,
      comment: data.comment,
      missedReason: data.missedReason,
      timeBlocks: data.timeBlocks as any,
    },
    create: {
      ...data,
      timeBlocks: data.timeBlocks as any,
    },
  });
  res.status(201).json(entry);
});

// Update day entry
router.put('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  // Verify user owns the entry's goal
  const existing = await prisma.dayEntry.findFirst({
    where: {
      id,
      goal: {
        userId: req.userId!,
      },
    },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Day entry not found' });
  }
  
  const data = updateDayEntrySchema.parse(req.body);
  const entry = await prisma.dayEntry.update({
    where: { id },
    data: {
      ...data,
      timeBlocks: data.timeBlocks as any,
    },
  });
  res.json(entry);
});

// Delete day entry
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  // Verify user owns the entry's goal
  const existing = await prisma.dayEntry.findFirst({
    where: {
      id,
      goal: {
        userId: req.userId!,
      },
    },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Day entry not found' });
  }
  
  await prisma.dayEntry.delete({
    where: { id },
  });
  res.status(204).send();
});

export default router;
