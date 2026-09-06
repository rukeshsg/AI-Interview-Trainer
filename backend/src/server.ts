import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (one level up from backend/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import app from './app';
import { initializeDatabase } from './db/schema';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function start() {
  try {
    // Initialize SQLite database
    await initializeDatabase();
    console.log('[DB] SQLite database initialized');

    app.listen(PORT, () => {
      console.log(`[Server] AI Interview Trainer backend running on http://localhost:${PORT}`);
      console.log(`[Server] Mock AI: ${process.env.ENABLE_MOCK_AI === 'true' ? 'ENABLED (dev only)' : 'disabled'}`);
      console.log(`[Server] IBM configured: ${!!(process.env.IBM_ORCHESTRATE_API_KEY)}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();
