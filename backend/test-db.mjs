import createDatabase, { sql } from "@databases/sqlite";
const db = createDatabase("./test-check.db");
await db.query(sql`CREATE TABLE IF NOT EXISTS test_t (id TEXT, name TEXT)`);
await db.query(sql`INSERT INTO test_t VALUES (${"1"}, ${"hello"})`);
const rows = await db.query(sql`SELECT * FROM test_t`);
console.log("works:", JSON.stringify(rows));
await db.dispose();
