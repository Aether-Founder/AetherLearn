'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function LerenPage() {
  const params = useParams();

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-16">
      <Link
        href={`/leerplatform/studiesets/${params.setId}`}
        className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Terug naar studieset
      </Link>

      <Card className="border-2">
        <CardContent className="p-16 text-center">
          <BookOpen className="w-24 h-24 text-purple-600 mx-auto mb-6" />
          <h1
            className="text-7xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Leren Mode
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Deze leermodus komt binnenkort beschikbaar
          </p>
          <Link href={`/leerplatform/studiesets/${params.setId}`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Terug naar studieset
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
