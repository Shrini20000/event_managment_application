'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash, PlusCircle, Edit } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSearch } from './search-context'
import { getAuthorized, postAuthorized, deleteAuthorized, putAuthorized } from '../utils/api_utils'

type Attendee = {
  id: string
  name: string
  email: string
  events: string[]
  created_at: string
  updated_at: string
}

type Event = {
  id: string
  name: string
}

export function AttendeeList() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newAttendee, setNewAttendee] = useState<Omit<Attendee, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    email: '',
    events: []
  })
  const [events, setEvents] = useState<Event[]>([])
  const { searchTerm } = useSearch()

  const fetchAttendees = async () => {
    try {
      const data = await getAuthorized('attendees/');
      setAttendees(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch attendees');
      console.error('Error fetching attendees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await getAuthorized('events/');
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    }
  };

  const addAttendee = async () => {
    try {
      const response = await postAuthorized('attendees/', newAttendee);
      setAttendees([...attendees, response]);
      setNewAttendee({ name: '', email: '', events: [] });
      setError(null);
    } catch (err) {
      setError('Failed to add attendee');
      console.error('Error adding attendee:', err);
    }
  };

  const updateAttendee = async () => {
    if (!editingAttendee) return;
    try {
      const response = await putAuthorized(`attendees/${editingAttendee.id}/`, {
        name: editingAttendee.name,
        email: editingAttendee.email,
        events: editingAttendee.events
      });
      setAttendees(attendees.map(attendee => 
        attendee.id === editingAttendee.id ? response : attendee
      ));
      setIsEditDialogOpen(false);
      setEditingAttendee(null);
      setError(null);
    } catch (err) {
      setError('Failed to update attendee');
      console.error('Error updating attendee:', err);
    }
  };

  const deleteAttendee = async (id: string) => {
    try {
      await deleteAuthorized(`attendees/${id}/`);
      setAttendees(attendees.filter(attendee => attendee.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete attendee');
      console.error('Error deleting attendee:', err);
    }
  };

  const handleEventSelect = (eventId: string) => {
    setNewAttendee(prev => ({
      ...prev,
      events: [...prev.events, eventId]
    }));
  };

  const handleEditEventSelect = (eventId: string) => {
    if (!editingAttendee) return;
    setEditingAttendee(prev => prev ? {
      ...prev,
      events: [...prev.events, eventId]
    } : null);
  };

  const handleEditClick = (attendee: Attendee) => {
    setEditingAttendee(attendee);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchAttendees();
    fetchEvents();
  }, []);

  const filteredAttendees = attendees.filter(attendee =>
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get event names from IDs
  const getEventNames = (eventIds: string[]) => {
    return eventIds
      .map(id => events.find(event => event.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return <div>Loading attendees...</div>;
  }

  return (
    <>
      {/* Add Attendee Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">
           <PlusCircle className="mr-2 h-4 w-4" /> Add Attendee
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Attendee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newAttendee.name}
                onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={newAttendee.email}
                onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="events" className="text-right">Events</Label>
              <Select onValueChange={handleEventSelect}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newAttendee.events.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3">
                  Selected events: {getEventNames(newAttendee.events)}
                </div>
              </div>
            )}
          </div>
          <Button onClick={addAttendee}>Add Attendee</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Attendee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                value={editingAttendee?.name || ''}
                onChange={(e) => setEditingAttendee(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingAttendee?.email || ''}
                onChange={(e) => setEditingAttendee(prev => prev ? { ...prev, email: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-events" className="text-right">Add Event</Label>
              <Select onValueChange={handleEditEventSelect}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editingAttendee?.events.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3">
                  Selected events: {getEventNames(editingAttendee.events)}
                </div>
              </div>
            )}
          </div>
          <Button onClick={updateAttendee}>Save Changes</Button>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Events</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAttendees.map(attendee => (
            <TableRow key={attendee.id}>
              <TableCell>{attendee.name}</TableCell>
              <TableCell>{attendee.email}</TableCell>
              <TableCell>{getEventNames(attendee.events)}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditClick(attendee)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteAttendee(attendee.id)}>
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default AttendeeList;