import { Router } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';

const router = Router();

const backlogItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['certifications', 'udemy', 'books', 'interview', 'concepts']),
  priority: z.enum(['high', 'medium', 'low']),
  tentativeStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  estimatedHours: z.number().int().positive().optional(),
});

const updateBacklogItemSchema = backlogItemSchema.partial();

// Get all backlog items
router.get('/', async (req, res) => {
  const { category, priority, completed } = req.query;
  const where: any = {};
  
  if (category) {
    where.category = category;
  }
  
  if (priority) {
    where.priority = priority;
  }
  
  if (completed === 'true') {
    where.completedAt = { not: null };
  } else if (completed === 'false') {
    where.completedAt = null;
  }
  
  const items = await prisma.backlogItem.findMany({
    where,
    orderBy: [
      { completedAt: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });
  res.json(items);
});

// Get backlog item by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const item = await prisma.backlogItem.findUnique({
    where: { id },
  });
  if (!item) {
    return res.status(404).json({ error: 'Backlog item not found' });
  }
  res.json(item);
});

// Create backlog item
router.post('/', async (req, res) => {
  const data = backlogItemSchema.parse(req.body);
  const item = await prisma.backlogItem.create({
    data,
  });
  res.status(201).json(item);
});

// Update backlog item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = updateBacklogItemSchema.parse(req.body);
  const item = await prisma.backlogItem.update({
    where: { id },
    data,
  });
  res.json(item);
});

// Complete backlog item
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const item = await prisma.backlogItem.update({
    where: { id },
    data: { completedAt: new Date() },
  });
  res.json(item);
});

// Uncomplete backlog item
router.post('/:id/uncomplete', async (req, res) => {
  const { id } = req.params;
  const item = await prisma.backlogItem.update({
    where: { id },
    data: { completedAt: null },
  });
  res.json(item);
});

// Delete backlog item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.backlogItem.delete({
    where: { id },
  });
  res.status(204).send();
});

export default router;
