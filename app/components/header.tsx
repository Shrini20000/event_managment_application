'use client'

import { Bell, Search, LogOut } from 'lucide-react'
import { useSearch } from './search-context'
import { useAuthToken } from '../utils/auth_utils'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Header() {
  const { searchTerm, setSearchTerm } = useSearch()
  const { logout } = useAuthToken()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="ml-2 p-2 text-gray-500 hover:text-gray-700">
          <Search size={20} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </button>
        <img
          src="https://via.placeholder.com/40"
          alt="User avatar"
          className="w-10 h-10 rounded-full"
        />
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-700"
        >
          <LogOut size={20} />
        </Button>
      </div>
    </header>
  )
}