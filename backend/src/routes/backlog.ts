import { Router } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { getParam } from '../utils/params.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

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
router.get('/', async (req: AuthRequest, res) => {
  const { category, priority, completed } = req.query;
  const where: any = {
    userId: req.userId!, // CRITICAL: Only user's items
  };
  
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
router.get('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  const item = await prisma.backlogItem.findFirst({
    where: { 
      id,
      userId: req.userId!, // CRITICAL: Verify ownership
    },
  });
  if (!item) {
    return res.status(404).json({ error: 'Backlog item not found' });
  }
  res.json(item);
});

// Create backlog item
router.post('/', async (req: AuthRequest, res) => {
  const data = backlogItemSchema.parse(req.body);
  const item = await prisma.backlogItem.create({
    data: {
      ...data,
      userId: req.userId!, // CRITICAL: Set userId
    },
  });
  res.status(201).json(item);
});

// Update backlog item
router.put('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  const existing = await prisma.backlogItem.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Backlog item not found' });
  }
  
  const data = updateBacklogItemSchema.parse(req.body);
  const item = await prisma.backlogItem.update({
    where: { id },
    data,
  });
  res.json(item);
});

// Complete backlog item
router.post('/:id/complete', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  const existing = await prisma.backlogItem.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Backlog item not found' });
  }
  
  const item = await prisma.backlogItem.update({
    where: { id },
    data: { completedAt: new Date() },
  });
  res.json(item);
});

// Uncomplete backlog item
router.post('/:id/uncomplete', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  const existing = await prisma.backlogItem.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Backlog item not found' });
  }
  
  const item = await prisma.backlogItem.update({
    where: { id },
    data: { completedAt: null },
  });
  res.json(item);
});

// Delete backlog item
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = getParam(req, 'id');
  
  const existing = await prisma.backlogItem.findFirst({
    where: { id, userId: req.userId! },
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Backlog item not found' });
  }
  
  await prisma.backlogItem.delete({
    where: { id },
  });
  res.status(204).send();
});

export default router;
