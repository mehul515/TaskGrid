"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Layers, CheckSquare, Mail, LogOut, Menu, X } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

const Sidebar = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)

  const toggleSidebar = () => setIsOpen(!isOpen)

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Projects", icon: Layers, path: "/projects" },
    { name: "Tasks", icon: CheckSquare, path: "/tasks" },
    { name: "Invitations", icon: Mail, path: "/invitations" },
  ]

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/" // or use router.push("/") if you're using Next Router
  }

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'
        } md:w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-800">
            <div className="h-8 w-8 bg-teal-500 rounded-md flex items-center justify-center">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TaskGrid</span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      pathname === item.path
                        ? 'bg-teal-500/10 text-teal-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          {user && (
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3 px-2 py-3">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
                  {user.user_metadata?.name?.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.user_metadata?.name || user.email}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white cursor-pointer">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
