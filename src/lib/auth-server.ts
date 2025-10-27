import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function auth() {
  // In development, allow a fake admin session so local APIs work without login
  if (process.env.NODE_ENV !== 'production') {
    return {
      user: {
        id: '1',
        email: 'admin@fba-calculator.com',
        role: 'admin',
        name: 'Dev Admin'
      }
    } as any;
  }

  return await getServerSession(authOptions);
}