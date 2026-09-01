import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './db';

async function main() {
  console.log('Running migrations...');
  migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
