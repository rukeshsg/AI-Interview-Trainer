import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validateRequest';
import { orchestrateService } from '../services/orchestrateService';
import { getProfileById } from '../db/repositories/profileRepository';

const router = Router();

// POST /api/chat
router.post(
  '/',
  validateBody([
    { field: 'message', type: 'string', required: true, minLength: 1, maxLength: 2000 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, profileId, sessionId, history, profile: clientProfile } = req.body;

      let profile = clientProfile;
      if (!profile && profileId) {
        const p = await getProfileById(profileId);
        if (p) {
          profile = {
            name: p.name,
            targetRole: p.targetRole,
            experienceLevel: p.experienceLevel,
            skills: p.skills,
          };
        }
      }

      const result = await orchestrateService.chat({
        message,
        sessionId,
        profile,
        history: Array.isArray(history) ? history.slice(-10) : [],
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
