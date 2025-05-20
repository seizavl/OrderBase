'use client'
import { Bell, Home } from 'lucide-react'
import UserDropdown from './UserDropdown'

type Props = {
  username: string
  title: string
}

export default function Header({ username, title }: Props) {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* タイトル・アイコン */}
        <div className="flex items-center">
          <Home className="h-6 w-6 text-indigo-600" />
          <h1 className="ml-2 text-xl font-semibold text-gray-800">{title}</h1>
        </div>

        {/* 通知ベル & ユーザーメニュー */}
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition">
            <Bell className="h-6 w-6" />
          </button>
          <UserDropdown username={username} />
        </div>
      </div>
    </header>
  )
}
