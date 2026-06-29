import { Request, Response } from 'express';
import { favoriteService } from '../services/favorite.service';
import { toWallpaperDTO } from '../utils/dto';
import { response, buildPagination } from '../utils/ApiResponse';

export const favoriteController = {
  async list(req: Request, res: Response) {
    const { limit, offset } = req.query as unknown as {
      limit: number;
      offset: number;
    };
    const { items, total } = await favoriteService.list(
      req.user!.id,
      limit,
      offset,
    );
    response.success(
      res,
      items.map((w) => toWallpaperDTO(req, w)),
      { pagination: buildPagination(total, limit, offset, items.length) },
    );
  },

  async add(req: Request, res: Response) {
    const { wallpaperId } = req.body as { wallpaperId: string };
    await favoriteService.add(req.user!.id, wallpaperId);
    response.success(res, { wallpaperId }, { status: 201, message: 'Added to favorites' });
  },

  async remove(req: Request, res: Response) {
    const result = await favoriteService.remove(
      req.user!.id,
      req.params.wallpaperId,
    );
    response.success(res, result, { message: 'Removed from favorites' });
  },
};
