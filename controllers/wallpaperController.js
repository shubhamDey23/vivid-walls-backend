const WallpaperModel = require('../models/wallpaperModel');

// Helper to construct full URLs for video and image fields if they are local routes
const formatUrl = (req, path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol || 'http';
  return `${protocol}://${host}${path}`;
};

class WallpaperController {
  // GET /api/wallpapers
  static async getAllWallpapers(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = parseInt(req.query.offset, 10) || 0;
      const search = req.query.search || '';
      const category = req.query.category || '';

      const data = await WallpaperModel.getAll({ limit, offset, search, category });

      // Map paths to absolute URLs so the Android app can fetch them easily
      const formattedWallpapers = data.wallpapers.map(w => ({
        ...w,
        video_url: formatUrl(req, w.video_url),
        thumbnail_url: formatUrl(req, w.thumbnail_url)
      }));

      res.status(200).json({
        success: true,
        data: formattedWallpapers,
        pagination: {
          total: data.totalCount,
          limit: data.limit,
          offset: data.offset,
          hasMore: data.offset + data.wallpapers.length < data.totalCount
        }
      });
    } catch (error) {
      console.error('Error fetching wallpapers:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error while fetching wallpapers',
        error: error.message
      });
    }
  }

  // GET /api/wallpapers/:id
  static async getWallpaperById(req, res) {
    try {
      const { id } = req.params;
      const wallpaper = await WallpaperModel.getById(id);

      if (!wallpaper) {
        return res.status(404).json({
          success: false,
          message: `Wallpaper with ID ${id} not found`
        });
      }

      res.status(200).json({
        success: true,
        data: {
          ...wallpaper,
          video_url: formatUrl(req, wallpaper.video_url),
          thumbnail_url: formatUrl(req, wallpaper.thumbnail_url)
        }
      });
    } catch (error) {
      console.error(`Error fetching wallpaper ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message
      });
    }
  }

  // GET /api/categories
  static async getCategories(req, res) {
    try {
      const categories = await WallpaperModel.getCategories();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error while fetching categories',
        error: error.message
      });
    }
  }

  // POST /api/favorites
  static async addFavorite(req, res) {
    try {
      const { wallpaper_id } = req.body;
      if (!wallpaper_id) {
        return res.status(400).json({
          success: false,
          message: 'body wrapper must contain "wallpaper_id"'
        });
      }

      // Check if wallpaper exists
      const wallpaperExists = await WallpaperModel.getById(wallpaper_id);
      if (!wallpaperExists) {
        return res.status(404).json({
          success: false,
          message: `Wallpaper with ID ${wallpaper_id} does not exist.`
        });
      }

      const favorite = await WallpaperModel.addFavorite(wallpaper_id);
      res.status(201).json({
        success: true,
        message: 'Wallpaper added to favorites successfully',
        data: favorite
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error while adding favorite',
        error: error.message
      });
    }
  }

  // GET /api/favorites
  static async getFavorites(req, res) {
    try {
      const favorites = await WallpaperModel.getFavorites();
      const formattedFavorites = favorites.map(w => ({
        ...w,
        video_url: formatUrl(req, w.video_url),
        thumbnail_url: formatUrl(req, w.thumbnail_url)
      }));

      res.status(200).json({
        success: true,
        data: formattedFavorites
      });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error while obtaining favorite list',
        error: error.message
      });
    }
  }
}

module.exports = WallpaperController;
