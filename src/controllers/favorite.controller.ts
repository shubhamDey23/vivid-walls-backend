import { Request, Response } from "express";

import { favoriteService } from "../services/favorite.service";

import { toWallpaperDTO } from "../utils/dto";

import {
  response,
  buildPagination,
} from "../utils/ApiResponse";

export const favoriteController = {
  // =====================================
  // LIST FAVORITES
  // =====================================

  async list(
    req: Request,
    res: Response
  ) {
    const { limit, offset } =
      req.query as unknown as {
        limit: number;
        offset: number;
      };

    const { items, total } =
      await favoriteService.list(
        req.user!.id,
        limit,
        offset
      );

    response.success(
      res,
      items.map((wallpaper) =>
        toWallpaperDTO(
          req,
          wallpaper
        )
      ),
      {
        pagination:
          buildPagination(
            total,
            limit,
            offset,
            items.length
          ),
      }
    );
  },

  // =====================================
  // ADD FAVORITE
  // =====================================

  async add(
    req: Request,
    res: Response
  ) {
    const { wallpaperId } =
      req.body as {
        wallpaperId: string;
      };

    await favoriteService.add(
      req.user!.id,
      wallpaperId
    );

    response.success(
      res,
      {
        wallpaperId,
      },
      {
        status: 201,
        message:
          "Added to favorites",
      }
    );
  },

  // =====================================
  // REMOVE FAVORITE
  // =====================================

  async remove(
    req: Request,
    res: Response
  ) {
    const result =
      await favoriteService.remove(
        req.user!.id,
        req.params.wallpaperId
      );

    response.success(
      res,
      result,
      {
        message:
          "Removed from favorites",
      }
    );
  },

  // =====================================
  // TOGGLE FAVORITE
  // =====================================

  async toggle(
    req: Request,
    res: Response
  ) {
    const result =
      await favoriteService.toggle(
        req.user!.id,
        req.params.wallpaperId
      );

    response.success(
      res,
      result,
      {
        message:
          result.favorite
            ? "Added to favorites"
            : "Removed from favorites",
      }
    );
  },

  // =====================================
  // FAVORITE STATUS
  // =====================================

  async status(
    req: Request,
    res: Response
  ) {
    const result =
      await favoriteService.isFavorite(
        req.user!.id,
        req.params.wallpaperId
      );

    response.success(
      res,
      result
    );
  },
};