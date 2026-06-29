import prisma from "../config/prisma";

import { ApiError } from "../utils/ApiError";

const FREE_DAILY_LIMIT = 5;

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

const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw ApiError.notFound(
      "User not found."
    );
  }

  return user;
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

  if (wallpaper.status !== "READY") {
    throw ApiError.badRequest(
      "Wallpaper is still processing."
    );
  }

  return wallpaper;
};

const isPremiumActive = (
  premiumUntil: Date | null,
  isPremium: boolean
) => {
  return (
    isPremium &&
    premiumUntil !== null &&
    premiumUntil > new Date()
  );
};

const resetDailyLimit = async (
  userId: string,
  lastReset: Date | null
) => {
  const today =
    new Date().toDateString();

  if (
    lastReset?.toDateString() !==
    today
  ) {
    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        dailyDownloadCount: 0,

        lastDownloadReset:
          new Date(),
      },
    });

    return 0;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        dailyDownloadCount: true,
      },
    });

  return user?.dailyDownloadCount ?? 0;
};

const checkDownloadPermission = (
  premiumActive: boolean,
  wallpaperPremium: boolean,
  dailyCount: number
) => {
  // Premium wallpaper
  if (
    wallpaperPremium &&
    !premiumActive
  ) {
    throw ApiError.forbidden(
      "Premium subscription required."
    );
  }

  // Free daily limit
  if (
    !premiumActive &&
    dailyCount >= FREE_DAILY_LIMIT
  ) {
    throw ApiError.forbidden(
      "Daily free download limit reached."
    );
  }
};


const recordTransaction = async (
  userId: string | null,
  wallpaperId: string,
  quality: string,
  incrementUser: boolean
) => {
  return prisma.$transaction(
    async (tx) => {
      const download =
        await tx.download.create({
          data: {
            userId,

            wallpaperId,

            quality,
          },
        });

      await tx.wallpaper.update({
        where: {
          id: wallpaperId,
        },

        data: {
          downloadCount: {
            increment: 1,
          },
        },
      });

      if (
        incrementUser &&
        userId
      ) {
        await tx.user.update({
          where: {
            id: userId,
          },

          data: {
            dailyDownloadCount: {
              increment: 1,
            },
          },
        });
      }

      return download;
    }
  );
};

export const downloadService = {


  async record(
    userId: string,
    wallpaperId: string
  ) {
    const user = await getUser(userId);

    const wallpaper =
      await getWallpaper(wallpaperId);

    const premiumActive =
      isPremiumActive(
        user.premiumUntil,
        user.isPremium
      );

    const dailyCount =
      await resetDailyLimit(
        user.id,
        user.lastDownloadReset
      );

    checkDownloadPermission(
      premiumActive,
      wallpaper.isPremium,
      dailyCount
    );

    const download =
      await recordTransaction(
        user.id,
        wallpaper.id,
        wallpaper.quality,
        !premiumActive
      );

    return {
      ...download,

      downloadUrl:
        wallpaper.originalPath,

      quality:
        wallpaper.quality,

      isPremium:
        wallpaper.isPremium,
    };
  },

  async recordPublic(
    wallpaperId: string
  ) {
    const wallpaper =
      await getWallpaper(wallpaperId);

    if (wallpaper.isPremium) {
      throw ApiError.forbidden(
        "Premium wallpaper requires login."
      );
    }

    const download =
      await recordTransaction(
        null,
        wallpaper.id,
        wallpaper.quality,
        false
      );

    return {
      ...download,

      downloadUrl:
        wallpaper.originalPath,

      quality:
        wallpaper.quality,

      isPremium:
        wallpaper.isPremium,
    };
  },

  async list(
    userId: string,
    limit: number,
    offset: number
  ) {
    const [downloads, total] =
      await Promise.all([
        prisma.download.findMany({
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

        prisma.download.count({
          where: {
            userId,
          },
        }),
      ]);

    return {
      items: downloads.map(
        (download) => ({
          ...download.wallpaper,

          downloadedAt:
            download.createdAt,

          downloadQuality:
            download.quality,
        })
      ),

      total,
    };
  },
}


