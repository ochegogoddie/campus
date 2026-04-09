import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-project-env.mjs";

loadProjectEnv();

const prisma = new PrismaClient({ errorFormat: "minimal" });

const ADMIN_USERNAME = "password";
const ADMIN_PROFILE = {
  username: ADMIN_USERNAME,
  name: "Platform Admin",
  email: "admin@campus-gigs.local",
  role: "ADMIN",
};
const ADMIN_PASSWORD_HASH =
  "$2a$12$kzgOkHgtAC1zaliHSdUFV.x2vf8e9TNQPljdijXHqT9GtXKScLvWC";

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        ...ADMIN_PROFILE,
        password: ADMIN_PASSWORD_HASH,
      },
    });
    console.log("Built-in admin created.");
    return;
  }

  const updates = {};

  if (existingAdmin.name !== ADMIN_PROFILE.name) updates.name = ADMIN_PROFILE.name;
  if (existingAdmin.email !== ADMIN_PROFILE.email) updates.email = ADMIN_PROFILE.email;
  if (existingAdmin.role !== ADMIN_PROFILE.role) updates.role = ADMIN_PROFILE.role;
  if (existingAdmin.password !== ADMIN_PASSWORD_HASH) {
    updates.password = ADMIN_PASSWORD_HASH;
  }

  if (Object.keys(updates).length === 0) {
    console.log("Built-in admin already up to date.");
    return;
  }

  await prisma.user.update({
    where: { id: existingAdmin.id },
    data: updates,
  });

  console.log("Built-in admin updated.");
}

main()
  .catch((error) => {
    console.error("Failed to ensure built-in admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
