'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, PlusCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAuthorized, postAuthorized, putAuthorized } from '../utils/api_utils'

type Task = {
  id: string
  name: string
  event: string
  status: 'Pending' | 'Completed'
  created_at: string
  updated_at: string
}

export function TaskList() {

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    event: '',
    status: 'Pending'
  })

  const fetchTasks = async () => {
    try {
      const data = await getAuthorized('/tasks/');
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
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


  const addTask = async () => {
    try {
      const response = await postAuthorized('tasks/', newTask);
      setTasks([...tasks, response]);
      setNewTask({ name: '', event: '', status: 'Pending' });
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';

    try {
      await putAuthorized(`tasks/${id}/`, {
        ...task,
        status: newStatus
      });

      setTasks(tasks.map(task =>
        task.id === id
          ? { ...task, status: newStatus }
          : task
      ));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event" className="text-right">
                Event
              </Label>
              <Input
                id="event"
                value={newTask.event}
                onChange={(e) => setNewTask({ ...newTask, event: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                onValueChange={(value) => setNewTask({ ...newTask, status: value as 'Pending' | 'Completed' })}
                defaultValue={newTask.status}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addTask}>Add Task</Button>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map(task => (
            <TableRow key={task.id}>
              <TableCell>{task.name}</TableCell>
              <TableCell>{task.event}</TableCell>
              <TableCell>
                <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => toggleTaskStatus(task.id)}>
                  {task.status === 'Completed' ? (
                    <><XCircle className="mr-2 h-4 w-4" /> Mark Pending</>
                  ) : (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Mark Completed</>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
