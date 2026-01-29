'use client'
import { usePathname, useRouter } from 'next/navigation'
import { ClipboardList, Calendar, Package, Clock, LayoutGrid, Home, FileText, Settings, ShoppingBag } from 'lucide-react'
import clsx from 'clsx'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menu = [
    { label: 'ダッシュボード', icon: Home, path: '/dashboard' },
    { label: '表示・編集ページ', icon: ClipboardList, path: '/edit' },
    { label: 'HTMLビューア', icon: FileText, path: '/html-viewer' },
    { label: '注文管理', icon: ShoppingBag, path: '/orders' },
    { label: '予約確認', icon: Calendar, path: '/reservations' },
    { label: '商品登録', icon: Package, path: '/products' },
    { label: '勤怠管理', icon: Clock, path: '/attendance' },
    { label: '設定', icon: Settings, path: '/settings' },
  ]

  return (
    <aside className="w-64 min-h-screen bg-white/80 backdrop-blur-sm shadow-xl border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-blue-600" />
          メニュー
        </h2>
      </div>
      <nav className="space-y-1 px-3 py-4 text-gray-700 font-medium">
        {menu.map(({ label, icon: Icon, path }) => {
          const isActive = pathname === path
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={clsx(
                'flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                  : 'hover:bg-gray-100 hover:translate-x-1'
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
