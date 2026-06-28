import { Prisma } from '@prisma/client';

import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

const withCategory = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnailUrl: true,
    },
  },
};

type CreateCategoryInput = {
  name: string;
  slug?: string;
  thumbnailUrl?: string | null;
};

type UpdateCategoryInput = {
  name?: string;
  slug?: string;
  thumbnailUrl?: string | null;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const categoryService = {
  async list() {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },

      include: {
        _count: {
          select: {
            wallpapers: true,
          },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,

      name: c.name,

      slug: c.slug,

      thumbnailUrl: c.thumbnailUrl,

      createdAt: c.createdAt,

      count: c._count.wallpapers,
    }));
  },

  async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: {
        slug,
      },

      include: {
        _count: {
          select: {
            wallpapers: true,
          },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound(`Category '${slug}' not found`);
    }

    return {
      id: category.id,

      name: category.name,

      slug: category.slug,

      thumbnailUrl: category.thumbnailUrl,

      createdAt: category.createdAt,

      count: category._count.wallpapers,
    };
  },

  async create(data: CreateCategoryInput) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    if (!slug) {
      throw ApiError.badRequest('Valid category slug is required');
    }

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),

        slug,

        thumbnailUrl: data.thumbnailUrl ?? null,
      },

      include: {
        _count: {
          select: {
            wallpapers: true,
          },
        },
      },
    });

    return {
      id: category.id,

      name: category.name,

      slug: category.slug,

      thumbnailUrl: category.thumbnailUrl,

      createdAt: category.createdAt,

      count: category._count.wallpapers,
    };
  },

  async update(slug: string, data: UpdateCategoryInput) {
    await this.getBySlug(slug);

    const updateData: Prisma.CategoryUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.slug !== undefined) {
      const nextSlug = slugify(data.slug);

      if (!nextSlug) {
        throw ApiError.badRequest('Valid category slug is required');
      }

      updateData.slug = nextSlug;
    }

    if (data.thumbnailUrl !== undefined) {
      updateData.thumbnailUrl = data.thumbnailUrl;
    }

    const category = await prisma.category.update({
      where: {
        slug,
      },

      data: updateData,

      include: {
        _count: {
          select: {
            wallpapers: true,
          },
        },
      },
    });

    return {
      id: category.id,

      name: category.name,

      slug: category.slug,

      thumbnailUrl: category.thumbnailUrl,

      createdAt: category.createdAt,

      count: category._count.wallpapers,
    };
  },

  async delete(slug: string) {
    const category = await this.getBySlug(slug);

    await prisma.category.delete({
      where: {
        slug,
      },
    });

    return {
      deleted: true,

      category,
    };
  },

  async getWallpapers(slug: string, limit: number, offset: number) {
    const category = await this.getBySlug(slug);

    const where = {
      categoryId: category.id,
      active: true,
    };

    const [items, total] = await Promise.all([
      prisma.wallpaper.findMany({
        where,

        include: withCategory,

        orderBy: {
          createdAt: 'desc',
        },

        skip: offset,

        take: limit,
      }),

      prisma.wallpaper.count({
        where,
      }),
    ]);

    return {
      category,

      items,

      total,
    };
  },
};