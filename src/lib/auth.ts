// HeronPulse Academic OS - NextAuth Configuration
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { DEMO_ACCOUNTS } from '@/lib/types';
import { hash, compare } from 'bcryptjs';

// Generate default avatar URL using UI Avatars service
function generateDefaultAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200&bold=true&format=svg`;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Check if it's a demo account (plain password comparison)
          const demoAccount = DEMO_ACCOUNTS.find(
            (acc) => acc.email === credentials.email && acc.password === credentials.password
          );

          if (demoAccount) {
            try {
              // Try to find or create the demo user in database
              let user = await db.user.findUnique({
                where: { email: credentials.email },
              });

              if (!user) {
                // Create demo user with hashed password and default avatar
                const hashedPassword = await hash(demoAccount.password, 10);
                const defaultAvatar = generateDefaultAvatar(demoAccount.displayName);
                user = await db.user.create({
                  data: {
                    email: demoAccount.email,
                    displayName: demoAccount.displayName,
                    role: demoAccount.role as 'student' | 'faculty' | 'super_admin',
                    password: hashedPassword,
                    avatarUrl: defaultAvatar,
                    isOnline: true,
                    lastSeenAt: new Date(),
                    loginCount: 1,
                    lastLoginAt: new Date(),
                  },
                });
              } else {
                // Update last seen and increment login count
                await db.user.update({
                  where: { id: user.id },
                  data: { 
                    isOnline: true, 
                    lastSeenAt: new Date(),
                    loginCount: { increment: 1 },
                    lastLoginAt: new Date(),
                  },
                });
              }

              // Fetch updated user to get the new loginCount
              const updatedUser = await db.user.findUnique({
                where: { id: user.id },
                select: { loginCount: true },
              });

              return {
                id: user.id,
                email: user.email,
                name: user.displayName,
                role: user.role,
                image: user.avatarUrl,
                loginCount: updatedUser?.loginCount || 1,
              };
            } catch (dbError) {
              // If database fails, still allow demo login with mock user
              console.warn("Database unavailable, using mock demo user:", dbError);
              return {
                id: `demo-${demoAccount.role}-${Date.now()}`,
                email: demoAccount.email,
                name: demoAccount.displayName,
                role: demoAccount.role,
                image: null,
              };
            }
          }

          // Check regular user in database
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password with bcrypt
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

          // Update last seen and increment login count
          await db.user.update({
            where: { id: user.id },
            data: { 
              isOnline: true, 
              lastSeenAt: new Date(),
              loginCount: { increment: 1 },
              lastLoginAt: new Date(),
            },
          });

          // Fetch updated user to get the new loginCount
          const updatedUser = await db.user.findUnique({
            where: { id: user.id },
            select: { loginCount: true },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            role: user.role,
            image: user.avatarUrl,
            loginCount: updatedUser?.loginCount || 1,
          };
        } catch (error) {
          console.error("Auth authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.loginCount = user.loginCount;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.loginCount = token.loginCount as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'heronpulse-secret-key-2026',
};

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    role?: string;
    loginCount?: number;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: string;
      loginCount?: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    loginCount?: number;
  }
}
