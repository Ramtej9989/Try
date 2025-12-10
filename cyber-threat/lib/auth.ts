import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { getMongoDB } from "./mongodb";

// Define extended user type with role information
export interface ExtendedUser extends User {
  id: string;
  role: "ADMIN" | "ANALYST";
}

/**
 * Configuration options for NextAuth
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const db = await getMongoDB();
          const user = await db.collection("users").findOne({
            email: credentials.email
          });

          if (!user) {
            throw new Error("No user found with that email");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password_hash
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return user without password hash
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as ExtendedUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "ANALYST";
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};

/**
 * Helper to check if user has admin role
 */
export const isAdmin = (user: ExtendedUser | undefined | null): boolean => {
  return user?.role === "ADMIN";
};

/**
 * Helper to check if user has analyst role or higher
 */
export const isAnalyst = (user: ExtendedUser | undefined | null): boolean => {
  return user?.role === "ANALYST" || user?.role === "ADMIN";
};

/**
 * Helper to require admin role, throws error if user isn't admin
 */
export const requireAdmin = (user: ExtendedUser | undefined | null): void => {
  if (!isAdmin(user)) {
    throw new Error("Admin privileges required");
  }
};
