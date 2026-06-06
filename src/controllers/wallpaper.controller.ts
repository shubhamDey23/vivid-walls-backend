import { Request, Response } from 'express';
import { wallpaperService } from '../services/wallpaper.service';
import { toWallpaperDTO } from '../utils/dto';
import { sendSuccess, buildPagination } from '../utils/ApiResponse';

export const wallpaperController = {
  async list(req: Request, res: Response) {
    const { limit, offset, search, category } = req.query as unknown as {
      limit: number;
      offset: number;
      search?: string;
      category?: string;
    };
    const { items, total } = await wallpaperService.list({
      limit,
      offset,
      search,
      category,
    });
    sendSuccess(
      res,
      items.map((w) => toWallpaperDTO(req, w)),
      { pagination: buildPagination(total, limit, offset, items.length) },
    );
  },

  async featured(req: Request, res: Response) {
    const { limit } = req.query as unknown as { limit: number };
    const items = await wallpaperService.getFeatured(limit);
    sendSuccess(res, items.map((w) => toWallpaperDTO(req, w)));
  },

  async trending(req: Request, res: Response) {
    const { limit } = req.query as unknown as { limit: number };
    const items = await wallpaperService.getTrending(limit);
    sendSuccess(res, items.map((w) => toWallpaperDTO(req, w)));
  },

  async getById(req: Request, res: Response) {
    const wallpaper = await wallpaperService.getById(req.params.id);
    sendSuccess(res, toWallpaperDTO(req, wallpaper));
  },
};
