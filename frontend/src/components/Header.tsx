'use client'
import { Bell, Home } from 'lucide-react'
import UserDropdown from './UserDropdown'

type Props = {
  username: string
  title: string
}

export default function Header({ username, title }: Props) {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md border-b border-gray-200">
      <div className="px-6 py-3 flex justify-between items-center">
        {/* タイトル・アイコン */}
        <div className="flex items-center">
          <Home className="h-6 w-6 text-blue-600" />
          <h1 className="ml-3 text-xl font-bold text-gray-800">{title}</h1>
        </div>

        {/* 通知ベル & ユーザーメニュー */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all">
            <Bell className="h-5 w-5" />
          </button>
          <UserDropdown username={username} />
        </div>
      </div>
    </header>
  )
}
