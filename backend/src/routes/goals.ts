import { Router } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';

const router = Router();

const goalSchema = z.object({
  title: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  allocatedMinutes: z.number().int().positive(),
  tags: z.array(z.string()).default([]),
  targetEndDate: z.string().optional(),
  isWeekendGoal: z.boolean().default(false),
  isWeekdayGoal: z.boolean().default(false),
});

const updateGoalSchema = goalSchema.partial();

// Get all goals
router.get('/', async (req, res) => {
  const goals = await prisma.goal.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      dayEntries: {
        orderBy: { date: 'desc' },
        take: 30, // Last 30 entries
      },
    },
  });
  res.json(goals);
});

// Get goal by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      dayEntries: {
        orderBy: { date: 'desc' },
      },
    },
  });
  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  res.json(goal);
});

// Create goal
router.post('/', async (req, res) => {
  const data = goalSchema.parse(req.body);
  const goal = await prisma.goal.create({
    data,
  });
  res.status(201).json(goal);
});

// Update goal
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = updateGoalSchema.parse(req.body);
  const goal = await prisma.goal.update({
    where: { id },
    data,
  });
  res.json(goal);
});

// Delete goal
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.goal.delete({
    where: { id },
  });
  res.status(204).send();
});

export default router;
