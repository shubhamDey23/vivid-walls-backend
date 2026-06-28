import "dotenv/config";

import bcrypt from "bcryptjs";
import crypto from "crypto";

import {
  PrismaClient,
  WallpaperQuality,
  UploadStatus,
  VariantType,
  ImageFormat,
  SubscriptionPlan,
  SubscriptionPlatform,
} from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const checksum = () => crypto.randomUUID().replace(/-/g, "");

const img = (folder: string, file: string) =>
  `/uploads/wallpapers/${folder}/${file}.webp`;

const CATEGORIES = [
  {
    name: "Anime",
    slug: "anime",
    folderName: "anime",
    icon: "IoGameController",
    description: "Anime Wallpapers",
  },
  {
    name: "Nature",
    slug: "nature",
    folderName: "nature",
    icon: "IoLeaf",
    description: "Nature Wallpapers",
  },
  {
    name: "Cars",
    slug: "cars",
    folderName: "cars",
    icon: "IoCarSport",
    description: "Car Wallpapers",
  },
  {
    name: "Gaming",
    slug: "gaming",
    folderName: "gaming",
    icon: "IoLogoGameControllerB",
    description: "Gaming Wallpapers",
  },
  {
    name: "Space",
    slug: "space",
    folderName: "space",
    icon: "IoPlanet",
    description: "Space Wallpapers",
  },
];

const TAGS = [
  "4K",
  "AMOLED",
  "Dark",
  "Minimal",
  "Nature",
  "Cars",
  "Anime",
  "Gaming",
  "Space",
];

const WALLPAPERS = [
  {
    title: "Cyber Samurai",
    category: "anime",
    premium: true,
    featured: true,
  },
  {
    title: "Anime Girl",
    category: "anime",
    premium: false,
    featured: false,
  },
  {
    title: "Mountain Lake",
    category: "nature",
    premium: false,
    featured: true,
  },
  {
    title: "Forest Road",
    category: "nature",
    premium: true,
    featured: false,
  },
  {
    title: "Lamborghini",
    category: "cars",
    premium: true,
    featured: true,
  },
  {
    title: "Ferrari SF90",
    category: "cars",
    premium: false,
    featured: false,
  },
  {
    title: "Gaming RGB",
    category: "gaming",
    premium: false,
    featured: false,
  },
  {
    title: "Cyber Setup",
    category: "gaming",
    premium: true,
    featured: true,
  },
  {
    title: "Milky Way",
    category: "space",
    premium: true,
    featured: true,
  },
  {
    title: "Moon Landing",
    category: "space",
    premium: false,
    featured: false,
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // ==========================================
  // DELETE DATA (Reverse Relation Order)
  // ==========================================

  await prisma.subscription.deleteMany();

  await prisma.wallpaperVariant.deleteMany();

  await prisma.wallpaperTag.deleteMany();

  await prisma.wallpaperLike.deleteMany();

  await prisma.download.deleteMany();

  await prisma.favorite.deleteMany();

  await prisma.wallpaper.deleteMany();

  await prisma.tag.deleteMany();

  await prisma.category.deleteMany();

  await prisma.userSession.deleteMany();

  await prisma.user.deleteMany();

  await prisma.role.deleteMany();

  console.log("✅ Old data removed");

  // ==========================================
  // ROLES
  // ==========================================

  const adminRole = await prisma.role.create({
    data: {
      name: "ADMIN",
      description: "System Administrator",
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: "USER",
      description: "Application User",
    },
  });

  console.log("✅ Roles created");

  // ==========================================
  // USERS
  // ==========================================

  const admin = await prisma.user.create({
    data: {
      email: "admin@vividwalls.com",

      username: "Administrator",

      passwordHash: await bcrypt.hash(
        "Admin123",
        10
      ),

      avatarUrl: img(
        "users",
        "admin"
      ),

      bio: "Application Administrator",

      authProvider: "LOCAL",

      isPremium: true,

      premiumUntil: new Date(
        Date.now() +
        1000 *
        60 *
        60 *
        24 *
        365
      ),

      roleId: adminRole.id,
    },
  });

  console.log(admin.id);

  const demoUser =
    await prisma.user.create({
      data: {
        email:
          "demo@vividwalls.com",

        username:
          "Demo User",

        passwordHash:
          await bcrypt.hash(
            "Password123",
            10
          ),

        avatarUrl: img(
          "users",
          "demo"
        ),

        bio:
          "Wallpaper Lover",

        authProvider:
          "LOCAL",

        isPremium: true,

        premiumUntil:
          new Date(
            Date.now() +
            1000 *
            60 *
            60 *
            24 *
            365
          ),

        roleId:
          userRole.id,
      },
    });

  console.log("✅ Users created");

  // ==========================================
  // CATEGORY MAP
  // ==========================================

  const categoryMap =
    new Map<
      string,
      string
    >();

  // ==========================================
  // TAG MAP
  // ==========================================

  const tagMap =
    new Map<
      string,
      string
    >();

  // ==========================================
  // CATEGORIES
  // ==========================================

  console.log("📁 Creating Categories...");

  let sortOrder = 1;

  for (const category of CATEGORIES) {
    const created =
      await prisma.category.create({
        data: {
          name: category.name,

          slug: category.slug,

          folderName:
            category.folderName,

          icon: category.icon,

          description:
            category.description,

          coverImage: img(
            category.folderName,
            "cover"
          ),

          thumbnailUrl: img(
            category.folderName,
            "thumbnail"
          ),

          wallpaperCount: 0,

          active: true,

          sortOrder:
            sortOrder++,
        },
      });

    categoryMap.set(
      category.slug,
      created.id
    );
  }

  console.log(
    `✅ ${categoryMap.size} Categories created`
  );

  // ==========================================
  // TAGS
  // ==========================================

  console.log("🏷 Creating Tags...");

  for (const tag of TAGS) {
    const created =
      await prisma.tag.create({
        data: {
          name: tag,
        },
      });

    tagMap.set(
      tag,
      created.id
    );
  }

  console.log(
    `✅ ${tagMap.size} Tags created`
  );

  // ==========================================
  // WALLPAPER MAP
  // ==========================================

  const wallpaperMap =
    new Map<
      string,
      string
    >();

  // ==========================================
  // WALLPAPERS
  // ==========================================

  console.log("🖼 Creating Wallpapers...");

  let featuredOrder = 1;

  for (const wallpaper of WALLPAPERS) {
    const slug = slugify(
      wallpaper.title
    );

    const categoryId =
      categoryMap.get(
        wallpaper.category
      )!;

    const originalPath = img(
      wallpaper.category,
      `${slug}-original`
    );

    const displayPath = img(
      wallpaper.category,
      `${slug}-display`
    );

    const thumbnailPath = img(
      wallpaper.category,
      `${slug}-thumb`
    );

    const created =
      await prisma.wallpaper.create({
        data: {
          title: wallpaper.title,

          slug,

          description:
            `${wallpaper.title} Wallpaper`,

          categoryId,

          originalPath,

          displayPath,

          thumbnailPath,

          originalName:
            `${slug}.jpg`,

          fileName:
            `${slug}.webp`,

          mimeType:
            "image/webp",

          extension:
            ".webp",

          width: 1440,

          height: 2560,

          aspectRatio:
            1440 / 2560,

          originalSize:
            3200000,

          displaySize:
            780000,

          thumbnailSize:
            95000,

          quality:
            WallpaperQuality.UHD_4K,

          format:
            "webp",

          isPremium:
            wallpaper.premium,

          isFeatured:
            wallpaper.featured,

          featuredOrder:
            wallpaper.featured
              ? featuredOrder++
              : 0,

          featuredAt:
            wallpaper.featured
              ? new Date()
              : null,

          active: true,

          likeCount:
            Math.floor(
              Math.random() * 500
            ),

          downloadCount:
            Math.floor(
              Math.random() * 2000
            ),

          viewCount:
            Math.floor(
              Math.random() * 10000
            ),

          dominantColor:
            "#202020",

          searchableText:
            `${wallpaper.title} ${wallpaper.category}`,

          checksum:
            checksum(),

          blurHash:
            "LKO2?U%2Tw=w]~RBVZRi};RPxuwH",

          cacheVersion: 1,

          status:
            UploadStatus.READY,
        },
      });

    wallpaperMap.set(
      slug,
      created.id
    );

    // =====================================
    // VARIANTS
    // =====================================

    await prisma.wallpaperVariant.createMany({
      data: [
        {
          wallpaperId:
            created.id,

          type:
            VariantType.ORIGINAL,

          url:
            originalPath,

          width: 1440,

          height: 2560,

          size:
            3200000,

          format:
            ImageFormat.WEBP,

          compressionQuality:
            100,

          isDefault: false,
        },

        {
          wallpaperId:
            created.id,

          type:
            VariantType.DISPLAY,

          url:
            displayPath,

          width: 1080,

          height: 1920,

          size:
            780000,

          format:
            ImageFormat.WEBP,

          compressionQuality:
            82,

          isDefault: true,
        },

        {
          wallpaperId:
            created.id,

          type:
            VariantType.THUMBNAIL,

          url:
            thumbnailPath,

          width: 420,

          height: 720,

          size:
            95000,

          format:
            ImageFormat.WEBP,

          compressionQuality:
            70,

          isDefault: false,
        },
      ],
    });

    // =====================================
    // RANDOM TAGS
    // =====================================

    const randomTags =
      TAGS.sort(
        () => 0.5 - Math.random()
      ).slice(0, 3);

    await prisma.wallpaperTag.createMany({
      data: randomTags.map(
        (tag) => ({
          wallpaperId:
            created.id,

          tagId:
            tagMap.get(tag)!,
        })
      ),
    });

    // =====================================
    // UPDATE CATEGORY COUNT
    // =====================================

    await prisma.category.update({
      where: {
        id: categoryId,
      },

      data: {
        wallpaperCount: {
          increment: 1,
        },
      },
    });
  }

  console.log(
    `✅ ${wallpaperMap.size} Wallpapers created`
  );

  // ==========================================
  // DEMO WALLPAPERS
  // ==========================================

  const wallpaperIds = Array.from(
    wallpaperMap.values()
  );

  // ==========================================
  // FAVORITES
  // ==========================================

  console.log("❤️ Creating Favorites...");

  await prisma.favorite.createMany({
    data: [
      {
        userId: demoUser.id,
        wallpaperId: wallpaperIds[0],
      },
      {
        userId: demoUser.id,
        wallpaperId: wallpaperIds[2],
      },
      {
        userId: demoUser.id,
        wallpaperId: wallpaperIds[4],
      },
    ],
    skipDuplicates: true,
  });

  await prisma.user.update({
    where: {
      id: demoUser.id,
    },
    data: {
      favoriteCount: 3,
    },
  });

  // ==========================================
  // WALLPAPER LIKES
  // ==========================================

  console.log("👍 Creating Likes...");

  await prisma.wallpaperLike.createMany({
    data: [
      {
        userId: demoUser.id,
        wallpaperId: wallpaperIds[0],
      },
      {
        userId: demoUser.id,
        wallpaperId: wallpaperIds[1],
      },
    ],
    skipDuplicates: true,
  });

  // ==========================================
  // DOWNLOAD HISTORY
  // ==========================================

  console.log("⬇ Creating Downloads...");

  await prisma.download.createMany({
    data: [
      {
        userId: demoUser.id,
        wallpaperId: wallpaperIds[0],
        quality: WallpaperQuality.UHD_4K,
      },
      {
        userId: demoUser.id,
        wallpaperId: wallpaperIds[3],
        quality: WallpaperQuality.FULL_HD,
      },
    ],
  });

  // ==========================================
  // PREMIUM SUBSCRIPTION
  // ==========================================

  console.log("💎 Creating Subscription...");

  await prisma.subscription.create({
    data: {
      userId: demoUser.id,

      plan: SubscriptionPlan.YEARLY,

      platform:
        SubscriptionPlatform.GOOGLE,

      purchaseToken:
        crypto.randomUUID(),

      transactionId:
        crypto.randomUUID(),

      amount: 999,

      currency: "INR",

      startDate: new Date(),

      endDate: new Date(
        Date.now() +
        1000 *
        60 *
        60 *
        24 *
        365
      ),

      active: true,
    },
  });

  console.log("");
  console.log("=====================================");
  console.log("🌱 Database Seeded Successfully");
  console.log("=====================================");
  console.log(`Roles        : 2`);
  console.log(`Users        : 2`);
  console.log(`Categories   : ${categoryMap.size}`);
  console.log(`Tags         : ${tagMap.size}`);
  console.log(`Wallpapers   : ${wallpaperMap.size}`);
  console.log(`Variants     : ${wallpaperMap.size * 3}`);
  console.log(`Favorites    : 3`);
  console.log(`Downloads    : 2`);
  console.log(`Subscription : 1`);
  console.log("=====================================");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });