import { Client } from 'pg';
import 'dotenv/config';

async function testConnectionNoSSL() {
  const connectionString = process.env.DATABASE_URL;
  // Replace sslmode=require with sslmode=disable for the manual check
  const noSslUrl = connectionString?.replace('sslmode=require', 'sslmode=disable');
  console.log("Attempting to connect (No SSL) to:", noSslUrl?.split('@')[1]);

  const client = new Client({
    connectionString: noSslUrl,
    ssl: false
  });

  try {
    await client.connect();
    console.log("✅ Database connection successful (No SSL)!");
    await client.end();
  } catch (err: any) {
    console.error("❌ Connection failed (No SSL):");
    console.error("Error message:", err.message);
  }
}

testConnectionNoSSL();
