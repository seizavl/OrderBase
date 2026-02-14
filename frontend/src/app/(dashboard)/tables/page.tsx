'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, QrCode, Printer, CheckCircle, XCircle, Grid3x3, ShoppingBag } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { Table, CreateTableRequest, UpdateTableRequest } from '@/types/table'

interface Product {
  id: number;
  name: string;
  price: number;
  imagePath: string;
}

interface TableOrder {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  product?: Product;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [mainMenuPage, setMainMenuPage] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [tableOrders, setTableOrders] = useState<TableOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // フォームデータ
  const [formData, setFormData] = useState<CreateTableRequest>({
    table_number: 1,
    capacity: 4,
    status: 'active'
  })

  // ユーザー情報とメインメニューを取得
  useEffect(() => {
    fetchUserInfo()
    fetchMainMenu()
    fetchTables()

    // テーブル情報を5秒ごとに更新（テーブル非アクティブの検出用）
    const interval = setInterval(fetchTables, 5000)
    return () => clearInterval(interval)
  }, [])

  // 選択されたテーブルの情報を更新
  useEffect(() => {
    if (selectedTable) {
      const currentTable = tables.find(t => t.id === selectedTable.id)
      if (currentTable) {
        // テーブル情報を更新（非アクティブでも表示を維持）
        setSelectedTable(currentTable)
      } else {
        // テーブルが削除された場合のみリセット
        setSelectedTable(null)
        setTableOrders([])
      }
    }
  }, [tables, selectedTable?.id])

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/dashboard', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setUsername(data.username || '')
      }
    } catch (error) {
    }
  }

  const fetchMainMenu = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/user/main-menu', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setMainMenuPage(data.main_menu_page || '')
      }
    } catch (error) {
    }
  }

  const fetchTables = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/tables', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setTables(data.tables || [])
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const fetchTableOrders = async (tableId: number) => {
    try {
      setLoadingOrders(true)
      const res = await fetch(`http://localhost:8080/api/tables/${tableId}/orders`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setTableOrders(data.orders || [])
      }
    } catch (error) {
      setTableOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleCreateOrUpdate = async () => {
    try {
      if (editingTable) {
        // 更新
        const res = await fetch(`http://localhost:8080/api/tables/${editingTable.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        if (res.ok) {
          fetchTables()
          setShowModal(false)
          setEditingTable(null)
        }
      } else {
        // 作成
        const res = await fetch('http://localhost:8080/api/tables', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        if (res.ok) {
          fetchTables()
          setShowModal(false)
        }
      }
    } catch (error) {
    }
  }

  const handleDelete = async (table: Table) => {
    if (!confirm(`テーブル ${table.table_number} を削除しますか？`)) return

    try {
      const res = await fetch(`http://localhost:8080/api/tables/${table.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        fetchTables()
        if (selectedTable?.id === table.id) {
          setSelectedTable(null)
        }
      }
    } catch (error) {
    }
  }

  const handleToggleStatus = async (table: Table) => {
    const newStatus = table.status === 'active' ? 'inactive' : 'active'
    
    try {
      const res = await fetch(`http://localhost:8080/api/tables/${table.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchTables()
      }
    } catch (error) {
    }
  }

  const openCreateModal = () => {
    setEditingTable(null)
    setFormData({ table_number: tables.length + 1, capacity: 4, status: 'active' })
    setShowModal(true)
  }

  const openEditModal = (table: Table) => {
    setEditingTable(table)
    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      status: table.status
    })
    setShowModal(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const getQRValue = () => {
    if (!selectedTable || !username || !mainMenuPage) return ''
    return `http://100.110.79.39:8080/html/view/${username}/${mainMenuPage}?table=${selectedTable.table_number}`
  }

  return (
    <div className="h-full overflow-auto p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">テーブル管理</h1>
            <p className="text-gray-600">QRコードを生成してテーブルに設置できます</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新規テーブル
          </button>
        </div>

        {/* メイン3カラムレイアウト */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左パネル: テーブル一覧 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">テーブル一覧</h2>

            {loading ? (
              <p className="text-gray-500">読み込み中...</p>
            ) : tables.length === 0 ? (
              <p className="text-gray-500">テーブルが登録されていません</p>
            ) : (
              <div className="space-y-2">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTable?.id === table.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedTable(table)
                      fetchTableOrders(table.id)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Grid3x3 className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            テーブル {table.table_number}
                          </p>
                          <p className="text-sm text-gray-500">
                            {table.capacity}人席 • {table.status === 'active' ? 'アクティブ' : '非アクティブ'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleStatus(table)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            table.status === 'active'
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                          title={table.status === 'active' ? 'アクティブ' : '非アクティブ'}
                        >
                          {table.status === 'active' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(table)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(table)
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右パネル: QRコード */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {selectedTable ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  テーブル {selectedTable.table_number} のQRコード
                </h2>

                {!mainMenuPage ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-2">メインメニューが設定されていません</p>
                    <p className="text-sm text-gray-500">
                      HTMLビューアでメインメニューを設定してください
                    </p>
                  </div>
                ) : (
                  <>
                    {/* QRコード表示 */}
                    <div className="flex justify-center mb-6 print:mb-8">
                      <div className="bg-white p-6 rounded-lg border-2 border-gray-300 print:border-4 print:p-8">
                        <QRCodeSVG
                          value={getQRValue()}
                          size={256}
                          level="H"
                          className="print:w-96 print:h-96"
                        />
                      </div>
                    </div>

                    {/* テーブル情報 */}
                    <div className="mb-6 text-center print:mb-8">
                      <p className="text-2xl font-bold text-gray-800 print:text-4xl">
                        テーブル {selectedTable.table_number}
                      </p>
                      <p className="text-gray-600 print:text-xl print:mt-2">
                        {selectedTable.capacity}人席
                      </p>
                    </div>

                    {/* URL表示（印刷時は非表示） */}
                    <div className="mb-6 print:hidden">
                      <p className="text-sm text-gray-600 mb-1">QRコードURL:</p>
                      <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded break-all">
                        {getQRValue()}
                      </p>
                    </div>

                    {/* 印刷ボタン */}
                    <button
                      onClick={handlePrint}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors print:hidden"
                    >
                      <Printer className="w-5 h-5" />
                      QRコードを印刷
                    </button>

                    {/* 印刷時の説明文 */}
                    <div className="hidden print:block text-center mt-8">
                      <p className="text-lg">このQRコードをスキャンしてメニューを表示</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">左側からテーブルを選択してください</p>
              </div>
            )}
          </div>

          {/* 右パネル: テーブル注文情報 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {selectedTable ? (
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  テーブル {selectedTable.table_number} の注文
                </h2>

                {loadingOrders ? (
                  <div className="flex items-center justify-center flex-1">
                    <p className="text-gray-500">読み込み中...</p>
                  </div>
                ) : tableOrders.filter(order => order.status !== 'completed').length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">このテーブルの注文はまだありません</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {tableOrders
                      .filter(order => order.status !== 'completed')
                      .map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">
                              #{order.id} {order.product?.name || '商品情報なし'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleString('ja-JP')}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status === 'pending'
                              ? '保留中'
                              : order.status === 'completed'
                              ? '完了'
                              : 'キャンセル'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">数量: {order.quantity}個</span>
                          <span className="font-semibold text-gray-800">
                            ¥{order.total_price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">左側からテーブルを選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingTable ? 'テーブル編集' : '新規テーブル作成'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  テーブル番号
                </label>
                <input
                  type="number"
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  座席数
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">アクティブ</option>
                  <option value="inactive">非アクティブ</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateOrUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTable ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
