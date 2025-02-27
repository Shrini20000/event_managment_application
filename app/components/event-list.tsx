"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Edit, Trash, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearch } from './search-context';
import { getAuthorized, postAuthorized, deleteAuthorized, putAuthorized } from '../utils/api_utils';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// Type definitions

type Event = {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  tasks: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  attendees_count: number;
  created_at: string;
  updated_at: string;
};

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'tasks' | 'attendees_count' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    date: '',
    location: ''
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { searchTerm } = useSearch();

  const fetchEvents = async () => {
    try {
      const data = await getAuthorized('events/');
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async () => {
    try {
      const response = await postAuthorized('events/', newEvent);
      setEvents([...events, response]);
      setNewEvent({ name: '', description: '', date: '', location: '' });
      setError(null);
    } catch (err) {
      setError('Failed to add event');
      console.error('Error adding event:', err);
    }
  };

  const updateEvent = async () => {
    if (!editingEvent) return;
    try {
      const response = await putAuthorized(`events/${editingEvent.id}/`, {
        name: editingEvent.name,
        description: editingEvent.description,
        date: editingEvent.date,
        location: editingEvent.location
      });
      setEvents(events.map(event => event.id === editingEvent.id ? response : event));
      setIsEditDialogOpen(false);
      setEditingEvent(null);
      setError(null);
    } catch (err) {
      setError('Failed to update event');
      console.error('Error updating event:', err);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteAuthorized(`events/${id}/`);
      setEvents(events.filter(event => event.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calendarEvents = filteredEvents.map(event => ({
    id: event.id,
    title: event.name,
    start: event.date
  }));

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <>
      {/* Add Event Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Location</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={addEvent}>Add Event</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                value={editingEvent?.name || ''}
                onChange={(e) => setEditingEvent(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Input
                id="edit-description"
                value={editingEvent?.description || ''}
                onChange={(e) => setEditingEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editingEvent?.date || ''}
                onChange={(e) => setEditingEvent(prev => prev ? { ...prev, date: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">Location</Label>
              <Input
                id="edit-location"
                value={editingEvent?.location || ''}
                onChange={(e) => setEditingEvent(prev => prev ? { ...prev, location: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={updateEvent}>Save Changes</Button>
        </DialogContent>
      </Dialog>

      {/* Calendar View */}
      <div className="my-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
          }}
          eventClick={(info) => {
            const clickedEvent = events.find(event => event.id === info.event.id);
            if (clickedEvent) handleEditClick(clickedEvent);
          }}
        />
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="mr-2 h-4 w-4" />
                {event.date}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="mr-2 h-4 w-4" />
                {event.location}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleEditClick(event)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteEvent(event.id)}>
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
