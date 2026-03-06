import { Client } from 'pg';
import 'dotenv/config';

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Attempting to connect to:", connectionString?.split('@')[1] || "DATABASE_URL not found");

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ Database connection successful!");
    const res = await client.query('SELECT NOW()');
    console.log("🕒 Database current time:", res.rows[0].now);
    await client.end();
  } catch (err: any) {
    console.error("❌ Connection failed:");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code || "N/A");
  }
}

testConnection();
