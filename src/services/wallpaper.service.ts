import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

const withCategory = {
  category: { select: { id: true, name: true, slug: true, icon: true } },
} satisfies Prisma.WallpaperInclude;

export interface ListParams {
  limit: number;
  offset: number;
  search?: string;
  category?: string; // slug or name
}

export const wallpaperService = {
  /** Paginated list with optional title search and category filter. */
  async list({ limit, offset, search, category }: ListParams) {
    const where: Prisma.WallpaperWhereInput = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (category) {
      where.category = { OR: [{ slug: category }, { name: category }] };
    }

    const [items, total] = await Promise.all([
      prisma.wallpaper.findMany({
        where,
        include: withCategory,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.wallpaper.count({ where }),
    ]);

    return { items, total };
  },

  async getById(id: string) {
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id },
      include: withCategory,
    });
    if (!wallpaper) throw ApiError.notFound(`Wallpaper ${id} not found`);
    return wallpaper;
  },

  /** Home hero: editorially flagged wallpapers, most-liked first. */
  async getFeatured(limit: number) {
    return prisma.wallpaper.findMany({
      where: { isFeatured: true },
      include: withCategory,
      orderBy: [{ likes: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  },

  /**
   * Home "Trending" rail. Simple heuristic: surface the most downloaded and
   * most liked first. Swap for a time-decayed score when you have traffic data.
   */
  async getTrending(limit: number) {
    return prisma.wallpaper.findMany({
      include: withCategory,
      orderBy: [{ downloadCount: 'desc' }, { likes: 'desc' }],
      take: limit,
    });
  },
};
