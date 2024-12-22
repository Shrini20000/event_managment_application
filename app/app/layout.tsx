import './globals.css'
import { Inter } from 'next/font/google'
import { Sidebar } from '../components/sidebar'
import { Header } from '../components/header'
import { SearchProvider } from '../components/search-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Event Management Dashboard',
  description: 'Streamline your event planning process',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SearchProvider>
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                <div className="container mx-auto px-6 py-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </SearchProvider>
      </body>
    </html>
  )
}

