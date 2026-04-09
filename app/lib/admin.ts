import { prisma } from "./prisma";
import type { Prisma, User } from "@prisma/client";

export const ADMIN_USERNAME = "password";
const ADMIN_PROFILE = {
  username: ADMIN_USERNAME,
  name: "Platform Admin",
  email: "admin@campus-gigs.local",
  role: "ADMIN" as const,
};

// Bcrypt hash for the fixed built-in admin password: 365
const ADMIN_PASSWORD_HASH =
  "$2a$12$kzgOkHgtAC1zaliHSdUFV.x2vf8e9TNQPljdijXHqT9GtXKScLvWC";

export function isReservedUsername(username: string) {
  return username.trim().toLowerCase() === ADMIN_USERNAME;
}

export async function ensureAdminUser() {
  const existingAdmin = await prisma.user.findUnique({
    where: { username: ADMIN_PROFILE.username },
  });

  if (!existingAdmin) {
    return prisma.user.create({
      data: {
        ...ADMIN_PROFILE,
        password: ADMIN_PASSWORD_HASH,
      },
    });
  }

  const updates: Prisma.UserUpdateInput = {};

  if (existingAdmin.name !== ADMIN_PROFILE.name) updates.name = ADMIN_PROFILE.name;
  if (existingAdmin.email !== ADMIN_PROFILE.email) updates.email = ADMIN_PROFILE.email;
  if (existingAdmin.role !== ADMIN_PROFILE.role) updates.role = ADMIN_PROFILE.role;
  if (existingAdmin.password !== ADMIN_PASSWORD_HASH) updates.password = ADMIN_PASSWORD_HASH;

  if (Object.keys(updates).length === 0) {
    return existingAdmin;
  }

  return prisma.user.update({
    where: { id: existingAdmin.id },
    data: updates,
  });
}

export function isBuiltInAdmin(user: Pick<User, "username"> | null | undefined) {
  return user?.username === ADMIN_USERNAME;
}
