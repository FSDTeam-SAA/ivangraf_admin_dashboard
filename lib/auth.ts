import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getBaseUrl } from "@/lib/env";

interface LoginApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: {
      id?: string;
      _id?: string;
      name?: string;
      username?: string;
      role?: string;
      isActive?: boolean;
    };
  };
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password;

        if (!username || !password) {
          return null;
        }

        const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        console.log(response);

        const payload = (await response
          .json()
          .catch(() => null)) as LoginApiResponse | null;

        if (!response.ok || !payload?.data?.token || !payload.data.user) {
          return null;
        }

        if (payload.data.user.isActive === false) {
          return null;
        }

        return {
          id: payload.data.user.id || payload.data.user._id || "",
          name: payload.data.user.name || payload.data.user.username || "User",
          username: payload.data.user.username || "",
          role: payload.data.user.role || "user",
          accessToken: payload.data.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.userId = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session;
    },
  },
};
