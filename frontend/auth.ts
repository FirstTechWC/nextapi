import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { encryptPayload } from "@/lib/crypto-server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const encryptedData = encryptPayload({
            username: credentials.username,
            password: credentials.password,
          });

          const res = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ encrypted: encryptedData }),
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();
          // Response now includes: { access_token, token_type, expires_in, user: { id, username, email } }
          return {
            id: data.user.id.toString(),
            name: data.user.username,
            email: data.user.email,
            accessToken: data.access_token,
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
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
