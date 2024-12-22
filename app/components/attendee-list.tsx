// AttendeeList.tsx modifications
'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash, PlusCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSearch } from './search-context'
import { getAuthorized, postAuthorized, deleteAuthorized } from '../utils/api_utils'

type Attendee = {
  id: string
  name: string
  email: string
  events: string[]
  created_at: string
  updated_at: string
}

export function AttendeeList() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newAttendee, setNewAttendee] = useState<Omit<Attendee, 'id' | 'events' | 'created_at' | 'updated_at'>>({
    name: '',
    email: ''
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
    } finally {
      setLoading(false);
    }
  };

  const addAttendee = async () => {
    try {
      const response = await postAuthorized('attendees/', newAttendee);
      setAttendees([...attendees, response]);
      setNewAttendee({ name: '', email: '' });
      setError(null);
    } catch (err) {
      setError('Failed to add attendee');
      console.error('Error adding attendee:', err);
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

  useEffect(() => {
    fetchAttendees();
    fetchEvents();
  }, []);

  const filteredAttendees = attendees.filter(attendee =>
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading attendees...</div>;
  }

  return (
    <>
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
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newAttendee.name}
                onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newAttendee.email}
                onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={addAttendee}>Add Attendee</Button>
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
              <TableCell>{attendee.events.join(', ')}</TableCell>
              <TableCell>
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
