'use client';

import { Navigation } from '@/components/Navigation';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to FS Client
          </h1>
          
          {user ? (
            <div>
              <p className="text-xl text-gray-600 mb-6">
                Hello, {user.fullname}!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/search">
                  <Button>Search Books</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xl text-gray-600 mb-6">
                Please login or register to continue
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/login">
                  <Button>Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Register</Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
