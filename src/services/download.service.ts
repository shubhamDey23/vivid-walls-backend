import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

const withCategory = {
  category: { select: { id: true, name: true, slug: true, icon: true } },
};

export const downloadService = {
  /**
   * Records a download event and bumps the wallpaper's denormalized counter
   * in a single transaction so the two never drift apart.
   */
  async record(userId: string, wallpaperId: string) {
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id: wallpaperId },
    });
    if (!wallpaper) throw ApiError.notFound(`Wallpaper ${wallpaperId} not found`);

    const [download] = await prisma.$transaction([
      prisma.download.create({ data: { userId, wallpaperId } }),
      prisma.wallpaper.update({
        where: { id: wallpaperId },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);
    return download;
  },

  /** A user's download history, newest first. */
  async list(userId: string, limit: number, offset: number) {
    const [rows, total] = await Promise.all([
      prisma.download.findMany({
        where: { userId },
        include: { wallpaper: { include: withCategory } },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.download.count({ where: { userId } }),
    ]);
    return {
      items: rows.map((r) => ({ ...r.wallpaper, downloadedAt: r.createdAt })),
      total,
    };
  },
};
