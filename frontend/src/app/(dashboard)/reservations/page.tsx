'use client'

import { useState, useMemo } from 'react'
import { Calendar, Clock, Users, Phone, Mail, Plus, Filter, Search, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type ReservationStatus = 'confirmed' | 'pending' | 'cancelled'

type Reservation = {
  id: number
  customerName: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  status: ReservationStatus
  specialRequests?: string
}

export default function ReservationsPage() {
  // モックデータ
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      customerName: '山田太郎',
      email: 'yamada@example.com',
      phone: '090-1234-5678',
      date: '2026-02-05',
      time: '18:00',
      guests: 4,
      status: 'confirmed',
      specialRequests: '窓側の席希望'
    },
    {
      id: 2,
      customerName: '佐藤花子',
      email: 'sato@example.com',
      phone: '090-8765-4321',
      date: '2026-02-06',
      time: '19:30',
      guests: 2,
      status: 'pending',
    },
    {
      id: 3,
      customerName: '鈴木一郎',
      email: 'suzuki@example.com',
      phone: '080-1111-2222',
      date: '2026-02-05',
      time: '20:00',
      guests: 6,
      status: 'confirmed',
      specialRequests: 'アレルギー: 小麦'
    },
    {
      id: 4,
      customerName: '田中美咲',
      email: 'tanaka@example.com',
      phone: '070-3333-4444',
      date: '2026-02-07',
      time: '12:00',
      guests: 3,
      status: 'cancelled',
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')

  // フィルタリングと検索
  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reservation.phone.includes(searchTerm) ||
                           reservation.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [reservations, searchTerm, statusFilter])

  // ステータス変更
  const updateStatus = (id: number, newStatus: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  // 削除
  const deleteReservation = (id: number) => {
    if (confirm('この予約を削除しますか？')) {
      setReservations(prev => prev.filter(r => r.id !== id))
    }
  }

  // ステータスバッジ
  const StatusBadge = ({ status }: { status: ReservationStatus }) => {
    const config = {
      confirmed: { label: '確認済み', icon: CheckCircle, className: 'bg-green-100 text-green-700 border-green-300' },
      pending: { label: '保留中', icon: AlertCircle, className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      cancelled: { label: 'キャンセル', icon: XCircle, className: 'bg-red-100 text-red-700 border-red-300' },
    }

    const { label, icon: Icon, className } = config[status]

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    )
  }

  // 統計
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      pending: reservations.filter(r => r.status === 'pending').length,
      today: reservations.filter(r => r.date === today && r.status !== 'cancelled').length,
    }
  }, [reservations])

  return (
    <div className="h-full overflow-auto p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">予約確認</h1>
          <p className="text-gray-600">予約の管理・確認ができます</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総予約数</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">確認済み</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">保留中</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本日の予約</p>
                <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* フィルターとアクション */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="顧客名、電話番号、メールで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* ステータスフィルター */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="confirmed">確認済み</option>
                <option value="pending">保留中</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>

            {/* 追加ボタン */}
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              新規予約
            </button>
          </div>
        </div>

        {/* 予約一覧テーブル */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客情報</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">人数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">特記事項</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      予約が見つかりません
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-900">{reservation.customerName}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Phone className="w-3 h-3" />
                            {reservation.phone}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            {reservation.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Calendar className="w-4 h-4" />
                            {reservation.date}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4" />
                            {reservation.time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Users className="w-4 h-4" />
                          {reservation.guests}名
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={reservation.status} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {reservation.specialRequests || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {reservation.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(reservation.id, 'confirmed')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="確認済みにする"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {reservation.status !== 'cancelled' && (
                            <button
                              onClick={() => updateStatus(reservation.id, 'cancelled')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="キャンセル"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteReservation(reservation.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
