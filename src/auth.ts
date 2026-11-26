import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { findAuthUserByEmail, normalizeEmail } from "./lib/auth-users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials.email === "string"
            ? normalizeEmail(credentials.email)
            : "";
        const password =
          typeof credentials.password === "string"
            ? credentials.password
            : "";

        if (!email || !password || Buffer.byteLength(password, "utf8") > 72) {
          return null;
        }

        const user = await findAuthUserByEmail(email);
        if (!user || !(await compare(password, user.passwordHash))) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});
