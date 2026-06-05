# Live Wallpaper Local Backend Server

This is the production-ready Node.js Express & PostgreSQL backend for the Live Wallpaper Android application.

## Tech Stack
- **Node.js**: Low-latency Express API Server.
- **PostgreSQL**: Highly reliable relational storage for wallpaper metadata and user favorites.

---

## 1. Setup PostgreSQL Database

### Installation:
- **macOS (via Homebrew)**: `brew install postgresql` followed by `brew services start postgresql`.
- **Windows / Linux**: Download the installer from the official website [postgresql.org](https://www.postgresql.org/download/) and install it.

### Create Database:
Open your terminal or `pgAdmin` and execute:
```sql
CREATE DATABASE live_wallpapers;
```

---

## 2. Server Configuration

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=live_wallpapers
DB_SSL=false
```

---

## 3. Populate Live Wallpapers Video Files

Before starting, create a `videos` directory under the `backend` folder and populate it with sample loops (MP4) and thumbnail covers:
```bash
mkdir -p backend/videos
```

Place small video looping files matching the seeded database:
- `nebula_drift.mp4` & `nebula_drift_thumb.jpg`
- `rainy_kyoto.mp4` & `rainy_kyoto_thumb.jpg`
- `cyber_circuit.mp4` & `cyber_circuit_thumb.jpg`
- `desert_sunsets.mp4` & `desert_sunsets_thumb.jpg`
- `auroral_forest.mp4` & `auroral_forest_thumb.jpg`
- `synthwave_matrix.mp4` & `synthwave_matrix_thumb.jpg`

---

## 4. Run the Server

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install standard dependencies:
   ```bash
   npm install express pg dotenv cors
   ```
3. Boot the local server:
   ```bash
   node server.js
   ```

The script will automatically detect if tables exist. If they do not, it will automatically build:
- `wallpapers` table with columns: `id`, `title`, `video_url`, `thumbnail_url`, `category`, `resolution`, `created_at`.
- `favorites` table mapped with foreign keys.
- Seeds the DB with 6 rich, initial high-definition wallpapers.
