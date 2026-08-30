'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Mail, GraduationCap, Calendar } from 'lucide-react';

export default function ProfielPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-8 py-16">
      <div className="mb-10">
        <h1
          className="text-7xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Profiel
        </h1>
        <p className="text-[15px] text-gray-600">
          Beheer je account en instellingen
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Info */}
        <Card className="border-2">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Persoonlijke informatie
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Naam
                </label>
                <Input defaultValue="Mohammed" className="border-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <Input
                  type="email"
                  defaultValue="mohammed@example.com"
                  className="border-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Info */}
        <Card className="border-2">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Academische informatie
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Opleiding
                </label>
                <Input defaultValue="VWO 4 - Natuur & Techniek" className="border-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Studiejaar
                </label>
                <Input defaultValue="2025-2026" className="border-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vakken */}
        <Card className="border-2">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vakken</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Wiskunde', 'Natuurkunde', 'Scheikunde', 'Biologie', 'Nederlands', 'Engels'].map(
                (vak) => (
                  <div
                    key={vak}
                    className="px-4 py-3 bg-purple-100 text-purple-900 rounded-lg font-medium"
                  >
                    {vak}
                  </div>
                )
              )}
            </div>
            <Button variant="outline" className="w-full mt-4 border-2">
              Vakken bewerken
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Annuleren</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Wijzigingen opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}
