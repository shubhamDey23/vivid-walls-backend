import { Router } from "express";

import { wallpaperController } from "../controllers/wallpaper.controller";

import { upload } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";

import { asyncHandler } from "../utils/asyncHandler";

import {
  wallpaperIdParams,
  wallpaperSlugParams,
  wallpaperListQuery,
  wallpaperSearchQuery,
  createWallpaperBody,
  updateWallpaperBody,
} from "../validations/wallpaper.validation";

const router = Router();

// ======================================================
// LIST
// GET /api/wallpapers
// ======================================================

router.get(
  "/",
  validate({
    query: wallpaperListQuery,
  }),
  asyncHandler(wallpaperController.list)
);

// ======================================================
// FEATURED
// GET /api/wallpapers/featured
// ======================================================

router.get(
  "/featured",
  asyncHandler(wallpaperController.featured)
);

// ======================================================
// PREMIUM
// GET /api/wallpapers/premium
// ======================================================

router.get(
  "/premium",
  asyncHandler(wallpaperController.premium)
);

// ======================================================
// SEARCH
// GET /api/wallpapers/search
// ======================================================

router.get(
  "/search",
  validate({
    query: wallpaperSearchQuery,
  }),
  asyncHandler(wallpaperController.search)
);

// ======================================================
// CATEGORY WALLPAPERS
// GET /api/wallpapers/category/:slug
// ======================================================

router.get(
  "/category/:slug",
  validate({
    params: wallpaperSlugParams,
    query: wallpaperListQuery,
  }),
  asyncHandler(wallpaperController.getByCategory)
);

// ======================================================
// GET BY SLUG
// GET /api/wallpapers/slug/:slug
// ======================================================

router.get(
  "/slug/:slug",
  validate({
    params: wallpaperSlugParams,
  }),
  asyncHandler(wallpaperController.getBySlug)
);

// ======================================================
// GET BY ID
// GET /api/wallpapers/:id
// ======================================================

router.get(
  "/:id",
  validate({
    params: wallpaperIdParams,
  }),
  asyncHandler(wallpaperController.getById)
);

// ======================================================
// RELATED WALLPAPERS
// GET /api/wallpapers/:id/related
// ======================================================

router.get(
  "/:id/related",
  validate({
    params: wallpaperIdParams,
  }),
  asyncHandler(wallpaperController.related)
);

// ======================================================
// CREATE
// POST /api/wallpapers
// multipart/form-data
// image => file
// ======================================================

router.post(
  "/",
  upload.single("image"),
  validate({
    body: createWallpaperBody,
  }),
  asyncHandler(wallpaperController.create)
);

// ======================================================
// BATCH UPLOAD
// POST /api/wallpapers/batch
// multipart/form-data
// images => files
// ======================================================

router.post(
  "/batch",
  upload.array("images", 50),
  asyncHandler(wallpaperController.batchUpload)
);

// ======================================================
// UPDATE
// PUT /api/wallpapers/:id
// ======================================================

router.put(
  "/:id",
  validate({
    params: wallpaperIdParams,
    body: updateWallpaperBody,
  }),
  asyncHandler(wallpaperController.update)
);

// ======================================================
// DELETE
// DELETE /api/wallpapers/:id
// ======================================================

router.delete(
  "/:id",
  validate({
    params: wallpaperIdParams,
  }),
  asyncHandler(wallpaperController.delete)
);

// ======================================================
// TOGGLE FEATURED
// PATCH /api/wallpapers/:id/featured
// ======================================================

router.patch(
  "/:id/featured",
  validate({
    params: wallpaperIdParams,
  }),
  asyncHandler(wallpaperController.toggleFeatured)
);

// ======================================================
// TOGGLE PREMIUM
// PATCH /api/wallpapers/:id/premium
// ======================================================

router.patch(
  "/:id/premium",
  validate({
    params: wallpaperIdParams,
  }),
  asyncHandler(wallpaperController.togglePremium)
);

// ======================================================
// TOGGLE ACTIVE
// PATCH /api/wallpapers/:id/active
// ======================================================

router.patch(
  "/:id/active",
  validate({
    params: wallpaperIdParams,
  }),
  asyncHandler(wallpaperController.toggleActive)
);

// ======================================================
// VIEW COUNT
// POST /api/wallpapers/:id/view
// ======================================================

router.post(
  "/:id/view",
  validate({
    params: wallpaperIdParams,
  }),
  asyncHandler(wallpaperController.incrementViews)
);

// ======================================================
// DOWNLOAD COUNT
// POST /api/wallpapers/:id/download
// ======================================================

router.post(
  "/:id/download",
  validate({
    params: wallpaperIdParams,
  }),
  asyncHandler(wallpaperController.incrementDownloads)
);

export default router;