'use client'

import { useEffect, useState } from 'react'
import '@/app/globals.css'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { ToastProvider } from '@/components/ToastContainer'

const tabTitles: Record<string, string> = {
  '/dashboard': 'マイダッシュボード',
  '/edit': '表示・編集ページ',
  '/html-viewer': 'HTMLビューア',
  '/reservations': '予約確認',
  '/products': '商品登録',
  '/attendance': '勤怠管理',
  '/settings': '設定',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/dashboard', {
          withCredentials: true,
        })
        setUsername(res.data.username)
      } catch (err) {
        console.error('ユーザー取得失敗', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <html lang="ja">
        <body className="bg-gray-50 flex justify-center items-center min-h-screen">
          <p className="text-gray-500 text-sm">ユーザー情報取得中...</p>
        </body>
      </html>
    )
  }

  const title = tabTitles[pathname] ?? 'ダッシュボード'

  return (
    <html lang="ja">
      <body className="bg-white">
        <ToastProvider>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header username={username} title={title} />
              <main className="flex-1 overflow-hidden">{children}</main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
