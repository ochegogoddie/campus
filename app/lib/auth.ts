import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { ADMIN_USERNAME, ensureAdminUser } from "./admin";
import { consumeAuthCode, LOGIN_CODE_PURPOSE } from "./auth-codes";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        challengeId: { label: "Challenge", type: "text" },
        verificationCode: { label: "Verification code", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (credentials?.challengeId && credentials?.verificationCode) {
            const challenge = await consumeAuthCode({
              challengeId: credentials.challengeId,
              code: credentials.verificationCode,
              purpose: LOGIN_CODE_PURPOSE,
            });

            if (!challenge?.user) {
              return null;
            }

            if (challenge.user.lockedUntil && challenge.user.lockedUntil > new Date()) {
              return null;
            }

            if (!challenge.user.emailVerifiedAt) {
              return null;
            }

            return {
              id: challenge.user.id,
              username: challenge.user.username,
              name: challenge.user.name,
              email: challenge.user.email,
              image: challenge.user.avatar,
              role: challenge.user.role,
            };
          }

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

          if (!isBuiltInAdminLogin) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { username: loginUsername },
          });

          if (!user) {
            return null;
          }

          if (user.lockedUntil && user.lockedUntil > new Date()) {
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
            image: user.avatar,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.image = user.image ?? null;
      }

      if (trigger === "update") {
        if (session?.name) {
          token.name = session.name;
        }
        if (session?.image !== undefined) {
          token.image = session.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.image = (token.image as string | null | undefined) ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
