'use client'
import { usePathname, useRouter } from 'next/navigation'
import { ClipboardList, Calendar, Package, Clock, LayoutGrid, Home } from 'lucide-react'
import clsx from 'clsx'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menu = [
    { label: 'ダッシュボード', icon: Home, path: '/dashboard' },
    { label: '表示・編集ページ', icon: ClipboardList, path: '/edit' },
    { label: '予約確認', icon: Calendar, path: '/reservations' },
    { label: '商品登録', icon: Package, path: '/products' },
    { label: '勤怠管理', icon: Clock, path: '/attendance' },
  ]

  return (
    <aside className="w-64 min-h-screen bg-indigo-100 shadow-md border-r border-indigo-200">
      <div className="p-6">
        <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          メニュー
        </h2>
      </div>
      <nav className="space-y-2 px-4 text-indigo-800 font-medium">
        {menu.map(({ label, icon: Icon, path }) => {
          const isActive = pathname === path
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={clsx(
                'flex items-center gap-2 w-full text-left px-4 py-2 rounded-md transition',
                isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-200'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
