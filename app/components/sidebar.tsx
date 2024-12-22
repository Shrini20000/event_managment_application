import Link from 'next/link'
import { Calendar, Users, CheckSquare } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-3xl font-bold text-blue-600">EventMaster</h1>
      </div>
      <ul className="flex flex-col py-4">
        <li>
          <Link href="/" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
            <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><Calendar /></span>
            <span className="text-sm font-medium">Events</span>
          </Link>
        </li>
        <li>
          <Link href="/attendees" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
            <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><Users /></span>
            <span className="text-sm font-medium">Attendees</span>
          </Link>
        </li>
        <li>
          <Link href="/tasks" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
            <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><CheckSquare /></span>
            <span className="text-sm font-medium">Tasks</span>
          </Link>
        </li>
      </ul>
    </div>
  )
}

