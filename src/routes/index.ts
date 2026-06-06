import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import wallpaperRoutes from './wallpaper.routes';
import categoryRoutes from './category.routes';
import favoriteRoutes from './favorite.routes';
import downloadRoutes from './download.routes';

const router = Router();

// GET /api/health
router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallpapers', wallpaperRoutes);
router.use('/categories', categoryRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/downloads', downloadRoutes);

export default router;
