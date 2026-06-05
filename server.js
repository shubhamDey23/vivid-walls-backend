const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const wallpaperRoutes = require('./routes/wallpaperRoutes');
const WallpaperModel = require('./models/wallpaperModel');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing middle-wares
app.use(cors());
app.use(express.json());

// Serve videos static folder
// If executing mock/local files, make sure the user has a directory prepared

const videosDir = path.join(__dirname, 'videos');
const imagesDir = path.join(__dirname, 'images');

app.use('/videos', express.static(videosDir));
app.use('/images', express.static(imagesDir));

// Connect and Setup Tables on Start if postgres is available
async function initializeDatabase() {
  try {
    // Generate Table structure
    console.log('Initializing PostgreSQL Database Schemas...');
    
    // Create wallpapers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wallpapers (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        category TEXT,
        resolution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create favorites table
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY,
        wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
        UNIQUE(wallpaper_id)
      )
    `);

    console.log('Database tables verified/created successfully.');
    
    // Seed database if empty
    await WallpaperModel.seedIfEmpty();
  } catch (error) {
    console.error('Failed to initialize database schema:', error.message);
    console.log('To run locally: Ensure PostgreSQL is running and credentials in your .env are correct.');
  }
}

// REST API endpoint registration
app.use('/api', wallpaperRoutes);

// Root Hello Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Live Wallpaper Local Server is running!',
    api_docs: {
      all_wallpapers: `/api/wallpapers`,
      single_wallpaper: `/api/wallpapers/:id`,
      get_categories: `/api/categories`,
      all_favorites: `/api/favorites`,
      post_favorites: `/api/favorites (body: { "wallpaper_id": "uuid" })`
    }
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running beautifully on http://localhost:${PORT}`);
  await initializeDatabase();
});
