import { Router } from 'express';
import goalsRouter from './goals.js';
import dayEntriesRouter from './dayEntries.js';
import eisenhowerRouter from './eisenhower.js';
import backlogRouter from './backlog.js';

const router = Router();

router.use('/goals', goalsRouter);
router.use('/day-entries', dayEntriesRouter);
router.use('/eisenhower', eisenhowerRouter);
router.use('/backlog', backlogRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
