import { Router, Request, Response } from 'express';
import { checkAgentHealth } from '../services/orchestrateService';

const router = Router();

// GET /api/health — overall system health + agent connectivity
router.get('/', async (req: Request, res: Response) => {
  const health = await checkAgentHealth();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mockMode: health.mockMode,
    ibmConfigured: health.configured,
    configured: health.configured,
    reachable: health.reachable,
    agent: health.agent,
  });
});

// GET /api/health/status or /api/ai/status
router.get('/status', async (req: Request, res: Response) => {
  const health = await checkAgentHealth();
  res.json(health);
});

export default router;
