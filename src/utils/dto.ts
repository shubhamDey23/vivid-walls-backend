import { Request } from 'express';
import { absoluteUrl } from './url';

type CategoryLite = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

export type WallpaperRow = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  resolution: string;
  isFeatured: boolean;
  likes: number;
  downloadCount: number;
  createdAt: Date;
  categoryId: string;
  category?: CategoryLite | null;
};

/** Shapes a Prisma wallpaper row into the JSON the frontend consumes. */
export const toWallpaperDTO = (req: Request, w: WallpaperRow) => ({
  id: w.id,
  title: w.title,
  videoUrl: absoluteUrl(req, w.videoUrl),
  thumbnailUrl: absoluteUrl(req, w.thumbnailUrl),
  resolution: w.resolution,
  isFeatured: w.isFeatured,
  likes: w.likes,
  downloadCount: w.downloadCount,
  createdAt: w.createdAt,
  category: w.category
    ? {
        id: w.category.id,
        name: w.category.name,
        slug: w.category.slug,
        icon: w.category.icon,
      }
    : undefined,
});
