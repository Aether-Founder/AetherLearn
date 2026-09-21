'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/useTranslation';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-14 py-8 text-center border-t border-border">
      <Link href="/" className="flex items-center justify-center gap-1">
        <Image
          src="/assets/favicon.png"
          alt={t('logo_alt')}
          width={28}
          height={28}
          className="h-7 w-7 rounded-md object-contain"
        />
        <div className="flex flex-col items-start">
          <span className="font-display text-2xl font-semibold tracking-tight leading-none">
            {t('brand')}
          </span>
          <span className="font-display text-sm font-medium tracking-tight leading-none">
            Learn
          </span>
        </div>
      </Link>
    </footer>
  );
}
