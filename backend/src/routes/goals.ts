import { Router } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { getParam } from '../utils/params.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

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
router.get('/', async (req: AuthRequest, res) => {
  const { completed } = req.query;
  const where: any = { userId: req.userId! };
  
  // Filter by completion status if provided
  if (completed === 'true') {
    where.completedAt = { not: null };
  } else if (completed === 'false') {
    where.completedAt = null;
  }
  
  const goals = await prisma.goal.findMany({
    where,
    orderBy: completed === 'true' 
      ? [{ completedAt: 'desc' }, { createdAt: 'desc' }]
      : { createdAt: 'desc' },
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
router.get('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  const goal = await prisma.goal.findFirst({
    where: { 
      id,
      userId: req.userId!, // Ensure user owns this goal
    },
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
router.post('/', async (req: AuthRequest, res) => {
  const data = goalSchema.parse(req.body);
  const goal = await prisma.goal.create({
    data: {
      ...data,
      userId: req.userId!, // Ensure userId is set
    },
  });
  res.status(201).json(goal);
});

// Update goal
router.put('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  // First verify user owns this goal
  const existing = await prisma.goal.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  
  const data = updateGoalSchema.parse(req.body);
  const goal = await prisma.goal.update({
    where: { id },
    data,
  });
  res.json(goal);
});

// Complete goal
router.post('/:id/complete', async (req: AuthRequest, res) => {
  try {
    const id = getParam(req, 'id');
    
    // Verify user owns this goal
    const existing = await prisma.goal.findFirst({
      where: { id, userId: req.userId! },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    const goal = await prisma.goal.update({
      where: { id },
      data: { completedAt: new Date() },
    });
    res.json(goal);
  } catch (error: any) {
    console.error('Error completing goal:', error);
    res.status(500).json({ 
      error: 'Failed to complete goal',
      details: error.message,
      code: error.code 
    });
  }
});

// Uncomplete goal
router.post('/:id/uncomplete', async (req: AuthRequest, res) => {
  try {
    const id = getParam(req, 'id');
    
    // Verify user owns this goal
    const existing = await prisma.goal.findFirst({
      where: { id, userId: req.userId! },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    const goal = await prisma.goal.update({
      where: { id },
      data: { completedAt: null },
    });
    res.json(goal);
  } catch (error: any) {
    console.error('Error uncompleting goal:', error);
    res.status(500).json({ 
      error: 'Failed to uncomplete goal',
      details: error.message,
      code: error.code 
    });
  }
});

// Delete goal
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  // First verify user owns this goal
  const existing = await prisma.goal.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  
  await prisma.goal.delete({
    where: { id },
  });
  res.status(204).send();
});

export default router;
