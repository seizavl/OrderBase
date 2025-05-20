'use client'
import { useRef, useEffect, useState } from 'react'
import { ChevronDown, User, LogOut, Settings } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function UserDropdown({ username }: { username: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8080/api/logout', { withCredentials: true })
      router.push('/login')
    } catch (err) {
      console.error('ログアウト失敗', err)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
          <User className="h-5 w-5" />
        </div>
        <span className="text-gray-700 font-medium">{username}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-10 py-1">
          <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Settings className="h-4 w-4 mr-2" />
            設定
          </button>
          <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </button>
        </div>
      )}
    </div>
  )
}
