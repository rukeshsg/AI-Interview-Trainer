import createDatabase, { sql, DatabaseConnection } from '@databases/sqlite';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(__dirname, '../../../data');
const DB_PATH = path.join(DATA_DIR, 'interview-trainer.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: DatabaseConnection | null = null;

export function getDb(): DatabaseConnection {
  if (!dbInstance) {
    dbInstance = createDatabase(DB_PATH);
  }
  return dbInstance;
}

export { sql };
export default getDb;
