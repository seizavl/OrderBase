'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, ShoppingCart, Package, Calendar, Trophy } from 'lucide-react'

interface DashboardStats {
  today_sales: number
  month_sales: number
  year_sales: number
  total_sales: number
  today_orders: number
  month_orders: number
  year_orders: number
  total_orders: number
  pending_orders: number
  completed_orders: number
  cancelled_orders: number
  top_products: ProductStats[]
  recent_orders: Order[]
}

interface ProductStats {
  product_id: number
  product_name: string
  product_image: string
  total_sold: number
  total_revenue: number
}

interface Order {
  id: number
  product_id: number
  quantity: number
  total_price: number
  status: string
  created_at: string
  product?: {
    name: string
    price: number
    imagePath: string
  }
  user?: {
    username: string
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/dashboard/stats', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('統計情報の取得に失敗:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-600 text-lg">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">ダッシュボード</h1>

        {/* 売上統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 今日の売上 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">今日</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">¥{stats?.today_sales.toLocaleString() || 0}</div>
            <p className="text-sm text-gray-600 mt-1">{stats?.today_orders || 0}件の注文</p>
          </div>

          {/* 今月の売上 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">今月</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">¥{stats?.month_sales.toLocaleString() || 0}</div>
            <p className="text-sm text-gray-600 mt-1">{stats?.month_orders || 0}件の注文</p>
          </div>

          {/* 今年の売上 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">今年</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">¥{stats?.year_sales.toLocaleString() || 0}</div>
            <p className="text-sm text-gray-600 mt-1">{stats?.year_orders || 0}件の注文</p>
          </div>

          {/* 総売上 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">総計</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">¥{stats?.total_sales.toLocaleString() || 0}</div>
            <p className="text-sm text-gray-600 mt-1">{stats?.total_orders || 0}件の注文</p>
          </div>
        </div>

        {/* 注文ステータス */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">処理中の注文</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.pending_orders || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Package className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">完了した注文</p>
                <p className="text-3xl font-bold text-green-600">{stats?.completed_orders || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">キャンセルされた注文</p>
                <p className="text-3xl font-bold text-red-600">{stats?.cancelled_orders || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Package className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 人気商品 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-800">人気商品トップ5</h2>
            </div>
            {stats?.top_products && stats.top_products.length > 0 ? (
              <div className="space-y-4">
                {stats.top_products.map((product, index) => (
                  <div key={product.product_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    {product.product_image && (
                      <img
                        src={`http://localhost:8080${product.product_image}`}
                        alt={product.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{product.product_name}</h3>
                      <p className="text-sm text-gray-600">販売数: {product.total_sold}個</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">¥{product.total_revenue.toLocaleString()}</div>
                      <p className="text-xs text-gray-500">売上</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">まだ売上データがありません</p>
            )}
          </div>

          {/* 最近の注文 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">最近の注文</h2>
            </div>
            {stats?.recent_orders && stats.recent_orders.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {stats.recent_orders.map((order) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{order.product?.name || '商品情報なし'}</h3>
                        <p className="text-sm text-gray-600">数量: {order.quantity}個</p>
                        {order.user && (
                          <p className="text-xs text-gray-500">購入者: {order.user.username}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">¥{order.total_price.toLocaleString()}</div>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status === 'completed' ? '完了' :
                           order.status === 'pending' ? '処理中' : 'キャンセル'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">まだ注文がありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}