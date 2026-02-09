import { Router } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';

const router = Router();

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
router.get('/goal/:goalId', async (req, res) => {
  const { goalId } = req.params;
  const entries = await prisma.dayEntry.findMany({
    where: { goalId },
    orderBy: { date: 'desc' },
  });
  res.json(entries);
});

// Get day entry by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const entry = await prisma.dayEntry.findUnique({
    where: { id },
    include: { goal: true },
  });
  if (!entry) {
    return res.status(404).json({ error: 'Day entry not found' });
  }
  res.json(entry);
});

// Get day entries by date range
router.get('/date/:startDate/:endDate', async (req, res) => {
  const { startDate, endDate } = req.params;
  const entries = await prisma.dayEntry.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { goal: true },
    orderBy: { date: 'desc' },
  });
  res.json(entries);
});

// Create or update day entry
router.post('/', async (req, res) => {
  const data = dayEntrySchema.parse(req.body);
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
router.put('/:id', async (req, res) => {
  const { id } = req.params;
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
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.dayEntry.delete({
    where: { id },
  });
  res.status(204).send();
});

export default router;
