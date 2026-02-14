'use client'

import { useState, useMemo } from 'react'
import { Clock, Calendar, Users, TrendingUp, User, Search, Filter, Download, Edit2, CheckCircle, XCircle } from 'lucide-react'

type AttendanceRecord = {
  id: number
  userId: number
  userName: string
  date: string
  clockIn: string
  clockOut?: string
  breakTime: number // 休憩時間（分）
  workHours?: number // 勤務時間（時間）
  status: 'working' | 'completed' | 'absent'
  notes?: string
}

type Staff = {
  id: number
  name: string
  position: string
  status: 'active' | 'inactive'
}

export default function AttendancePage() {
  // スタッフデータ
  const [staffList] = useState<Staff[]>([
    { id: 1, name: '山田太郎', position: 'マネージャー', status: 'active' },
    { id: 2, name: '佐藤花子', position: 'スタッフ', status: 'active' },
    { id: 3, name: '鈴木一郎', position: 'スタッフ', status: 'active' },
    { id: 4, name: '田中美咲', position: 'アルバイト', status: 'active' },
    { id: 5, name: '高橋健太', position: 'アルバイト', status: 'active' },
  ])

  // 勤怠記録データ
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    // 2026-01-29のデータ
    { id: 1, userId: 1, userName: '山田太郎', date: '2026-01-29', clockIn: '09:00', clockOut: '18:00', breakTime: 60, workHours: 8, status: 'completed' },
    { id: 2, userId: 2, userName: '佐藤花子', date: '2026-01-29', clockIn: '09:15', clockOut: '17:30', breakTime: 60, workHours: 7.25, status: 'completed' },
    { id: 3, userId: 3, userName: '鈴木一郎', date: '2026-01-29', clockIn: '10:00', breakTime: 0, status: 'working' },
    { id: 4, userId: 4, userName: '田中美咲', date: '2026-01-29', clockIn: '14:00', clockOut: '20:00', breakTime: 30, workHours: 5.5, status: 'completed' },

    // 2026-01-28のデータ
    { id: 5, userId: 1, userName: '山田太郎', date: '2026-01-28', clockIn: '09:00', clockOut: '18:30', breakTime: 60, workHours: 8.5, status: 'completed' },
    { id: 6, userId: 2, userName: '佐藤花子', date: '2026-01-28', clockIn: '09:00', clockOut: '17:00', breakTime: 60, workHours: 7, status: 'completed' },
    { id: 7, userId: 3, userName: '鈴木一郎', date: '2026-01-28', clockIn: '10:00', clockOut: '19:00', breakTime: 60, workHours: 8, status: 'completed' },
    { id: 8, userId: 5, userName: '高橋健太', date: '2026-01-28', clockIn: '18:00', clockOut: '22:00', breakTime: 0, workHours: 4, status: 'completed' },

    // 2026-01-27のデータ
    { id: 9, userId: 1, userName: '山田太郎', date: '2026-01-27', clockIn: '09:00', clockOut: '18:00', breakTime: 60, workHours: 8, status: 'completed' },
    { id: 10, userId: 2, userName: '佐藤花子', date: '2026-01-27', clockIn: '09:00', clockOut: '17:00', breakTime: 60, workHours: 7, status: 'completed' },
    { id: 11, userId: 4, userName: '田中美咲', date: '2026-01-27', clockIn: '14:00', clockOut: '20:00', breakTime: 30, workHours: 5.5, status: 'completed' },
  ])

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState('2026-01')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'working' | 'completed' | 'absent'>('all')
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')

  // 今日の日付
  const today = new Date().toISOString().split('T')[0]

  // 選択日の勤怠記録
  const dailyRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === selectedDate)
  }, [attendanceRecords, selectedDate])

  // 選択日にいないスタッフを表示
  const absentStaff = useMemo(() => {
    const presentStaffIds = new Set(dailyRecords.map(r => r.userId))
    return staffList.filter(s => !presentStaffIds.has(s.id))
  }, [staffList, dailyRecords])

  // 月次統計（スタッフ別）
  const monthlyStats = useMemo(() => {
    const recordsInMonth = attendanceRecords.filter(r => r.date.startsWith(selectedMonth) && r.status === 'completed')

    const staffStats = staffList.map(staff => {
      const staffRecords = recordsInMonth.filter(r => r.userId === staff.id)
      const totalHours = staffRecords.reduce((sum, r) => sum + (r.workHours || 0), 0)
      const totalDays = staffRecords.length

      return {
        ...staff,
        totalHours: totalHours.toFixed(1),
        totalDays,
        avgHours: totalDays > 0 ? (totalHours / totalDays).toFixed(1) : '0.0'
      }
    })

    return staffStats
  }, [attendanceRecords, selectedMonth, staffList])

  // 全体の統計
  const overallStats = useMemo(() => {
    const recordsInMonth = attendanceRecords.filter(r =>
      r.date.startsWith(selectedMonth) && r.status === 'completed'
    )

    const totalWorkHours = recordsInMonth.reduce((sum, r) => sum + (r.workHours || 0), 0)
    const totalStaff = staffList.filter(s => s.status === 'active').length
    const workingToday = dailyRecords.filter(r => r.status === 'working').length

    return {
      totalWorkHours: totalWorkHours.toFixed(1),
      totalStaff,
      workingToday,
      avgHoursPerStaff: totalStaff > 0 ? (totalWorkHours / totalStaff).toFixed(1) : '0.0'
    }
  }, [attendanceRecords, selectedMonth, staffList, dailyRecords])

  // ステータスバッジ
  const StatusBadge = ({ status }: { status: 'working' | 'completed' | 'absent' }) => {
    const config = {
      working: { label: '勤務中', icon: CheckCircle, className: 'bg-green-100 text-green-700 border-green-300' },
      completed: { label: '退勤済み', icon: CheckCircle, className: 'bg-blue-100 text-blue-700 border-blue-300' },
      absent: { label: '欠勤', icon: XCircle, className: 'bg-gray-100 text-gray-700 border-gray-300' },
    }

    const { label, icon: Icon, className } = config[status]

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    )
  }

  return (
    <div className="h-full overflow-auto p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">勤怠管理（店長用）</h1>
            <p className="text-gray-600">スタッフの勤怠状況を管理できます</p>
          </div>
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            CSV出力
          </button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">総スタッフ数</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{overallStats.totalStaff}名</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">現在勤務中</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{overallStats.workingToday}名</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">今月の総労働時間</p>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{overallStats.totalWorkHours}h</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">スタッフ平均労働時間</p>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{overallStats.avgHoursPerStaff}h</p>
          </div>
        </div>

        {/* ビュー切り替えと日付選択 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* ビュー切り替え */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'daily'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                日次表示
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                月次集計
              </button>
            </div>

            {/* 日付/月選択 */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              {viewMode === 'daily' ? (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            {viewMode === 'daily' && (
              <>
                {/* 検索 */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="スタッフ名で検索..."
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
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">全て</option>
                    <option value="working">勤務中</option>
                    <option value="completed">退勤済み</option>
                    <option value="absent">欠勤</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 日次表示 */}
        {viewMode === 'daily' ? (
          <>
            {/* 本日の勤怠状況 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  {selectedDate === today ? '本日' : selectedDate}の勤怠状況
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スタッフ名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">役職</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出勤時刻</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">退勤時刻</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">休憩時間</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">勤務時間</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dailyRecords
                      .filter(r =>
                        (statusFilter === 'all' || r.status === statusFilter) &&
                        (searchTerm === '' || r.userName.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map(record => {
                        const staff = staffList.find(s => s.id === record.userId)
                        return (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">{record.userName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{staff?.position}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{record.clockIn}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{record.clockOut || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{record.breakTime}分</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {record.workHours ? `${record.workHours}時間` : '-'}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={record.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {}}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="編集"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}

                    {/* 欠勤スタッフ */}
                    {statusFilter === 'all' || statusFilter === 'absent' ? (
                      absentStaff.map(staff => (
                        <tr key={`absent-${staff.id}`} className="hover:bg-gray-50 transition-colors bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-500">{staff.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{staff.position}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">-</td>
                          <td className="px-6 py-4 text-sm text-gray-400">-</td>
                          <td className="px-6 py-4 text-sm text-gray-400">-</td>
                          <td className="px-6 py-4 text-sm text-gray-400">-</td>
                          <td className="px-6 py-4">
                            <StatusBadge status="absent" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {}}
                                className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-600"
                              >
                                勤怠登録
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* 月次集計表示 */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {selectedMonth}の月次集計
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スタッフ名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">役職</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出勤日数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">総勤務時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均勤務時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthlyStats.map(stat => (
                    <tr key={stat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{stat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{stat.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{stat.totalDays}日</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{stat.totalHours}時間</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{stat.avgHours}時間</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          stat.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {stat.status === 'active' ? '在籍中' : '退職'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
