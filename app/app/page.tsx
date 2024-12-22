'use client';
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { EventList } from '../components/event-list'
import { useRouter } from 'next/navigation';
import { useAuthToken } from '../utils/auth_utils'

export default function EventsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthToken();

  if (!isAuthenticated) {
    router.push('/auth');
    return null;
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Events</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>
      <EventList />
    </div>
  )
}

