'use client'

import { useEffect, useState } from 'react'
import '@/app/globals.css'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const tabTitles: Record<string, string> = {
  '/dashboard': 'マイダッシュボード',
  '/edit': '表示・編集ページ',
  '/reservations': '予約確認',
  '/products': '商品登録',
  '/attendance': '勤怠管理',
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
      <body className="bg-gray-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header username={username} title={title} />
            <main className="flex-1 bg-white p-8">{children}</main>
            <footer className="bg-white shadow-inner py-4 mt-auto text-center text-sm text-gray-500">
              © 2025 あなたのサービス名
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}
