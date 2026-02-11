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
      // Incomplete items (completedAt null) first, then completed
      { completedAt: 'asc' },
      // Group by category for stable client-side filtering
      { category: 'asc' },
      // Within a category, use manual sort order if set
      { sortOrder: 'asc' },
      // Fallback ordering for items with same sortOrder
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

  // Place new item at the end of its category for this user
  const maxOrderForCategory = await prisma.backlogItem.aggregate({
    where: {
      userId: req.userId!,
      category: data.category,
      completedAt: null,
    },
    _max: { sortOrder: true },
  });

  const nextSortOrder = (maxOrderForCategory._max.sortOrder ?? 0) + 1;

  const item = await prisma.backlogItem.create({
    data: {
      ...data,
      userId: req.userId!, // CRITICAL: Set userId
      sortOrder: nextSortOrder,
    },
  });
  res.status(201).json(item);
});

// Persist manual order within a category
router.post('/reorder', async (req: AuthRequest, res) => {
  const bodySchema = z.object({
    category: z.enum(['certifications', 'udemy', 'books', 'interview', 'concepts']),
    orderedIds: z.array(z.string().uuid()),
  });

  const { category, orderedIds } = bodySchema.parse(req.body);

  // Ensure all items belong to this user and category (and are not completed)
  const items = await prisma.backlogItem.findMany({
    where: {
      id: { in: orderedIds },
      userId: req.userId!,
      category,
      completedAt: null,
    },
    select: { id: true },
  });

  const validIds = new Set(items.map((i) => i.id));
  const filteredOrder = orderedIds.filter((id) => validIds.has(id));

  await prisma.$transaction(
    filteredOrder.map((id, index) =>
      prisma.backlogItem.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  res.status(204).send();
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
