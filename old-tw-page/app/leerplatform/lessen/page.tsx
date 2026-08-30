'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Plus } from 'lucide-react';
import Link from 'next/link';

export default function LessenPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-8 py-16">
      <div className="mb-10">
        <h1
          className="text-7xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Lessen
        </h1>
        <p className="text-[15px] text-gray-600">
          Organiseer je lessen en studiematerialen
        </p>
      </div>

      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-16 text-center">
          <GraduationCap className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h3
            className="text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Nog geen lessen
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Begin met het toevoegen van je eerste les
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe les toevoegen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
