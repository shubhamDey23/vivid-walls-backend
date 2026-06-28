import { Router } from 'express';
import { z } from 'zod';

import { categoryController } from '../controllers/category.controller';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { categoryThumbnailUpload } from '../middlewares/upload.middleware';

const router = Router();

// ==============================
// HELPERS
// ==============================

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
};

const optionalString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalNullableString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).nullable().optional(),
);

// ==============================
// VALIDATION SCHEMAS
// ==============================

const slugParam = z.object({
  slug: z.string().trim().min(1),
});

const pageQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),

  offset: z.coerce.number().int().min(0).default(0),
});

const createCategoryBody = z.object({
  name: z.string().trim().min(1),

  slug: optionalString,

  thumbnailUrl: optionalNullableString,
});

const updateCategoryBody = z.object({
  name: optionalString,

  slug: optionalString,

  thumbnailUrl: optionalNullableString,
});

// ======================================
// LIST CATEGORIES
// GET /api/categories
// ======================================

router.get(
  '/',
  asyncHandler(categoryController.list),
);

// ======================================
// CREATE CATEGORY
// POST /api/categories
// form-data field name for image: thumbnail
// ======================================

router.post(
  '/',
  categoryThumbnailUpload.single('thumbnail'),
  validate({
    body: createCategoryBody,
  }),
  asyncHandler(categoryController.create),
);

// ======================================
// GET CATEGORY WALLPAPERS
// GET /api/categories/:slug/wallpapers
// keep this before /:slug
// ======================================

router.get(
  '/:slug/wallpapers',
  validate({
    params: slugParam,

    query: pageQuery,
  }),
  asyncHandler(categoryController.wallpapers),
);

// ======================================
// GET CATEGORY BY SLUG
// GET /api/categories/:slug
// ======================================

router.get(
  '/:slug',
  validate({
    params: slugParam,
  }),
  asyncHandler(categoryController.getBySlug),
);

// ======================================
// UPDATE CATEGORY BY SLUG
// PUT /api/categories/:slug
// form-data field name for image: thumbnail
// ======================================

router.put(
  '/:slug',
  categoryThumbnailUpload.single('thumbnail'),
  validate({
    params: slugParam,

    body: updateCategoryBody,
  }),
  asyncHandler(categoryController.update),
);

// ======================================
// UPDATE CATEGORY BY SLUG
// PATCH /api/categories/:slug
// form-data field name for image: thumbnail
// ======================================

router.patch(
  '/:slug',
  categoryThumbnailUpload.single('thumbnail'),
  validate({
    params: slugParam,

    body: updateCategoryBody,
  }),
  asyncHandler(categoryController.update),
);

// ======================================
// DELETE CATEGORY BY SLUG
// DELETE /api/categories/:slug
// ======================================

router.delete(
  '/:slug',
  validate({
    params: slugParam,
  }),
  asyncHandler(categoryController.delete),
);

export default router;