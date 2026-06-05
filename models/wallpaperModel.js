const db = require('../config/db');

class WallpaperModel {
  // Fetch all wallpapers with pagination and optional search and category filters
  static async getAll({ limit = 10, offset = 0, search = '', category = '' }) {
    let queryText = 'SELECT * FROM wallpapers';
    const params = [];
    let count = 1;
    const searchTerms = [];

    if (search) {
      searchTerms.push(`title ILIKE $${count}`);
      params.push(`%${search}%`);
      count++;
    }

    if (category) {
      searchTerms.push(`category = $${count}`);
      params.push(category);
      count++;
    }

    if (searchTerms.length > 0) {
      queryText += ' WHERE ' + searchTerms.join(' AND ');
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${count} OFFSET $${count + 1}`;
    params.push(limit, offset);

    const { rows } = await db.query(queryText, params);
    
    // Get total count for pagination metadata
    let countQuery = 'SELECT COUNT(*) FROM wallpapers';
    const countParams = [];
    if (searchTerms.length > 0) {
      countQuery += ' WHERE ' + searchTerms.join(' AND ').replace(/\$\d+/g, (match) => {
        // match format: $1, $2, etc.
        const num = parseInt(match.substring(1));
        return `$${num}`;
      });
      // countParams needs to be the filter parameters only
      if (search) countParams.push(`%${search}%`);
      if (category) countParams.push(category);
    }
    const countRes = await db.query(countQuery, countParams);
    const totalCount = parseInt(countRes.rows[0].count, 10);

    return {
      wallpapers: rows,
      totalCount,
      limit,
      offset
    };
  }

  // Fetch a single wallpaper by ID
  static async getById(id) {
    const queryText = 'SELECT * FROM wallpapers WHERE id = $1';
    const { rows } = await db.query(queryText, [id]);
    return rows[0] || null;
  }

  // Fetch all distinct categories present in the database
  static async getCategories() {
    const queryText = 'SELECT DISTINCT category FROM wallpapers WHERE category IS NOT NULL AND category != \'\' ORDER BY category ASC';
    const { rows } = await db.query(queryText);
    return rows.map(r => r.category);
  }

  // Add wallpaper to favorites
  static async addFavorite(wallpaperId) {
    // Generate a UUID (e.g. pg_generate_uuid or custom uuid in node, but we can generate it via DB gen_random_uuid())
    const queryText = `
      INSERT INTO favorites (id, wallpaper_id)
      VALUES (gen_random_uuid(), $1)
      ON CONFLICT DO NOTHING
      RETURNING *
    `;
    const { rows } = await db.query(queryText, [wallpaperId]);
    return rows[0] || { wallpaper_id: wallpaperId };
  }

  // Fetch all favorite wallpapers using a JOIN
  static async getFavorites() {
    const queryText = `
      SELECT w.* 
      FROM wallpapers w
      INNER JOIN favorites f ON w.id = f.wallpaper_id
      ORDER BY w.created_at DESC
    `;
    const { rows } = await db.query(queryText);
    return rows;
  }

  // Utility to seed with initial wallpapers if empty
  static async seedIfEmpty() {
    const checkQuery = 'SELECT COUNT(*) FROM wallpapers';
    const { rows } = await db.query(checkQuery);
    if (parseInt(rows[0].count) === 0) {
      console.log('Database is empty. Seeding initial elegant wallpapers...');
      const seedData = [
        {
          id: 'a1b1c1d1-1111-4111-a111-111111111111',
          title: 'Nebula Drift',
          video_url: '/videos/nebula_drift.mp4',
          thumbnail_url: '/videos/nebula_drift_thumb.jpg',
          category: 'Sci-Fi',
          resolution: '3840x2160'
        },
        {
          id: 'b2c2d2e2-2222-4222-b222-222222222222',
          title: 'Rainy Kyoto',
          video_url: '/videos/rainy_kyoto.mp4',
          thumbnail_url: '/videos/rainy_kyoto_thumb.jpg',
          category: 'Nature',
          resolution: '1920x1080'
        },
        {
          id: 'c3d3e3f3-3333-4333-c333-333333333333',
          title: 'Cyber Circuit',
          video_url: '/videos/cyber_circuit.mp4',
          thumbnail_url: '/videos/cyber_circuit_thumb.jpg',
          category: 'Abstract',
          resolution: '1920x1080'
        },
        {
          id: 'd4e4f4a4-4444-4444-d444-444444444444',
          title: 'Desert Sunsets',
          video_url: '/videos/desert_sunsets.mp4',
          thumbnail_url: '/videos/desert_sunsets_thumb.jpg',
          category: 'Nature',
          resolution: '3840x2160'
        },
        {
          id: 'e5f5a5b5-5555-4555-e555-555555555555',
          title: 'Auroral Forest',
          video_url: '/videos/auroral_forest.mp4',
          thumbnail_url: '/videos/auroral_forest_thumb.jpg',
          category: 'Nature',
          resolution: '1920x1080'
        },
        {
          id: 'f6a6b6c6-6666-4666-f666-666666666666',
          title: 'Synthwave Matrix',
          video_url: '/videos/synthwave_matrix.mp4',
          thumbnail_url: '/videos/synthwave_matrix_thumb.jpg',
          category: 'Abstract',
          resolution: '1920x1080'
        }
      ];

      for (const item of seedData) {
        await db.query(
          `INSERT INTO wallpapers (id, title, video_url, thumbnail_url, category, resolution, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [item.id, item.title, item.video_url, item.thumbnail_url, item.category, item.resolution]
        );
      }
      console.log('Successfully seeded database!');
    }
  }
}

module.exports = WallpaperModel;
