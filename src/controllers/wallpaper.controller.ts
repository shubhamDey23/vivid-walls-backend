import { Request, Response } from "express";

import { wallpaperService } from "../services/wallpaper.service";

import { response, buildPagination } from "../utils/ApiResponse";

import { ApiError } from "../utils/ApiError";

import { toWallpaperDTO } from "../utils/dto";

import { WallpaperQuality } from "@prisma/client";



export const wallpaperController = {

  // ======================================================
  // LIST
  // ======================================================

  async list(
    req: Request,
    res: Response
  ) {

    console.log("request ",req.query);

    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);

    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    const premium =
      req.query.premium as boolean | undefined;

    const featured =
      req.query.featured as boolean | undefined;

    const active =
      req.query.active as boolean | undefined;

      console.log("Active status ",active);

    const quality =
      req.query.quality as WallpaperQuality | undefined;

    const sort =
      req.query.sort as
      | "latest"
      | "popular"
      | "downloads"
      | "likes"
      | "featured";

    const { items, total } =
      await wallpaperService.list({
        limit,
        offset,
        search,
        category,
        premium,
        featured,
        active,
        quality,
        sort,
      });

    response.success(
      res,
      items.map((wallpaper) =>
        toWallpaperDTO(req, wallpaper)
      ),
      {
        pagination: buildPagination(
          total,
          limit,
          offset,
          items.length
        ),
      }
    );
  },


  // ======================================================
  // FEATURED
  // ======================================================

  async featured(
    req: Request,
    res: Response
  ) {
    const limit =
      Number(req.query.limit) || 10;

    const wallpapers =
      await wallpaperService.getFeatured(
        limit
      );

    response.success(
      res,
      wallpapers.map((wallpaper) =>
        toWallpaperDTO(
          req,
          wallpaper
        )
      )
    );
  },

  async trending(
    req: Request,
    res: Response
  ) {
    const limit = Number(req.query.limit) || 20;

    const wallpapers = await wallpaperService.getTrending(limit);

    res.json({
      success: true,
      data: wallpapers,
    });
  },

  // ======================================================
  // PREMIUM
  // ======================================================

  async premium(
    req: Request,
    res: Response
  ) {
    const limit =
      Number(req.query.limit) || 20;

    const wallpapers =
      await wallpaperService.getPremium(
        limit
      );

    response.success(
      res,
      wallpapers.map((wallpaper) =>
        toWallpaperDTO(
          req,
          wallpaper
        )
      )
    );
  },

  // ======================================================
  // GET BY ID
  // ======================================================

  async getById(
    req: Request,
    res: Response
  ) {
    const wallpaper =
      await wallpaperService.getById(
        req.params.id
      );

    response.success(
      res,
      toWallpaperDTO(
        req,
        wallpaper
      )
    );
  },

  // ======================================================
  // GET BY SLUG
  // ======================================================

  async getBySlug(
    req: Request,
    res: Response
  ) {
    const wallpaper =
      await wallpaperService.getBySlug(
        req.params.slug
      );

    response.success(
      res,
      toWallpaperDTO(
        req,
        wallpaper
      )
    );
  },

  // ======================================================
  // GET BY CATEGORY
  // ======================================================

  async getByCategory(
    req: Request,
    res: Response
  ) {
    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);

    const {
      category,
      items,
      total,
    } =
      await wallpaperService.getByCategory(
        req.params.slug,
        limit,
        offset
      );

    response.success(
      res,
      {
        category,

        wallpapers: items.map(
          (wallpaper) =>
            toWallpaperDTO(
              req,
              wallpaper
            )
        ),
      },
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

  // ======================================================
  // SEARCH
  // ======================================================

  async search(
    req: Request,
    res: Response
  ) {
    const q = req.query.q as string;

    const limit = Number(req.query.limit);

    const offset = Number(req.query.offset);

    const {
      items,
      total,
    } =
      await wallpaperService.search(
        q,
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

  // ======================================================
  // RELATED
  // ======================================================

  async related(
    req: Request,
    res: Response
  ) {
    const limit =
      Number(req.query.limit) || 10;

    const wallpapers =
      await wallpaperService.related(
        req.params.id,
        limit
      );

    response.success(
      res,
      wallpapers.map(
        (wallpaper) =>
          toWallpaperDTO(
            req,
            wallpaper
          )
      )
    );
  },

  // ======================================================
  // CREATE
  // ======================================================

  async create(
    req: Request,
    res: Response
  ) {
    if (!req.file) {
      throw ApiError.badRequest(
        "Wallpaper image is required."
      );
    }

    const wallpaper =
      await wallpaperService.create(
        req.file,
        req.body
      );

    response.created(
      res,
      toWallpaperDTO(
        req,
        wallpaper
      ),
      "Wallpaper uploaded successfully."
    );
  },

  // ======================================================
  // BATCH UPLOAD
  // ======================================================

  async batchUpload(
    req: Request,
    res: Response
  ) {
    const files =
      req.files as Express.Multer.File[];

    if (
      !files ||
      files.length === 0
    ) {
      throw ApiError.badRequest(
        "Wallpaper images are required."
      );
    }

    const wallpapers =
      await wallpaperService.createMany(
        files,
        req.body
      );

    response.created(
      res,
      wallpapers.map(
        wallpaper =>
          toWallpaperDTO(
            req,
            wallpaper
          )
      ),
      `${wallpapers.length} wallpapers uploaded successfully.`
    );
  },

  // ======================================================
  // UPDATE
  // ======================================================

  async update(
    req: Request,
    res: Response
  ) {
    const wallpaper =
      await wallpaperService.update(
        req.params.id,
        req.body
      );

    response.success(
      res,
      toWallpaperDTO(
        req,
        wallpaper
      ),
      {
        message:
          "Wallpaper updated successfully.",
      }
    );
  },

  // ======================================================
  // DELETE
  // ======================================================

  async delete(
    req: Request,
    res: Response
  ) {
    await wallpaperService.delete(
      req.params.id
    );

    response.success(
      res,
      {
        deleted: true,
      },
      {
        message:
          "Wallpaper deleted successfully.",
      }
    );
  },

  // ======================================================
  // TOGGLE FEATURED
  // ======================================================

  async toggleFeatured(
    req: Request,
    res: Response
  ) {
    const wallpaper =
      await wallpaperService.toggleFeatured(
        req.params.id
      );

    response.success(
      res,
      toWallpaperDTO(
        req,
        wallpaper
      ),
      {
        message:
          wallpaper.isFeatured
            ? "Wallpaper marked as featured."
            : "Wallpaper removed from featured.",
      }
    );
  },

  // ======================================================
  // TOGGLE PREMIUM
  // ======================================================

  async togglePremium(
    req: Request,
    res: Response
  ) {
    const wallpaper =
      await wallpaperService.togglePremium(
        req.params.id
      );

    response.success(
      res,
      toWallpaperDTO(
        req,
        wallpaper
      ),
      {
        message:
          wallpaper.isPremium
            ? "Wallpaper marked as premium."
            : "Wallpaper removed from premium.",
      }
    );
  },

  // ======================================================
  // TOGGLE ACTIVE
  // ======================================================

  async toggleActive(
    req: Request,
    res: Response
  ) {
    const wallpaper =
      await wallpaperService.toggleActive(
        req.params.id
      );

    response.success(
      res,
      toWallpaperDTO(
        req,
        wallpaper
      ),
      {
        message:
          wallpaper.active
            ? "Wallpaper activated."
            : "Wallpaper deactivated.",
      }
    );
  },

  // ======================================================
  // INCREMENT VIEW COUNT
  // ======================================================

  async incrementViews(
    req: Request,
    res: Response
  ) {
    await wallpaperService.incrementViews(
      req.params.id
    );

    response.success(
      res,
      {
        success: true,
      }
    );
  },

  // ======================================================
  // INCREMENT DOWNLOAD COUNT
  // ======================================================

  async incrementDownloads(
    req: Request,
    res: Response
  ) {
    await wallpaperService.incrementDownloads(
      req.params.id
    );

    response.success(
      res,
      {
        success: true,
      }
    );
  },
};