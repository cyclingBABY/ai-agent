import fs from 'fs';
import path from 'path';
// sqlite3 has no default export in some TS configs
// Keep typing loose until sqlite3 types are available (dev deps/types).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sqlite3: any = require('sqlite3');



export type Db = any;

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'taskpilot.sqlite');

export function getDb(): Db {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.run(`PRAGMA journal_mode = WAL;`);

    db.run(`CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );`);

    // For future normalization, but for now we persist whole objects/arrays.
    // (Keeps API contract stable while still giving durable persistence.)
  });

  return db;
}

export function getKV<T>(db: Db, key: string, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    db.get('SELECT value FROM kv WHERE key = ?', [key], (err: unknown, row: any) => {
      if (err || !row) return resolve(fallback);
      try {
        resolve(JSON.parse(row.value) as T);
      } catch {
        resolve(fallback);
      }
    });
  });
}

export function setKV(db: Db, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO kv(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
      [key, JSON.stringify(value)],
      (err: unknown) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

