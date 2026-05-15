import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials): Promise<AppUser | null> {
        await connectDB();

        const email = String(credentials?.email || "").toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.isActive) return null;

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) return null;

        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as AppUser).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role =
          typeof token.role === "string" ? token.role : "";
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};