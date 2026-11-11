'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  time?: string;
  type: string;
  location?: string;
}

interface EventsData {
  events: Event[];
  lastUpdated: string;
}

export default function AdminAgendaEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    time: '',
    type: 'exam',
    location: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data: EventsData = await response.json();
        setEvents(data.events || []);
      } else {
        // If API fails, try to load directly from JSON file
        const jsonResponse = await fetch('/admin-events.json');
        if (jsonResponse.ok) {
          const data: EventsData = await jsonResponse.json();
          setEvents(data.events || []);
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
      // Try to load directly from JSON file as fallback
      try {
        const jsonResponse = await fetch('/admin-events.json');
        if (jsonResponse.ok) {
          const data: EventsData = await jsonResponse.json();
          setEvents(data.events || []);
        }
      } catch (jsonError) {
        console.error('Error loading events from JSON:', jsonError);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveEvents = async (eventsToSave: Event[]) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSave }),
      });

      if (response.ok) {
        setEvents(eventsToSave);
        setShowForm(false);
        setEditingId(null);
        setFormData({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          time: '',
          type: 'exam',
          location: ''
        });
      } else {
        // If API fails, update local state anyway (for dev mode)
        setEvents(eventsToSave);
        setShowForm(false);
        setEditingId(null);
        setFormData({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          time: '',
          type: 'exam',
          location: ''
        });
      }
    } catch (error) {
      console.error('Error saving events:', error);
      // Update local state anyway (for dev mode)
      setEvents(eventsToSave);
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        time: '',
        type: 'exam',
        location: ''
      });
    }
  };

  const handleAdd = () => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      title: formData.title || '',
      description: formData.description || '',
      startDate: formData.startDate || '',
      endDate: formData.endDate || formData.startDate || '',
      time: formData.time,
      type: formData.type || 'exam',
      location: formData.location
    };

    saveEvents([...events, newEvent]);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    const updatedEvents = events.map(event =>
      event.id === editingId
        ? { ...event, ...formData }
        : event
    );

    saveEvents(updatedEvents);
  };

  const handleDelete = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    saveEvents(updatedEvents);
  };

  const startEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData(event);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      time: '',
      type: 'school',
      location: ''
    });
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Agenda Evenementen" description="Beheer evenementen voor alle gebruikers" />
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Laden...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Agenda Evenementen"
        description="Beheer evenementen voor alle gebruikers"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Evenement
          </Button>
        }
      />

      <div className="space-y-6">
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Evenement Bewerken' : 'Nieuw Evenement'}</CardTitle>
              <CardDescription>
                Vul de details in voor het evenement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Bijv. Toetsweek"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="exam">Examen</option>
                    <option value="school">School</option>
                    <option value="holiday">Vakantie</option>
                    <option value="other">Overig</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Startdatum *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Einddatum *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Tijd (optioneel)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Locatie (optioneel)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bijv. School"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Locatie</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Bijv. Schoolplein"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beschrijving van het evenement"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {editingId ? (
                  <>
                    <Button onClick={handleUpdate}>
                      <Save className="h-4 w-4 mr-2" />
                      Opslaan
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Annuleren
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      Toevoegen
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Annuleren
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(event.startDate).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {event.endDate && event.endDate !== event.startDate && ` - ${new Date(event.endDate).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}`}
                      {event.time && ` om ${event.time}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(event)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Type:</span>
                    <span className="text-muted-foreground capitalize">{event.type}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Locatie:</span>
                      <span className="text-muted-foreground">{event.location}</span>
                    </div>
                  )}
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {events.length === 0 && !showForm && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Geen evenementen gevonden</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
