'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Repeat,
  Trash2,
  X,
} from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';

type AgendaView = 'month' | 'week' | 'workweek' | 'day' | 'agenda' | 'year';
type AgendaEventType = 'les' | 'huiswerk' | 'examen' | 'other';
type Recurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  eventType: AgendaEventType;
  color: string;
  recurrence: Recurrence;
}

interface StoredAgendaEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  eventType: AgendaEventType;
  color: string;
  recurrence: Recurrence;
}

interface AgendaFormState {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  eventType: AgendaEventType;
  color: string;
  recurrence: Recurrence;
  notes: string;
  location: string;
}

const STORAGE_KEY = 'aether_agenda_events';

const EVENT_TYPES: AgendaEventType[] = ['les', 'huiswerk', 'examen', 'other'];

const EVENT_TYPE_LABELS: Record<AgendaEventType, string> = {
  les: 'Les',
  huiswerk: 'Huiswerk',
  examen: 'Toets',
  other: 'Overig',
};

const RECURRENCE_OPTIONS: Array<{ id: Recurrence; label: string }> = [
  { id: 'none', label: 'Geen herhaling' },
  { id: 'daily', label: 'Elke dag' },
  { id: 'weekly', label: 'Elke week' },
  { id: 'biweekly', label: 'Elke 2 weken' },
  { id: 'monthly', label: 'Elke maand' },
  { id: 'yearly', label: 'Elk jaar' },
];

const EVENT_COLOR_OPTIONS = [
  {
    id: 'blue',
    label: 'Blauw',
    swatch: 'bg-blue-500',
    event:
      'border-blue-300 bg-blue-50 text-blue-950 hover:bg-blue-100/80 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  },
  {
    id: 'darkblue',
    label: 'Donkerblauw',
    swatch: 'bg-blue-800',
    event:
      'border-blue-900 bg-blue-100 text-blue-950 hover:bg-blue-200/70 dark:border-blue-700 dark:bg-blue-950/70 dark:text-blue-200',
  },
  {
    id: 'red',
    label: 'Rood',
    swatch: 'bg-red-500',
    event:
      'border-red-300 bg-red-50 text-red-950 hover:bg-red-100/80 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200',
  },
  {
    id: 'pink',
    label: 'Roze',
    swatch: 'bg-pink-500',
    event:
      'border-pink-300 bg-pink-50 text-pink-950 hover:bg-pink-100/80 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-200',
  },
  {
    id: 'purple',
    label: 'Paars',
    swatch: 'bg-purple-500',
    event:
      'border-purple-300 bg-purple-50 text-purple-950 hover:bg-purple-100/80 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-200',
  },
  {
    id: 'green',
    label: 'Groen',
    swatch: 'bg-green-500',
    event:
      'border-green-300 bg-green-50 text-green-950 hover:bg-green-100/80 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200',
  },
  {
    id: 'darkgreen',
    label: 'Donkergroen',
    swatch: 'bg-green-800',
    event:
      'border-green-900 bg-green-100 text-green-950 hover:bg-green-200/70 dark:border-green-700 dark:bg-green-950/70 dark:text-green-200',
  },
  {
    id: 'lightgreen',
    label: 'Lichtgroen',
    swatch: 'bg-lime-400',
    event:
      'border-lime-300 bg-lime-50 text-lime-950 hover:bg-lime-100/80 dark:border-lime-800 dark:bg-lime-950/40 dark:text-lime-200',
  },
  {
    id: 'orange',
    label: 'Oranje',
    swatch: 'bg-orange-500',
    event:
      'border-orange-300 bg-orange-50 text-orange-950 hover:bg-orange-100/80 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200',
  },
  {
    id: 'yellow',
    label: 'Geel',
    swatch: 'bg-yellow-400',
    event:
      'border-yellow-300 bg-yellow-50 text-yellow-950 hover:bg-yellow-100/80 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-200',
  },
  {
    id: 'white',
    label: 'Wit',
    swatch: 'bg-white border border-gray-300',
    event:
      'border-gray-300 bg-white text-gray-900 hover:bg-gray-100/80 dark:border-gray-500 dark:bg-gray-100 dark:text-gray-900',
  },
  {
    id: 'black',
    label: 'Zwart',
    swatch: 'bg-black',
    event:
      'border-gray-900 bg-gray-900 text-white hover:bg-gray-800 dark:border-gray-500 dark:bg-black dark:text-gray-100',
  },
];

const primaryButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50';

const outlineButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50';

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `agenda_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function formatDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function computeDurationLabel(form: AgendaFormState): string {
  if (form.allDay) {
    return '24 uur (hele dag)';
  }

  if (!form.startTime || !form.endTime) {
    return '—';
  }

  const start = parseTimeToMinutes(form.startTime);
  let end = parseTimeToMinutes(form.endTime);

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return '—';
  }

  if (end === 0 && start !== 0) {
    end = 24 * 60;
  }

  if (end <= start) {
    end += 24 * 60;
  }

  const totalMinutes = end - start;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} minuten`;
  }

  if (minutes === 0) {
    return `${hours} uur`;
  }

  return `${hours} uur en ${minutes} minuten`;
}

function buildEventDates(
  date: string,
  startTime: string,
  endTime: string,
  allDay: boolean
): { startDate: Date; endDate: Date } | null {
  const [year, month, day] = date.split('-').map(Number);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  if (allDay) {
    return {
      startDate: new Date(year, month - 1, day, 0, 0, 0),
      endDate: new Date(year, month - 1, day, 23, 59, 59),
    };
  }

  const startMinutes = parseTimeToMinutes(startTime);
  let endMinutes = parseTimeToMinutes(endTime);

  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
    return null;
  }

  if (endMinutes === 0 && startMinutes !== 0) {
    endMinutes = 24 * 60;
  }

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const startDate = new Date(
    year,
    month - 1,
    day,
    Math.floor(startMinutes / 60),
    startMinutes % 60
  );

  const endDate = new Date(
    year,
    month - 1,
    day + Math.floor(endMinutes / 60),
    endMinutes % 60
  );

  return { startDate, endDate };
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function getWeekStartDate(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getColorOption(colorId: string) {
  return EVENT_COLOR_OPTIONS.find((option) => option.id === colorId) ?? EVENT_COLOR_OPTIONS[0];
}

function normalizeStoredEvent(raw: unknown): AgendaEvent | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';

  if (!title) return null;

  const startDate = new Date(record.startDate as string);
  const endDate = new Date(record.endDate as string);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const rawType = record.eventType;
  const eventType: AgendaEventType =
    rawType === 'les' || rawType === 'huiswerk' || rawType === 'examen' || rawType === 'other'
      ? rawType
      : 'other';

  const rawRecurrence = record.recurrence;
  const recurrence: Recurrence =
    rawRecurrence === 'daily' ||
    rawRecurrence === 'weekly' ||
    rawRecurrence === 'biweekly' ||
    rawRecurrence === 'monthly' ||
    rawRecurrence === 'yearly'
      ? rawRecurrence
      : 'none';

  return {
    id: typeof record.id === 'string' && record.id ? record.id : createId(),
    title,
    description: typeof record.description === 'string' ? record.description : undefined,
    location: typeof record.location === 'string' ? record.location : undefined,
    startDate,
    endDate,
    allDay: Boolean(record.allDay),
    eventType,
    color: typeof record.color === 'string' ? record.color : 'blue',
    recurrence,
  };
}

function loadStoredEvents(): AgendaEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeStoredEvent)
      .filter((event): event is AgendaEvent => event !== null)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  } catch {
    return [];
  }
}

function saveStoredEvents(events: AgendaEvent[]) {
  if (typeof window === 'undefined') return;

  try {
    const serialized: StoredAgendaEvent[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      allDay: event.allDay,
      eventType: event.eventType,
      color: event.color,
      recurrence: event.recurrence,
    }));

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // If storage is unavailable, keep events in memory only.
  }
}

function emptyForm(date: Date, time?: string): AgendaFormState {
  const startTime = time ?? '09:00';
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = startMinutes + 60;
  const endTime = `${pad(Math.floor((endMinutes % 1440) / 60))}:${pad(endMinutes % 60)}`;

  return {
    title: '',
    date: formatDateInput(date),
    startTime,
    endTime,
    allDay: false,
    eventType: 'other',
    color: 'blue',
    recurrence: 'none',
    notes: '',
    location: '',
  };
}

function occursOn(event: AgendaEvent, date: Date): boolean {
  const eventStartDay = new Date(event.startDate);
  eventStartDay.setHours(0, 0, 0, 0);

  const checkDay = new Date(date);
  checkDay.setHours(0, 0, 0, 0);

  if (event.recurrence === 'none') {
    return isSameDay(event.startDate, date);
  }

  if (checkDay < eventStartDay) {
    return false;
  }

  switch (event.recurrence) {
    case 'daily':
      return true;
    case 'weekly':
      return checkDay.getDay() === eventStartDay.getDay();
    case 'biweekly': {
      const diffDays = Math.round((checkDay.getTime() - eventStartDay.getTime()) / 86400000);
      return diffDays % 14 === 0;
    }
    case 'monthly': {
      const daysInMonth = new Date(checkDay.getFullYear(), checkDay.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(eventStartDay.getDate(), daysInMonth);
      return checkDay.getDate() === targetDay;
    }
    case 'yearly': {
      return (
        checkDay.getMonth() === eventStartDay.getMonth() &&
        checkDay.getDate() === eventStartDay.getDate()
      );
    }
    default:
      return false;
  }
}

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<AgendaView>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AgendaFormState>(() => emptyForm(new Date()));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setEvents(loadStoredEvents());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveStoredEvents(events);
  }, [events, loaded]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    [events]
  );

  const durationLabel = useMemo(() => computeDurationLabel(form), [form]);

  const getEventsForDate = (date: Date) =>
    sortedEvents
      .filter((event) => occursOn(event, date))
      .sort((a, b) => {
        if (a.allDay !== b.allDay) {
          return a.allDay ? -1 : 1;
        }

        return a.startDate.getTime() - b.startDate.getTime();
      });

  const openCreate = (date?: Date, time?: string) => {
    setEditingId(null);
    setForm(emptyForm(date ?? currentDate, time));
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (event: AgendaEvent) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      date: formatDateInput(event.startDate),
      startTime: formatTime(event.startDate),
      endTime: formatTime(event.endDate),
      allDay: event.allDay,
      eventType: event.eventType,
      color: event.color,
      recurrence: event.recurrence,
      notes: event.description ?? '',
      location: event.location ?? '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
  };

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();

    const title = form.title.trim();

    if (!title) {
      setFormError('Titel is verplicht.');
      return;
    }

    const dates = buildEventDates(form.date, form.startTime, form.endTime, form.allDay);

    if (!dates) {
      setFormError('Ongeldige datum of tijd.');
      return;
    }

    const agendaEvent: AgendaEvent = {
      id: editingId ?? createId(),
      title,
      description: form.notes.trim() || undefined,
      location: form.location.trim() || undefined,
      startDate: dates.startDate,
      endDate: dates.endDate,
      allDay: form.allDay,
      eventType: form.eventType,
      color: form.color,
      recurrence: form.recurrence,
    };

    setEvents((previous) => {
      if (editingId) {
        return previous
          .map((event) => (event.id === editingId ? agendaEvent : event))
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      }

      return [...previous, agendaEvent].sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime()
      );
    });

    closeModal();
  };

  const deleteEvent = () => {
    if (!editingId) return;

    setEvents((previous) => previous.filter((event) => event.id !== editingId));
    closeModal();
  };

  const handlePrevious = () => {
    if (view === 'year') {
      setCurrentDate((previous) => new Date(previous.getFullYear() - 1, 0, 1));
    } else if (view === 'month' || view === 'agenda') {
      setCurrentDate(
        (previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1)
      );
    } else if (view === 'day') {
      setCurrentDate((previous) => addDays(previous, -1));
    } else {
      setCurrentDate((previous) => addDays(previous, -7));
    }
  };

  const handleNext = () => {
    if (view === 'year') {
      setCurrentDate((previous) => new Date(previous.getFullYear() + 1, 0, 1));
    } else if (view === 'month' || view === 'agenda') {
      setCurrentDate(
        (previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1)
      );
    } else if (view === 'day') {
      setCurrentDate((previous) => addDays(previous, 1));
    } else {
      setCurrentDate((previous) => addDays(previous, 7));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    if (params.get('nieuw') === '1') {
      openCreate(new Date());
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const headerTitle = useMemo(() => {
    if (view === 'year') {
      return String(currentDate.getFullYear());
    }

    if (view === 'month') {
      return currentDate.toLocaleDateString('nl-NL', {
        month: 'long',
        year: 'numeric',
      });
    }

    if (view === 'day') {
      return currentDate.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    if (view === 'agenda') {
      return 'Agenda';
    }

    const weekStart = getWeekStartDate(currentDate);
    const weekEnd = addDays(weekStart, view === 'workweek' ? 4 : 6);

    return `${weekStart.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
    })} - ${weekEnd.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;
  }, [currentDate, view]);

  const getMonthCells = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const offset = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        date,
        inCurrentMonth: date.getMonth() === month,
      };
    });
  };

  const monthCells = useMemo(() => getMonthCells(currentDate), [currentDate]);

  const renderMonthView = () => (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
          <div
            key={day}
            className="border-r border-border px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthCells.map(({ date, inCurrentMonth }, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = isSameDay(date, new Date());

          return (
            <div
              key={index}
              onClick={() => openCreate(date)}
              className={`min-h-28 cursor-pointer border-b border-r border-border p-2 transition-colors last:border-r-0 hover:bg-secondary/40 ${
                isToday ? 'bg-secondary/25' : inCurrentMonth ? 'bg-card' : 'bg-secondary/10'
              }`}
            >
              <div className="mb-2 flex justify-between">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium text-foreground">
                  {date.getDate()}
                </span>
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const colorOption = getColorOption(event.color);

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        openEdit(event);
                      }}
                      className={`block w-full truncate rounded-md border px-2 py-1 text-left text-xs font-medium ${colorOption.event}`}
                    >
                      {event.allDay ? 'Hele dag' : formatTime(event.startDate)} · {event.title}
                    </button>
                  );
                })}

                {dayEvents.length > 3 && (
                  <div className="px-2 text-xs text-muted-foreground">
                    +{dayEvents.length - 3} meer
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTimeGrid = (days: Date[]) => {
    const minWidth = days.length > 1 ? days.length * 180 : undefined;
    const hours = Array.from({ length: 24 }, (_, index) => index);

    return (
      <div className="overflow-x-auto pb-2">
        <div
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          style={minWidth ? { minWidth } : undefined}
        >
          <div
            className="grid border-b border-border bg-secondary/30"
            style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(0, 1fr))` }}
          >
            <div className="p-3 border-r border-border"></div>

            {days.map((day) => {
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-border px-2 py-3 text-center last:border-r-0 ${
                    isToday ? 'bg-secondary/25' : ''
                  }`}
                >
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {day.toLocaleDateString('nl-NL', { weekday: 'short' })}
                  </div>
                  <div className="mt-1 text-base font-semibold text-foreground">
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="grid border-b border-border bg-card"
            style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(0, 1fr))` }}
          >
            <div className="border-r border-border p-2 text-xs font-medium text-muted-foreground">
              Hele dag
            </div>

            {days.map((day) => {
              const allDayEvents = getEventsForDate(day).filter((event) => event.allDay);

              return (
                <div
                  key={`allday-${day.toISOString()}`}
                  onClick={() => openCreate(day)}
                  className="min-h-12 cursor-pointer space-y-1 border-r border-border p-1 last:border-r-0 hover:bg-secondary/20"
                >
                  {allDayEvents.map((event) => {
                    const colorOption = getColorOption(event.color);

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          openEdit(event);
                        }}
                        className={`block w-full truncate rounded-md border px-2 py-1 text-left text-xs font-medium ${colorOption.event}`}
                      >
                        Hele dag · {event.title}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="max-h-[650px] overflow-y-auto">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-border last:border-b-0 min-h-16"
                style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(0, 1fr))` }}
              >
                <div className="p-2 text-xs font-mono text-muted-foreground text-right border-r border-border bg-secondary/10 pt-3">
                  {pad(hour)}:00
                </div>

                {days.map((day) => {
                  const hourEvents = getEventsForDate(day).filter(
                    (event) => !event.allDay && event.startDate.getHours() === hour
                  );

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      onClick={() => openCreate(day, `${pad(hour)}:00`)}
                      className="p-1 border-r border-border last:border-r-0 hover:bg-secondary/20 cursor-pointer"
                    >
                      {hourEvents.map((event) => {
                        const colorOption = getColorOption(event.color);

                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              openEdit(event);
                            }}
                            className={`block w-full rounded-md border px-2 py-1 text-left text-xs font-medium ${colorOption.event}`}
                          >
                            {formatTime(event.startDate)} - {formatTime(event.endDate)} ·{' '}
                            {event.title}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = (includeWeekend: boolean) => {
    const weekStart = getWeekStartDate(currentDate);
    const days = Array.from({ length: includeWeekend ? 7 : 5 }, (_, index) =>
      addDays(weekStart, index)
    );

    return renderTimeGrid(days);
  };

  const renderDayView = () => renderTimeGrid([currentDate]);

  const renderAgendaView = () => {
    const now = new Date();
    const upcomingEvents = sortedEvents.filter((event) => event.endDate.getTime() >= now.getTime());
    const agendaEvents = upcomingEvents.length > 0 ? upcomingEvents : sortedEvents;

    if (agendaEvents.length === 0) {
      return (
        <section className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
          <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold">Nog geen afspraken</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Voeg je eerste afspraak toe met de knop hierboven.
          </p>
          <button
            type="button"
            onClick={() => openCreate(currentDate)}
            className={`${primaryButtonClass} mt-6`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe afspraak
          </button>
        </section>
      );
    }

    return (
      <div className="space-y-3">
        {agendaEvents.map((event) => {
          const colorOption = getColorOption(event.color);

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => openEdit(event)}
              className={`block w-full rounded-xl border p-5 text-left shadow-sm transition-colors ${colorOption.event}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                    {event.startDate.toLocaleDateString('nl-NL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>

                  <h3 className="mt-1 truncate font-display text-xl font-semibold">
                    {event.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm opacity-80">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {event.allDay
                        ? 'Hele dag'
                        : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}
                    </span>

                    {event.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </span>
                    )}

                    {event.recurrence !== 'none' && (
                      <span className="inline-flex items-center gap-1">
                        <Repeat className="h-4 w-4" />
                        {RECURRENCE_OPTIONS.find((option) => option.id === event.recurrence)?.label}
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="mt-3 text-sm opacity-80">{event.description}</p>
                  )}
                </div>

                <span className="inline-flex h-fit rounded-full bg-background/70 px-3 py-1 text-xs font-semibold">
                  {EVENT_TYPE_LABELS[event.eventType]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, index) => new Date(year, index, 1));
    const today = new Date();

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {months.map((monthDate) => {
          const isCurrentMonth =
            today.getFullYear() === year && today.getMonth() === monthDate.getMonth();

          const cells = getMonthCells(monthDate);

          return (
            <section
              key={monthDate.toISOString()}
              className={`rounded-xl border bg-card p-4 shadow-sm ${
                isCurrentMonth ? 'border-primary/40 ring-2 ring-primary/30' : 'border-border'
              }`}
            >
              <h3 className="mb-3 font-display text-lg font-semibold capitalize">
                {monthDate.toLocaleDateString('nl-NL', { month: 'long' })}
              </h3>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
                  <div key={day} className="py-1 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map(({ date, inCurrentMonth }, index) => {
                  const isToday = isSameDay(date, today);
                  const hasEvents = getEventsForDate(date).length > 0;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => openCreate(date)}
                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : hasEvents
                            ? 'bg-secondary/70 text-foreground'
                            : inCurrentMonth
                              ? 'text-foreground hover:bg-secondary/50'
                              : 'text-muted-foreground/50 hover:bg-secondary/30'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    );
  };

  return (
    <AppShell>
      <PageHeader
        title="Agenda"
        description="Je persoonlijke afspraken, lessen, huiswerk en toetsen."
        action={
          <button
            type="button"
            onClick={() => openCreate(currentDate)}
            className={primaryButtonClass}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe afspraak
          </button>
        }
      />

      <div className="mt-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handlePrevious} className={outlineButtonClass}>
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button type="button" onClick={handleToday} className={outlineButtonClass}>
              Vandaag
            </button>

            <button type="button" onClick={handleNext} className={outlineButtonClass}>
              <ChevronRight className="h-4 w-4" />
            </button>

            <h2 className="ml-2 font-display text-2xl font-semibold">{headerTitle}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1">
            {(
              [
                { id: 'month', label: 'Maand' },
                { id: 'week', label: 'Week' },
                { id: 'workweek', label: 'Werkweek' },
                { id: 'day', label: 'Dag' },
                { id: 'agenda', label: 'Agenda' },
                { id: 'year', label: 'Jaar' },
              ] as Array<{ id: AgendaView; label: string }>
            ).map((button) => (
              <button
                key={button.id}
                type="button"
                onClick={() => setView(button.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === button.id
                    ? 'border border-border bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>

        {!loaded ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : (
          <>
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView(true)}
            {view === 'workweek' && renderWeekView(false)}
            {view === 'day' && renderDayView()}
            {view === 'agenda' && renderAgendaView()}
            {view === 'year' && renderYearView()}
          </>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">
                {editingId ? 'Afspraak bewerken' : 'Nieuwe afspraak'}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <p className="mb-4 rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-500">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="agenda-title" className="mb-1 block text-sm font-medium">
                  Titel
                </label>
                <input
                  id="agenda-title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Bijvoorbeeld: leersessie biologie"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="agenda-date" className="mb-1 block text-sm font-medium">
                    Datum
                  </label>
                  <input
                    id="agenda-date"
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="agenda-type" className="mb-1 block text-sm font-medium">
                    Type
                  </label>
                  <select
                    id="agenda-type"
                    value={form.eventType}
                    onChange={(event) =>
                      setForm({ ...form, eventType: event.target.value as AgendaEventType })
                    }
                    className={inputClass}
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {EVENT_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.allDay}
                    onChange={(event) => setForm({ ...form, allDay: event.target.checked })}
                    className="h-4 w-4"
                  />
                  Hele dag
                </label>

                {!form.allDay && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="agenda-start-time" className="mb-1 block text-sm font-medium">
                        Begintijd
                      </label>
                      <input
                        id="agenda-start-time"
                        type="time"
                        value={form.startTime}
                        onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="agenda-end-time" className="mb-1 block text-sm font-medium">
                        Eindtijd
                      </label>
                      <input
                        id="agenda-end-time"
                        type="time"
                        value={form.endTime}
                        onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                )}

                <p className="mt-3 text-sm text-muted-foreground">
                  Duur: <span className="font-medium text-foreground">{durationLabel}</span>
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="agenda-recurrence" className="mb-1 block text-sm font-medium">
                    Herhaling
                  </label>
                  <select
                    id="agenda-recurrence"
                    value={form.recurrence}
                    onChange={(event) =>
                      setForm({ ...form, recurrence: event.target.value as Recurrence })
                    }
                    className={inputClass}
                  >
                    {RECURRENCE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="agenda-location" className="mb-1 block text-sm font-medium">
                    Locatie
                  </label>
                  <input
                    id="agenda-location"
                    value={form.location}
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                    className={inputClass}
                    placeholder="Bijv. lokaal 204"
                  />
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium">Kleur</span>

                <div className="flex flex-wrap gap-2">
                  {EVENT_COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setForm({ ...form, color: option.id })}
                      aria-label={option.label}
                      title={option.label}
                      className={`h-8 w-8 rounded-full border border-border ${option.swatch} ${
                        form.color === option.id
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="agenda-notes" className="mb-1 block text-sm font-medium">
                  Notities
                </label>
                <textarea
                  id="agenda-notes"
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  placeholder="Voeg optionele notities toe..."
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                {editingId ? (
                  <button
                    type="button"
                    onClick={deleteEvent}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground shadow transition-colors hover:bg-destructive/90"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Verwijderen
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex gap-2">
                  <button type="button" onClick={closeModal} className={outlineButtonClass}>
                    Annuleren
                  </button>

                  <button type="submit" className={primaryButtonClass}>
                    {editingId ? 'Opslaan' : 'Toevoegen'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
