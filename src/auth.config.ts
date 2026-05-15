import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const authConfig = {
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt" as const,
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        await connectDB();

        const email = String(credentials?.email || "").toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) {
          return null;
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.isActive) {
          return null;
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
          return null;
        }

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
    async jwt({
        token,
        user,
    }: {
        token: {
        role?: string;
        sub?: string;
        [key: string]: unknown;
        };

        user?: {
        role?: string;
        };
    }) {
        if (user?.role) {
        token.role = user.role;
        }

        return token;
    },

    async session({
        session,
        token,
    }: {
        session: {
        user?: {
            id?: string;
            role?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
        expires: string;
        };

        token: {
        sub?: string;
        role?: unknown;
        [key: string]: unknown;
        };
    }) {
        if (session.user) {
        session.user.id = token.sub || "";

        session.user.role =
            typeof token.role === "string"
            ? token.role
            : "";
        }

        return session;
    },
    },

  pages: {
    signIn: "/login",
  },
};