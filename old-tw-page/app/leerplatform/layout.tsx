'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import Image from 'next/image';

export default function LeerplatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/leerplatform', label: 'Overzicht' },
    { href: '/leerplatform/vakken', label: 'Vakken' },
    { href: '/leerplatform/kalender', label: 'Kalender' },
    { href: '/leerplatform/lessen', label: 'Lessen' },
  ];

  const isActive = (href: string) => {
    if (href === '/leerplatform') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/leerplatform" className="flex items-center gap-3">
              <Image
                src="https://aether-dub5.vercel.app/logo.png"
                alt="Aether Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Aether
              </span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <Link href="/leerplatform/studiesets/nieuw">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuw
                </Button>
              </Link>
              <Link href="/leerplatform/profiel">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
