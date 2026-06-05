const express = require('express');
const router = express.Router();
const WallpaperController = require('../controllers/wallpaperController');

// All Wallpapers & Categories Queries
router.get('/wallpapers', WallpaperController.getAllWallpapers);
router.get('/wallpapers/:id', WallpaperController.getWallpaperById);
router.get('/categories', WallpaperController.getCategories);

// Favorites Queries
router.post('/favorites', WallpaperController.addFavorite);
router.get('/favorites', WallpaperController.getFavorites);

module.exports = router;
