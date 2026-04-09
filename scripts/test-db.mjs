#!/usr/bin/env node

/**
 * Database connection test script.
 * Run with: npm run db:test
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-project-env.mjs";

loadProjectEnv();

async function testDatabaseConnection() {
  console.log("\nTesting database connection...\n");

  const prisma = new PrismaClient();

  try {
    const userCount = await prisma.user.count();
    const gigCount = await prisma.gig.count();
    const messageCount = await prisma.message.count();
    const appCount = await prisma.gigApplication.count();

    console.log("Database connection successful.");
    console.log(`Users: ${userCount}`);
    console.log(`Gigs: ${gigCount}`);
    console.log(`Messages: ${messageCount}`);
    console.log(`Applications: ${appCount}`);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Database connection failed.");
    console.error("Error:", message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
