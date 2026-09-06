import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validateRequest';
import { createError } from '../middleware/errorHandler';
import { createProfile, getProfileById, updateProfile } from '../db/repositories/profileRepository';

const router = Router();

// POST /api/profile — create or update profile
router.post(
  '/',
  validateBody([
    { field: 'name', type: 'string', required: true, minLength: 1, maxLength: 100 },
    { field: 'targetRole', type: 'string', required: true, minLength: 1, maxLength: 100 },
    { field: 'experienceLevel', type: 'string', required: true, enum: ['fresher', 'entry', 'intermediate', 'experienced'] },
    { field: 'skills', type: 'array', required: true },
    { field: 'yearsExperience', type: 'number', required: true },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, ...data } = req.body;

      if (id) {
        const updated = await updateProfile(id, data);
        if (!updated) {
          throw createError('Profile not found', 404, 'NOT_FOUND');
        }
        res.json(updated);
      } else {
        const profile = await createProfile(data);
        res.status(201).json(profile);
      }
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/profile/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await getProfileById(req.params.id);
    if (!profile) {
      throw createError('Profile not found', 404, 'NOT_FOUND');
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
