import { Router } from 'express';
import { z } from 'zod';
import { wallpaperController } from '../controllers/wallpaper.controller';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
});

const limitQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const idParam = z.object({ id: z.string().uuid() });

// Static paths MUST be registered before the dynamic ":id" route.
// GET /api/wallpapers/featured
router.get(
  '/featured',
  validate({ query: limitQuery }),
  asyncHandler(wallpaperController.featured),
);
// GET /api/wallpapers/trending
router.get(
  '/trending',
  validate({ query: limitQuery }),
  asyncHandler(wallpaperController.trending),
);
// GET /api/wallpapers/:id
router.get(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(wallpaperController.getById),
);
// GET /api/wallpapers
router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(wallpaperController.list),
);

export default router;
