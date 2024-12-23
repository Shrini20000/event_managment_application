'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, PlusCircle, Edit } from 'lucide-react'
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

type Event = {
  id: string
  name: string
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    event: '',
    status: 'Pending'
  })

  const fetchTasks = async () => {
    try {
      const data = await getAuthorized('/tasks/');
      if (data.length) {
        setTasks(data);
        localStorage.setItem('tasks', JSON.stringify(data));
      } else {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await getAuthorized('events/');
      setEvents(data);
      localStorage.setItem('events', JSON.stringify(data));
      setError(null);
    } catch (err) {
      const savedEvents = localStorage.getItem('events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    }
  };

  const addTask = async () => {
    try {
      const response = await postAuthorized('tasks/', newTask);
      const updatedTasks = [...tasks, response];
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setNewTask({ name: '', event: '', status: 'Pending' });
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const updateTask = async () => {
    if (!editingTask) return;
    try {
      const response = await putAuthorized(`tasks/${editingTask.id}/`, {
        name: editingTask.name,
        event: editingTask.event,
        status: editingTask.status
      });
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? response : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setIsEditDialogOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
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

      const updatedTasks = tasks.map(task =>
        task.id === id
          ? { ...task, status: newStatus }
          : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  };

  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    fetchTasks();
    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Task Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-500 h-4"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2">
          {completedTasks}/{totalTasks} tasks completed ({progressPercentage.toFixed(0)}%)
        </p>
      </div>

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
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event" className="text-right">Event</Label>
              <Select
                onValueChange={(value) => setNewTask({ ...newTask, event: value })}
              >
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
          </div>
          <Button onClick={addTask}>Add Task</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                value={editingTask?.name || ''}
                onChange={(e) =>
                  setEditingTask(prev => prev ? { ...prev, name: e.target.value } : null)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-event" className="text-right">Event</Label>
              <Select
                value={editingTask?.event}
                onValueChange={(value) =>
                  setEditingTask(prev => prev ? { ...prev, event: value } : null)
                }
              >
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">Status</Label>
              <Select
                value={editingTask?.status}
                onValueChange={(value) =>
                  setEditingTask(prev => prev ? { ...prev, status: value as 'Pending' | 'Completed' } : null)
                }
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
          <Button onClick={updateTask}>Save Changes</Button>
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
              <TableCell>{getEventName(task.event)}</TableCell>
              <TableCell>
                <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditClick(task)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
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

export default TaskList;