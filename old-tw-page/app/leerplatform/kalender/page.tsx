'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const WEEKDAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

interface Event {
  date: Date;
  title: string;
  type: 'exam' | 'assignment' | 'presentation';
  color: string;
}

export default function KalenderPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [events] = useState<Event[]>([
    {
      date: new Date(2026, 7, 8),
      title: 'Toets Wiskunde',
      type: 'exam',
      color: 'bg-red-500',
    },
    {
      date: new Date(2026, 7, 10),
      title: 'Inleveren opdracht Scheikunde',
      type: 'assignment',
      color: 'bg-blue-500',
    },
    {
      date: new Date(2026, 7, 12),
      title: 'Presentatie Engels',
      type: 'presentation',
      color: 'bg-green-500',
    },
  ]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday as first day
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    return events.filter(event => {
      const eventDate = event.date;
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-7xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Kalender
          </h1>
          <p className="text-[15px] text-gray-600">
            Plan je studie en houd deadlines bij
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nieuw evenement
        </Button>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button onClick={previousMonth} variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2
            className="text-4xl font-bold text-gray-900 min-w-[300px] text-center"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button onClick={nextMonth} variant="outline" size="icon">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
          Vandaag
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="border-2">
        <CardContent className="p-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center font-bold text-gray-600 py-3"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for alignment */}
            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {days.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square border-2 rounded-lg p-2 hover:border-purple-400 transition-colors ${
                    isToday ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div
                    className={`text-sm font-bold mb-1 ${
                      isToday ? 'text-purple-600' : 'text-gray-900'
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className={`text-xs ${event.color} text-white px-2 py-1 rounded truncate`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <div className="mt-10">
        <h2
          className="text-3xl font-bold text-gray-900 mb-6"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Aankomende evenementen
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {events.map((event, idx) => (
            <Card key={idx} className="border-2">
              <CardContent className="p-6">
                <div className={`w-3 h-3 ${event.color} rounded-full mb-3`} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {event.date.toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
