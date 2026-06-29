import { Router } from "express";

import { favoriteController } from "../controllers/favorite.controller";

import { authenticate } from "../middlewares/auth.middleware";

import { validate } from "../middlewares/validate.middleware";

import { asyncHandler } from "../utils/asyncHandler";

import {
  favoriteListQuery,
  addFavoriteBody,
  favoriteParams,
} from "../validations/favorite.validation";

const router = Router();

// ======================================
// AUTH REQUIRED
// ======================================

router.use(authenticate);

// ======================================
// LIST FAVORITES
// GET /api/favorites
// ======================================

router.get(
  "/",
  validate({
    query: favoriteListQuery,
  }),
  asyncHandler(
    favoriteController.list
  )
);

// ======================================
// ADD FAVORITE
// POST /api/favorites
// ======================================

router.post(
  "/",
  validate({
    body: addFavoriteBody,
  }),
  asyncHandler(
    favoriteController.add
  )
);

// ======================================
// REMOVE FAVORITE
// DELETE /api/favorites/:wallpaperId
// ======================================

router.delete(
  "/:wallpaperId",
  validate({
    params: favoriteParams,
  }),
  asyncHandler(
    favoriteController.remove
  )
);

// ======================================
// TOGGLE FAVORITE
// POST /api/favorites/:wallpaperId/toggle
// ======================================

router.post(
  "/:wallpaperId/toggle",
  validate({
    params: favoriteParams,
  }),
  asyncHandler(
    favoriteController.toggle
  )
);

// ======================================
// FAVORITE STATUS
// GET /api/favorites/:wallpaperId/status
// ======================================

router.get(
  "/:wallpaperId/status",
  validate({
    params: favoriteParams,
  }),
  asyncHandler(
    favoriteController.status
  )
);

export default router;