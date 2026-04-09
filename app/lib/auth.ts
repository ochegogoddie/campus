import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { ADMIN_USERNAME, ensureAdminUser } from "./admin";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const normalizedUsername = credentials.username.trim();
          const isBuiltInAdminLogin =
            normalizedUsername.toLowerCase() === ADMIN_USERNAME;
          const loginUsername = isBuiltInAdminLogin
            ? ADMIN_USERNAME
            : normalizedUsername;
          const passwordToCheck = isBuiltInAdminLogin
            ? credentials.password.trim()
            : credentials.password;

          if (isBuiltInAdminLogin) {
            await ensureAdminUser();
          }

          const user = await prisma.user.findUnique({
            where: { username: loginUsername },
          });

          if (!user) {
            return null;
          }

          const passwordMatch = await compare(passwordToCheck, user.password);

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
