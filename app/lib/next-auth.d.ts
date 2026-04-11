import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email?: string;
    name: string;
    image?: string | null;
    username?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: string;
    image?: string | null;
  }
}
