-- Live Wallpaper Database Schema for PostgreSQL

-- Enable the uuid-ossp or pgcrypto extension for automated UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Wallpapers Table
CREATE TABLE IF NOT EXISTS wallpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category VARCHAR(100) NOT NULL,
    resolution VARCHAR(50) DEFAULT '1080p',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on category and title (for low-latency search/filters and pagination)
CREATE INDEX IF NOT EXISTS idx_wallpapers_category ON wallpapers(category);
CREATE INDEX IF NOT EXISTS idx_wallpapers_title_trgm ON wallpapersUsing gin (title gin_trgm_ops) WITH (vacuum_index_cleanup = OFF); -- optional trigram if pg_trgm is loaded
-- Standard index for title searches
CREATE INDEX IF NOT EXISTS idx_wallpapers_title ON wallpapers(title);

-- 2. Create Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallpaper_id UUID NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
    UNIQUE(wallpaper_id)
);

-- Index on favorites wallpaper matching
CREATE INDEX IF NOT EXISTS idx_favorites_wallpaper_id ON favorites(wallpaper_id);


-------------------------------------------------------------------------------
-- COMMON QUERIES & CRUD OPERATIONS REFERENCE
-------------------------------------------------------------------------------

-- 1. Insert Wallpaper Item
-- INSERT INTO wallpapers (id, title, video_url, thumbnail_url, category, resolution, created_at)
-- VALUES ('a1b1c1d1-1111-4111-a111-111111111111', 'Nebula Drift', '/videos/nebula_drift.mp4', '/videos/nebula_drift_thumb.jpg', 'Sci-Fi', '3840x2160', NOW());

-- 2. Add Wallpaper to Favorites (Ignoring duplicates)
-- INSERT INTO favorites (id, wallpaper_id)
-- VALUES (gen_random_uuid(), 'a1b1c1d1-1111-4111-a111-111111111111')
-- ON CONFLICT (wallpaper_id) DO NOTHING;

-- 3. Fetch All Wallpapers (with Category Filter, Search and Pagination)
-- SELECT * FROM wallpapers 
-- WHERE category = 'Nature' AND title ILIKE '%Kyoto%'
-- ORDER BY created_at DESC 
-- LIMIT 10 OFFSET 0;

-- 4. Get All Favorites Joined with Wallpaper Metadata
-- SELECT w.* 
-- FROM wallpapers w
-- INNER JOIN favorites f ON w.id = f.wallpaper_id
-- ORDER BY w.created_at DESC;

-- 5. Remove Wallpaper from Favorites
-- DELETE FROM favorites WHERE wallpaper_id = 'a1b1c1d1-1111-4111-a111-111111111111';
