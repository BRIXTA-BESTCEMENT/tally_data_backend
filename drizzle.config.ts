import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// This finds your .env file
dotenv.config({ path: '.env' }); 

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

export default defineConfig({
  // This tells Drizzle where to find your schema
   schema: './src/drizzle/schema.ts',
  
  // This tells Drizzle where to put the migration files
  out: './src/drizzle/migrations',
  
  dialect: 'postgresql',
  dbCredentials: {
    // This securely reads your database connection string
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});