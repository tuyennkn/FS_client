'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/features/auth/authSlice';
import { ShoppingCart, Package, BookOpen, Search, Menu } from 'lucide-react';

export function Navigation() {
  const { user } = useAppSelector((state) => state.auth);
  const { cart } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <span className="font-serif text-xl font-semibold">FortunaS</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-accent transition-colors">
              Fiction
            </a>
            <a href="#" className="text-sm font-medium hover:text-accent transition-colors">
              Non-Fiction
            </a>
            <a href="#" className="text-sm font-medium hover:text-accent transition-colors">
              Children's
            </a>
            <a href="#" className="text-sm font-medium hover:text-accent transition-colors">
              Academic
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/books">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
          {user ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Shopping cart</span>
                  {cart?.items?.length ? (
                    <span className="absolute top-[-2] right-[-2] inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-4 h-4">
                      {cart.items.length}
                    </span>
                  ) : null}
                </Button>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm font-medium">Hello, {user.fullname}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>

          ) : (
            <Button className="hidden md:flex">Sign In</Button>
          )}

        </div>
      </div>
    </header>
  );
}
