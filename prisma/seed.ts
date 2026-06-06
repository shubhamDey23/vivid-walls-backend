import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Categories mirror the ones used by the React Native frontend. */
const CATEGORIES = [
  { name: 'Anime', slug: 'anime', icon: 'happy-outline' },
  { name: 'Sports', slug: 'sports', icon: 'football-outline' },
  { name: 'Nature', slug: 'nature', icon: 'leaf-outline' },
  { name: 'Cars', slug: 'cars', icon: 'car-sport-outline' },
  { name: 'Abstract', slug: 'abstract', icon: 'color-palette-outline' },
  { name: 'City', slug: 'city', icon: 'business-outline' },
  { name: 'Space', slug: 'space', icon: 'planet-outline' },
  { name: 'Minimal', slug: 'minimal', icon: 'ellipsis-horizontal-circle-outline' },
  { name: 'Typography', slug: 'typography', icon: 'text-outline' },
  { name: 'Art', slug: 'art', icon: 'brush-outline' },
  { name: 'Gaming', slug: 'gaming', icon: 'game-controller-outline' },
  { name: 'Animals', slug: 'animals', icon: 'paw-outline' },
];

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/1200`;

/** A handful of wallpapers spread across categories. */
const WALLPAPERS: Array<{
  title: string;
  categorySlug: string;
  thumb: string;
  resolution: string;
  isFeatured: boolean;
  likes: number;
  downloadCount: number;
}> = [
  { title: 'Majestic Lion', categorySlug: 'animals', thumb: 'wx-lion', resolution: '3840x2160', isFeatured: true, likes: 12500, downloadCount: 4200 },
  { title: 'Alpine Mirror', categorySlug: 'nature', thumb: 'wx-alps', resolution: '3840x2160', isFeatured: true, likes: 9800, downloadCount: 3100 },
  { title: 'Neon Avenue', categorySlug: 'city', thumb: 'wx-neon', resolution: '1920x1080', isFeatured: true, likes: 11200, downloadCount: 5300 },
  { title: 'Deep Field', categorySlug: 'space', thumb: 'wx-space', resolution: '3840x2160', isFeatured: false, likes: 7400, downloadCount: 2200 },
  { title: 'Liquid Aura', categorySlug: 'abstract', thumb: 'wx-aura', resolution: '1920x1080', isFeatured: false, likes: 6100, downloadCount: 1800 },
  { title: 'Sakura Pagoda', categorySlug: 'nature', thumb: 'wx-sakura', resolution: '1920x1080', isFeatured: false, likes: 8700, downloadCount: 2600 },
  { title: 'Sea Turtle', categorySlug: 'animals', thumb: 'wx-turtle', resolution: '1920x1080', isFeatured: false, likes: 7100, downloadCount: 1900 },
  { title: 'Rainy Downtown', categorySlug: 'city', thumb: 'wx-citynight', resolution: '3840x2160', isFeatured: false, likes: 6400, downloadCount: 2100 },
  { title: 'Super Saiyan', categorySlug: 'anime', thumb: 'wx-anime', resolution: '1920x1080', isFeatured: true, likes: 15200, downloadCount: 8800 },
  { title: 'Midnight Racer', categorySlug: 'cars', thumb: 'wx-cars', resolution: '3840x2160', isFeatured: false, likes: 9300, downloadCount: 4100 },
  { title: 'Stadium Lights', categorySlug: 'sports', thumb: 'wx-sports', resolution: '1920x1080', isFeatured: false, likes: 5200, downloadCount: 1500 },
  { title: 'Floating Sphere', categorySlug: 'minimal', thumb: 'wx-minimal', resolution: '1920x1080', isFeatured: false, likes: 4300, downloadCount: 1200 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Categories (idempotent upsert by unique slug)
  const categoryBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    });
    categoryBySlug.set(c.slug, category.id);
  }
  console.log(`   ✓ ${CATEGORIES.length} categories`);

  // 2. Wallpapers — only seed when the table is empty to avoid duplicates
  const existingCount = await prisma.wallpaper.count();
  if (existingCount === 0) {
    for (const w of WALLPAPERS) {
      const categoryId = categoryBySlug.get(w.categorySlug);
      if (!categoryId) continue;
      await prisma.wallpaper.create({
        data: {
          title: w.title,
          videoUrl: img(w.thumb), // placeholder media URL
          thumbnailUrl: img(w.thumb),
          resolution: w.resolution,
          isFeatured: w.isFeatured,
          likes: w.likes,
          downloadCount: w.downloadCount,
          categoryId,
        },
      });
    }
    console.log(`   ✓ ${WALLPAPERS.length} wallpapers`);
  } else {
    console.log(`   • ${existingCount} wallpapers already present, skipping`);
  }

  // 3. Demo user — login with demo@vividwalls.app / Password123
  const passwordHash = await bcrypt.hash('Password123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@vividwalls.app' },
    update: {},
    create: {
      email: 'demo@vividwalls.app',
      username: 'Ethan Hunt',
      passwordHash,
      bio: 'Wallpaper lover and explorer ✨',
      isPremium: true,
      avatarUrl: img('wx-avatar'),
    },
  });
  console.log('   ✓ demo user (demo@vividwalls.app / Password123)');

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
