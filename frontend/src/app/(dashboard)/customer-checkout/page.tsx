'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, ArrowLeft } from 'lucide-react'

interface Order {
  id: number
  product_id: number
  quantity: number
  total_price: number
  status: string
  created_at: string
  product?: {
    id: number
    name: string
    price: number
    imagePath: string
  }
}

interface Table {
  id: number
  table_number: number
  capacity: number
  status: string
}

export default function CustomerCheckoutPage() {
  const [tableNumber, setTableNumber] = useState<string>('')
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // URLパラメータからテーブル番号を取得
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const table = params.get('table')
    if (table) {
      setTableNumber(table)
      fetchTableInfo(table)
    } else {
      setLoading(false)
      setError('テーブル番号が指定されていません')
    }
  }, [])

  const fetchTableInfo = async (tableNum: string) => {
    try {
      setLoading(true)
      setError('')

      // テーブル一覧から該当テーブルを検索
      const tablesRes = await fetch('http://localhost:8080/api/tables', {
        credentials: 'include'
      })

      if (!tablesRes.ok) {
        setError('テーブル情報の取得に失敗しました')
        setLoading(false)
        return
      }

      const tablesData = await tablesRes.json()
      const table = tablesData.tables?.find((t: Table) => t.table_number === parseInt(tableNum))

      if (!table) {
        setError('テーブルが見つかりません')
        setLoading(false)
        return
      }

      setSelectedTable(table)

      // テーブルの注文を取得
      const ordersRes = await fetch(`http://localhost:8080/api/tables/${table.id}/orders`, {
        credentials: 'include'
      })

      if (!ordersRes.ok) {
        setError('注文情報の取得に失敗しました')
        setLoading(false)
        return
      }

      const ordersData = await ordersRes.json()
      const tableOrders = ordersData.orders || []

      // completed の注文のみを表示（支払い完了した注文）
      const completedOrders = tableOrders.filter((o: Order) => o.status === 'completed')
      setOrders(completedOrders)

      // 合計金額を計算
      const total = completedOrders.reduce((sum: number, order: Order) => sum + order.total_price, 0)
      setTotalAmount(total)
    } catch (err) {
      setError('処理中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-2xl font-bold mb-4">エラーが発生しました</p>
          <p className="text-gray-600 text-lg mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            もう一度試す
          </button>
        </div>
      </div>
    )
  }

  const finalTotal = Math.floor(totalAmount * 1.1)
  const change = receivedAmount > 0 ? Math.max(0, receivedAmount - finalTotal) : 0

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-600 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ご利用ありがとうございました</h1>
          <p className="text-gray-600 text-lg">テーブル {selectedTable?.table_number}</p>
        </div>

        {/* 会計情報パネル */}
        <div className="bg-white rounded-2xl shadow-2xl p-10 mb-8 space-y-6">
          {/* 合計金額 */}
          <div className="border-b border-gray-300 pb-6">
            <p className="text-gray-600 text-center text-lg mb-2">お会計金額</p>
            <p className="text-5xl font-bold text-center text-blue-600">
              ¥{finalTotal.toLocaleString()}
            </p>
            <p className="text-gray-500 text-center text-sm mt-2">（税金込み）</p>
          </div>

          {/* 支払い情報 */}
          {receivedAmount > 0 && (
            <>
              <div className="space-y-4">
                {/* 支払い金額 */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">お支払い金額</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ¥{receivedAmount.toLocaleString()}
                  </p>
                </div>

                {/* お釣り */}
                <div className={`rounded-xl p-4 ${
                  change > 0
                    ? 'bg-green-50'
                    : 'bg-gray-50'
                }`}>
                  <p className="text-gray-600 text-sm mb-1">お釣り</p>
                  <p className={`text-3xl font-bold ${
                    change > 0
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}>
                    ¥{change.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 内訳 */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 border border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>お会計</span>
                  <span className="font-semibold">¥{finalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>お支払い</span>
                  <span className="font-semibold">¥{receivedAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between text-gray-800 font-bold">
                  <span>お釣り</span>
                  <span>¥{change.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}

          {/* 支払い情報がない場合 */}
          {receivedAmount === 0 && (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-600 text-lg">現在お会計処理中です。</p>
              <p className="text-gray-500 text-sm mt-2">店員さんにお知らせください。</p>
            </div>
          )}
        </div>

        {/* メッセージ */}
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">本日のご来店誠にありがとうございました。</p>
          <p className="text-gray-500">またのご来店をお待ちしております。</p>
        </div>

        {/* 注文内容（オプション） */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm max-h-32 overflow-y-auto">
            <h3 className="text-gray-800 font-bold mb-3">ご注文内容</h3>
            <div className="space-y-2 text-sm">
              {orders.map((order) => (
                <div key={order.id} className="flex justify-between text-gray-700">
                  <span>{order.product?.name || '商品'} × {order.quantity}</span>
                  <span className="font-semibold">¥{order.total_price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
