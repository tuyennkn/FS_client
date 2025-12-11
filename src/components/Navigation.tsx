'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/features/auth/authSlice';
import { ShoppingCart, Search, Menu, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

export function Navigation() {
  const user = useAppSelector((state) => state.auth.user);
  const { cart } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const categories: string[] = [
    'Lãng mạn',
    'Viễn tưởng',
    'Kinh dị',
    'Khoa học',
    'Lịch sử',
    'Thiếu nhi',
    'Tiểu sử',
    'Công nghệ',
    'Triết học',
    'Du lịch',
    'Nấu ăn',
    'Thơ ca',
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <span className="font-serif text-xl font-semibold">FortunaS</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-sm font-medium hover:text-accent transition-colors">
                  Danh mục
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/category/${cat.toLowerCase()}`}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Link href="/about" className="text-sm font-medium hover:text-accent transition-colors">
              Giới thiệu
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-accent transition-colors">
              Liên hệ
            </Link>
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <Link href="/books">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Danh mục</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-4 ps-4 pe-2">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${cat.toLowerCase()}`}
                    onClick={() => setOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
                <Link href="/about" onClick={() => setOpen(false)}>Giới thiệu</Link>
                <Link href="/contact" onClick={() => setOpen(false)}>Liên hệ</Link>

              </nav>
            </SheetContent>
          </Sheet>

          {user ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Giỏ hàng</span>
                  {cart?.items?.length ? (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-4 h-4">
                      {cart.items.length}
                    </span>
                  ) : null}
                </Button>
              </Link>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Hồ sơ cá nhân</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Đơn hàng của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Cài đặt</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button className="hidden md:flex">Đăng nhập</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
