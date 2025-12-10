import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'ANALYST';
    } & DefaultSession['user'];
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    role: 'ADMIN' | 'ANALYST';
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the JWT payload
   */
  interface JWT {
    id: string;
    role: 'ADMIN' | 'ANALYST';
  }
}
