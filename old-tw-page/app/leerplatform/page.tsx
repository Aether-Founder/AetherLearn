'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  FolderOpen, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Clock,
  ChevronRight
} from 'lucide-react';

interface StudySet {
  id: string;
  title: string;
  termCount: number;
  folderId?: string;
  lastStudied?: Date;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  studySetCount: number;
  parentId?: string;
}

export default function LeerplatformDashboard() {
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [stats, setStats] = useState({
    studiedToday: 0,
    totalSubjects: 5,
    studiedSubjects: 0,
    streakDays: 0,
    totalCards: 0,
  });

  // Load data from localStorage
  useEffect(() => {
    const savedSets = localStorage.getItem('aether-study-sets');
    const savedFolders = localStorage.getItem('aether-folders');
    const savedStats = localStorage.getItem('aether-stats');
    
    if (savedSets) setStudySets(JSON.parse(savedSets));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  const recentStudySets = studySets
    .filter(set => set.lastStudied)
    .sort((a, b) => {
      if (!a.lastStudied || !b.lastStudied) return 0;
      return new Date(b.lastStudied).getTime() - new Date(a.lastStudied).getTime();
    })
    .slice(0, 6);

  const upcomingEvents = [
    { date: '8 aug', title: 'Toets Wiskunde', type: 'exam' },
    { date: '10 aug', title: 'Inleveren opdracht Scheikunde', type: 'assignment' },
    { date: '12 aug', title: 'Presentatie Engels', type: 'presentation' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-16">
      {/* Welcome Header */}
      <div className="mb-12">
        <h1 
          className="text-7xl font-bold text-gray-900 mb-4" 
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Welkom terug, Mohammed!
        </h1>
        <p className="text-[15px] text-gray-600 tracking-wide">
          VWO 4 · NATUUR & TECHNIEK · {stats.totalSubjects} VAKKEN
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {stats.studiedToday}
            </div>
            <div className="text-[15px] text-gray-600">kaarten vandaag</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {stats.studiedSubjects}/{stats.totalSubjects}
            </div>
            <div className="text-[15px] text-gray-600">onderwerpen geoefend</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {stats.streakDays}
            </div>
            <div className="text-[15px] text-gray-600">dagen streak</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-pink-200 bg-pink-50/50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-pink-600" />
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {stats.totalCards}
            </div>
            <div className="text-[15px] text-gray-600">totale kaarten</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="col-span-2 space-y-12">
          {/* Quick Actions */}
          <div>
            <h2 
              className="text-3xl font-bold text-gray-900 mb-6" 
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Jouw items
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <Link href="/leerplatform/vakken">
                <Card className="border-2 hover:border-purple-400 transition-all cursor-pointer group">
                  <CardContent className="p-8">
                    <FolderOpen className="w-12 h-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mappen</h3>
                    <p className="text-[15px] text-gray-600">
                      {folders.length} {folders.length === 1 ? 'map' : 'mappen'}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/leerplatform/studiesets/nieuw">
                <Card className="border-2 hover:border-blue-400 transition-all cursor-pointer group">
                  <CardContent className="p-8">
                    <Plus className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nieuwe Studieset</h3>
                    <p className="text-[15px] text-gray-600">Maak een nieuwe set</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Recent Study Sets */}
          {recentStudySets.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-3xl font-bold text-gray-900" 
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  Recent bestudeerd
                </h2>
                <Link href="/leerplatform/studiesets">
                  <Button variant="ghost" className="text-purple-600">
                    Alles bekijken
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {recentStudySets.map((set) => (
                  <Link key={set.id} href={`/leerplatform/studiesets/${set.id}`}>
                    <Card className="border-2 hover:border-purple-400 transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {set.title}
                        </h3>
                        <p className="text-[15px] text-gray-600">
                          {set.termCount} {set.termCount === 1 ? 'term' : 'termen'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 
                className="text-3xl font-bold text-gray-900 mb-6" 
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Aan de slag
              </h2>
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 
                    className="text-4xl font-bold text-gray-900 mb-4" 
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    Maak je eerste studieset
                  </h3>
                  <p className="text-[15px] text-gray-600 mb-6">
                    Begin met het maken van flashcards om je studie te organiseren
                  </p>
                  <Link href="/leerplatform/studiesets/nieuw">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Maak studieset
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div>
            <h3 
              className="text-2xl font-bold text-gray-900 mb-4" 
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Deze week
            </h3>
            <Card className="border-2">
              <CardContent className="p-6 space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="bg-purple-100 rounded-lg px-3 py-2 text-center min-w-[60px]">
                      <div className="text-xs font-medium text-purple-600">
                        {event.date}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-[15px]">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {event.type === 'exam' && '📝 Toets'}
                        {event.type === 'assignment' && '📚 Opdracht'}
                        {event.type === 'presentation' && '🎤 Presentatie'}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Study Statistics */}
          <div>
            <h3 
              className="text-2xl font-bold text-gray-900 mb-4" 
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Studiestatistieken
            </h3>
            <Card className="border-2">
              <CardContent className="p-6">
                {stats.studiedSubjects > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Voortgang deze week</span>
                        <span className="font-medium">
                          {Math.round((stats.studiedSubjects / stats.totalSubjects) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(stats.studiedSubjects / stats.totalSubjects) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.studiedSubjects} van de {stats.totalSubjects} onderwerpen geoefend
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Begin met studeren om je statistieken te zien
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
