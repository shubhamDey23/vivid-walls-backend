import { Request, Response } from 'express';

import { categoryService } from '../services/category.service';
import { toWallpaperDTO } from '../utils/dto';
import { sendSuccess, buildPagination } from '../utils/ApiResponse';
import { absoluteUrl } from '../utils/url';

const getUploadedThumbnailPath = (req: Request) => {
  const file = req.file;

  if (!file) return null;

  return `/uploads/thumbnails/${file.filename}`;
};

const formatCategory = (req: Request, category: any) => ({
  id: category.id,

  name: category.name,

  slug: category.slug,

  thumbnailUrl: category.thumbnailUrl
    ? absoluteUrl(req, category.thumbnailUrl)
    : null,

  createdAt: category.createdAt,

  count: category.count,
});

export const categoryController = {
  // =====================
  // LIST
  // GET /api/categories
  // =====================

  async list(req: Request, res: Response) {
    const categories = await categoryService.list();

    sendSuccess(
      res,
      categories.map((category) => formatCategory(req, category)),
    );
  },

  // =====================
  // DETAIL
  // GET /api/categories/:slug
  // =====================

  async getBySlug(req: Request, res: Response) {
    const category = await categoryService.getBySlug(req.params.slug);

    sendSuccess(res, formatCategory(req, category));
  },

  // =====================
  // CREATE
  // POST /api/categories
  // form-data:
  // name
  // slug
  // thumbnail
  // =====================

  async create(req: Request, res: Response) {
    const uploadedThumbnailPath = getUploadedThumbnailPath(req);

    const category = await categoryService.create({
      name: req.body.name,

      slug: req.body.slug,

      thumbnailUrl:
        uploadedThumbnailPath ||
        req.body.thumbnailUrl ||
        null,
    });

    sendSuccess(res, formatCategory(req, category), {
      status: 201,

      message: 'Category created',
    });
  },

  // =====================
  // UPDATE
  // PUT /api/categories/:slug
  // form-data:
  // name
  // slug
  // thumbnail
  // =====================

  async update(req: Request, res: Response) {
    const uploadedThumbnailPath = getUploadedThumbnailPath(req);

    const category = await categoryService.update(req.params.slug, {
      name: req.body.name,

      slug: req.body.slug,

      thumbnailUrl:
        uploadedThumbnailPath ||
        req.body.thumbnailUrl,
    });

    sendSuccess(res, formatCategory(req, category), {
      message: 'Category updated',
    });
  },

  // =====================
  // DELETE
  // DELETE /api/categories/:slug
  // =====================

  async delete(req: Request, res: Response) {
    const result = await categoryService.delete(req.params.slug);

    sendSuccess(
      res,
      {
        deleted: true,

        category: formatCategory(req, result.category),
      },
      {
        message: 'Category deleted',
      },
    );
  },

  // =====================
  // CATEGORY WALLPAPERS
  // GET /api/categories/:slug/wallpapers
  // =====================

  async wallpapers(req: Request, res: Response) {
    const { limit, offset } = req.query as unknown as {
      limit: number;
      offset: number;
    };

    const { category, items, total } = await categoryService.getWallpapers(
      req.params.slug,
      limit,
      offset,
    );

    sendSuccess(
      res,
      {
        category: formatCategory(req, category),

        wallpapers: items.map((w) => toWallpaperDTO(req, w)),
      },
      {
        pagination: buildPagination(total, limit, offset, items.length),
      },
    );
  },
};