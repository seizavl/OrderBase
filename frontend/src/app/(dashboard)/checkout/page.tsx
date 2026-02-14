'use client'

import { useState, useEffect, useRef } from 'react'
import { QrCode, X, CheckCircle, AlertCircle } from 'lucide-react'

interface Table {
  id: number
  table_number: number
  capacity: number
  status: string
}

interface Product {
  id: number
  name: string
  price: number
  imagePath: string
}

interface Order {
  id: number
  product_id: number
  quantity: number
  total_price: number
  status: string
  created_at: string
  product?: Product
}

export default function CheckoutPage() {
  const [scanMode, setScanMode] = useState(true)
  const [urlInput, setUrlInput] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // QRコードスキャナーの初期化
  useEffect(() => {
    if (scanMode && videoRef.current && !stream) {
      startCamera()
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [scanMode])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError('カメラへのアクセスが許可されていません')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  // URLから table パラメータを抽出
  const extractTableNumber = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const table = urlObj.searchParams.get('table')
      return table || ''
    } catch {
      return ''
    }
  }

  // テーブル情報と注文を取得
  const fetchTableOrders = async (tableNum: string) => {
    if (!tableNum) {
      setError('テーブル番号が無効です')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
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

      // pending の注文のみを対象にする
      const activeOrders = tableOrders.filter((o: Order) => o.status === 'pending')
      setOrders(activeOrders)

      // 合計金額を計算
      const total = activeOrders.reduce((sum: number, order: Order) => sum + order.total_price, 0)
      setTotalAmount(total)

      if (activeOrders.length === 0) {
        setError('このテーブルに注文がありません')
      }
    } catch (err) {
      setError('処理中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // URLを処理
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) {
      setError('URLを入力してください')
      return
    }

    const tableNum = extractTableNumber(urlInput)
    if (!tableNum) {
      setError('URLからテーブル番号が見つかりません')
      return
    }

    setTableNumber(tableNum)
    fetchTableOrders(tableNum)
    setScanMode(false)
    stopCamera()
  }

  // テーブル番号で検索
  const handleTableNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tableNumber.trim()) {
      setError('テーブル番号を入力してください')
      return
    }

    fetchTableOrders(tableNumber)
    setScanMode(false)
    stopCamera()
  }

  // 会計完了処理
  const completeCheckout = async () => {
    if (!selectedTable) return

    if (!confirm(`テーブル ${selectedTable.table_number} の会計を完了しますか？`)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      // すべての注文を completed に更新
      for (const order of orders) {
        if (order.status === 'pending') {
          await fetch(`http://localhost:8080/api/orders/${order.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: 'completed' })
          })
        }
      }

      // テーブルを inactive に更新
      await fetch(`http://localhost:8080/api/tables/${selectedTable.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'inactive' })
      })

      setSuccess('会計が完了しました')
      setCheckoutComplete(true)

      // 3秒後にリセット
      setTimeout(() => {
        reset()
      }, 3000)
    } catch (err) {
      setError('会計処理に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setSelectedTable(null)
    setOrders([])
    setTotalAmount(0)
    setReceivedAmount(0)
    setTableNumber('')
    setUrlInput('')
    setScanMode(true)
    setError('')
    setSuccess('')
    setCheckoutComplete(false)
  }

  if (checkoutComplete && selectedTable) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-md">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-700 mb-2">会計完了</h2>
          <p className="text-lg text-gray-700 mb-4">
            テーブル {selectedTable.table_number}
          </p>
          <p className="text-2xl font-bold text-gray-800 mb-6">
            ¥{totalAmount.toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm">5秒後に自動リセット...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">会計処理</h1>
          <p className="text-gray-600">QRコード または URLからテーブルを指定</p>
        </div>

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* 左: 入力セクション */}
          <div className="overflow-y-auto">
            {/* タブ */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setScanMode(true)
                  startCamera()
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  scanMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <QrCode className="w-5 h-5" />
                QRコード
              </button>
              <button
                onClick={() => {
                  setScanMode(false)
                  stopCamera()
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  !scanMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>📋</span>
                URL・テーブル番号
              </button>
            </div>

            {scanMode ? (
              // QRコードスキャナー
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-base font-bold text-gray-800 mb-3">QRコードをスキャン</h2>
                <div className="relative bg-black rounded-lg overflow-hidden mb-3" style={{ paddingBottom: '100%' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            ) : (
              // URL・テーブル番号入力
              <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
                <div>
                  <h2 className="text-base font-bold text-gray-800 mb-3">URL入力</h2>
                  <form onSubmit={handleUrlSubmit} className="space-y-2">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="QRコードのURL を貼り付け"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                    >
                      {loading ? '処理中...' : '確認'}
                    </button>
                  </form>
                </div>

                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 border-t border-gray-300" />
                  <span className="text-gray-500 text-xs">または</span>
                  <div className="flex-1 border-t border-gray-300" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-3">テーブル番号入力</h3>
                  <form onSubmit={handleTableNumberSubmit} className="space-y-2">
                    <input
                      type="number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="テーブル番号を入力（例: 1, 2, 3...）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                    >
                      {loading ? '処理中...' : '確認'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* 右: 注文・会計セクション */}
          <div className="overflow-y-auto">
            {selectedTable ? (
              <div className="bg-white rounded-lg shadow-lg p-4">
                {/* テーブル情報 */}
                <div className="mb-4 pb-4 border-b">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    テーブル {selectedTable.table_number}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedTable.capacity}人席 • {selectedTable.status === 'active' ? 'アクティブ' : '非アクティブ'}
                  </p>
                </div>

                {/* 注文リスト */}
                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-800 mb-3">注文内容</h3>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">注文がありません</p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-start justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800">
                              {order.product?.name || '商品情報なし'}
                            </p>
                            <p className="text-xs text-gray-600">
                              数量: {order.quantity} • ¥{order.product?.price.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="text-right font-bold text-sm text-gray-800 ml-2">
                            ¥{order.total_price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 会計情報 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 space-y-2">
                  {/* 金額計算 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm text-gray-700">
                      <span>小計</span>
                      <span className="font-semibold">¥{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>税金（10%）</span>
                      <span>¥{Math.floor(totalAmount * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-1 flex justify-between items-center">
                      <span className="text-base font-bold text-gray-800">合計</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ¥{Math.floor(totalAmount * 1.1).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 受取金額入力 */}
                  <div className="border-t border-gray-300 pt-2">
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      受取金額
                    </label>
                    <input
                      type="number"
                      value={receivedAmount || ''}
                      onChange={(e) => setReceivedAmount(Number(e.target.value) || 0)}
                      placeholder="金額を入力"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* お釣り計算 - インライン表示 */}
                  {receivedAmount > 0 && (
                    <div className="border-t border-gray-300 pt-2 bg-white/50 rounded px-2 py-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-600">受取金額</p>
                        <p className="text-sm font-bold">¥{receivedAmount.toLocaleString()}</p>
                      </div>
                      <div className={`text-right ${
                        receivedAmount >= Math.floor(totalAmount * 1.1)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        <p className="text-xs font-bold">お釣り</p>
                        <p className="text-lg font-bold">
                          ¥{Math.max(0, receivedAmount - Math.floor(totalAmount * 1.1)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {receivedAmount > 0 && receivedAmount < Math.floor(totalAmount * 1.1) && (
                    <div className="bg-red-50 rounded px-2 py-1 border border-red-200">
                      <p className="text-xs text-red-600 font-semibold">
                        不足: ¥{Math.floor(totalAmount * 1.1) - receivedAmount}
                      </p>
                    </div>
                  )}
                </div>

                {/* ボタン */}
                <div className="space-y-2 mt-4">
                  <button
                    onClick={completeCheckout}
                    disabled={loading || orders.length === 0}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-bold text-base"
                  >
                    {loading ? '処理中...' : '会計完了'}
                  </button>
                  <button
                    onClick={reset}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-400 transition-colors font-medium"
                  >
                    リセット
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center sticky top-8">
                <div className="text-gray-400 mb-4">
                  <QrCode className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-600 text-lg">
                  QRコード または テーブル番号を<br />入力してください
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
