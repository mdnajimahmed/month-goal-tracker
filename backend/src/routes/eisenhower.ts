import { Router } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';

const router = Router();

const eisenhowerTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  quadrant: z.enum(['do-first', 'schedule', 'delegate', 'eliminate']),
  delegateTo: z.string().optional(),
});

const updateEisenhowerTaskSchema = eisenhowerTaskSchema.partial();

// Get all tasks
router.get('/', async (req, res) => {
  const { quadrant, completed } = req.query;
  const where: any = {};
  
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
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const task = await prisma.eisenhowerTask.findUnique({
    where: { id },
  });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Create task
router.post('/', async (req, res) => {
  const data = eisenhowerTaskSchema.parse(req.body);
  const task = await prisma.eisenhowerTask.create({
    data,
  });
  res.status(201).json(task);
});

// Update task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = updateEisenhowerTaskSchema.parse(req.body);
  const task = await prisma.eisenhowerTask.update({
    where: { id },
    data,
  });
  res.json(task);
});

// Complete task
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const task = await prisma.eisenhowerTask.update({
    where: { id },
    data: { completedAt: new Date() },
  });
  res.json(task);
});

// Uncomplete task
router.post('/:id/uncomplete', async (req, res) => {
  const { id } = req.params;
  const task = await prisma.eisenhowerTask.update({
    where: { id },
    data: { completedAt: null },
  });
  res.json(task);
});

// Move task to different quadrant
router.post('/:id/move', async (req, res) => {
  const { id } = req.params;
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
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.eisenhowerTask.delete({
    where: { id },
  });
  res.status(204).send();
});

export default router;
