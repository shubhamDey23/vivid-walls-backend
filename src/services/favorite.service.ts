import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

const wallpaperInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnailUrl: true,
    },
  },
};

const getWallpaper = async (
  wallpaperId: string
) => {
  const wallpaper =
    await prisma.wallpaper.findUnique({
      where: {
        id: wallpaperId,
      },

      include: wallpaperInclude,
    });

  if (!wallpaper) {
    throw ApiError.notFound(
      "Wallpaper not found."
    );
  }

  if (!wallpaper.active) {
    throw ApiError.notFound(
      "Wallpaper is inactive."
    );
  }

  return wallpaper;
};



export const favoriteService = {
  /** A user's favorite wallpapers, newest first. */
  async list(
    userId: string,
    limit: number,
    offset: number
  ) {
    const [favorites, total] =
      await Promise.all([
        prisma.favorite.findMany({
          where: {
            userId,
          },

          include: {
            wallpaper: {
              include:
                wallpaperInclude,
            },
          },

          orderBy: {
            createdAt: "desc",
          },

          skip: offset,

          take: limit,
        }),

        prisma.favorite.count({
          where: {
            userId,
          },
        }),
      ]);

    return {
      items: favorites.map(
        (favorite) => ({
          ...favorite.wallpaper,

          favoritedAt:
            favorite.createdAt,
        })
      ),

      total,
    };
  },

  /** Idempotent add — favoriting twice is a no-op thanks to the unique index. */
  async add(
    userId: string,
    wallpaperId: string
  ) {
    await getWallpaper(
      wallpaperId
    );

    return prisma.favorite.upsert({
      where: {
        userId_wallpaperId: {
          userId,
          wallpaperId,
        },
      },

      update: {},

      create: {
        userId,
        wallpaperId,
      },
    });
  },

  /** Idempotent remove — returns how many rows were deleted (0 or 1). */
  async remove(
    userId: string,
    wallpaperId: string
  ) {
    const result =
      await prisma.favorite.deleteMany({
        where: {
          userId,
          wallpaperId,
        },
      });

    return {
      removed:
        result.count > 0,
    };
  },

  async toggle(
    userId: string,
    wallpaperId: string
  ) {
    await getWallpaper(
      wallpaperId
    );

    const existing =
      await prisma.favorite.findUnique({
        where: {
          userId_wallpaperId: {
            userId,
            wallpaperId,
          },
        },
      });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          userId_wallpaperId: {
            userId,
            wallpaperId,
          },
        },
      });

      return {
        favorite: false,
      };
    }

    await prisma.favorite.create({
      data: {
        userId,
        wallpaperId,
      },
    });

    return {
      favorite: true,
    };
  },

  async isFavorite(
    userId: string,
    wallpaperId: string
  ) {
    const favorite =
      await prisma.favorite.findUnique({
        where: {
          userId_wallpaperId: {
            userId,
            wallpaperId,
          },
        },
      });

    return {
      favorite: !!favorite,
    };
  },
};
