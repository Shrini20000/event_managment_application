import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { AttendeeList } from '../../components/attendee-list'

export default function AttendeesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Attendees</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Attendee
        </Button>
      </div>
      <AttendeeList />
    </div>
  )
}

