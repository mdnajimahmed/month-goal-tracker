import { Router } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { getParam } from '../utils/params.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

const eisenhowerTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  quadrant: z.enum(['do-first', 'schedule', 'delegate', 'eliminate']),
  delegateTo: z.string().optional(),
});

const updateEisenhowerTaskSchema = eisenhowerTaskSchema.partial();

// Get all tasks
router.get('/', async (req: AuthRequest, res) => {
  const { quadrant, completed } = req.query;
  const where: any = {
    userId: req.userId!, // CRITICAL: Only user's tasks
  };
  
  if (quadrant) {
    where.quadrant = quadrant;
  }
  
  if (completed === 'true') {
    where.completedAt = { not: null };
  } else if (completed === 'false') {
    where.completedAt = null;
  }
  
  const tasks = await prisma.eisenhowerTask.findMany({
    where,
    orderBy: [
      { completedAt: 'asc' },
      { createdAt: 'desc' },
    ],
  });
  res.json(tasks);
});

// Get task by ID
router.get('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  const task = await prisma.eisenhowerTask.findFirst({
    where: { 
      id,
      userId: req.userId!, // CRITICAL: Verify ownership
    },
  });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Create task
router.post('/', async (req: AuthRequest, res) => {
  const data = eisenhowerTaskSchema.parse(req.body);
  const task = await prisma.eisenhowerTask.create({
    data: {
      ...data,
      userId: req.userId!, // CRITICAL: Set userId
    },
  });
  res.status(201).json(task);
});

// Update task
router.put('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  // Verify ownership
  const existing = await prisma.eisenhowerTask.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const data = updateEisenhowerTaskSchema.parse(req.body);
  const task = await prisma.eisenhowerTask.update({
    where: { id },
    data,
  });
  res.json(task);
});

// Complete task
router.post('/:id/complete', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  const existing = await prisma.eisenhowerTask.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const task = await prisma.eisenhowerTask.update({
    where: { id },
    data: { completedAt: new Date() },
  });
  res.json(task);
});

// Uncomplete task
router.post('/:id/uncomplete', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  const existing = await prisma.eisenhowerTask.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const task = await prisma.eisenhowerTask.update({
    where: { id },
    data: { completedAt: null },
  });
  res.json(task);
});

// Move task to different quadrant
router.post('/:id/move', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  const existing = await prisma.eisenhowerTask.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { quadrant } = z.object({
    quadrant: z.enum(['do-first', 'schedule', 'delegate', 'eliminate']),
  }).parse(req.body);
  
  const task = await prisma.eisenhowerTask.update({
    where: { id },
    data: { quadrant },
  });
  res.json(task);
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  const existing = await prisma.eisenhowerTask.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  await prisma.eisenhowerTask.delete({
    where: { id },
  });
  res.status(204).send();
});

export default router;
