'use client'
import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

interface Order {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    imagePath: string;
  };
}

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const previousOrderCountRef = useRef<number>(0);

  useEffect(() => {
    fetchOrders();

    // 5秒ごとに注文をポーリング
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (isPolling = false) => {
    try {
      const res = await fetch('http://localhost:8080/api/orders', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const newOrders = data.orders || [];

        // 新しい注文があれば通知
        if (isPolling && newOrders.length > previousOrderCountRef.current) {
          const newOrderCount = newOrders.length - previousOrderCountRef.current;
          showToast(`新しい注文が${newOrderCount}件届きました！`, 'success');
        }

        previousOrderCountRef.current = newOrders.length;
        setOrders(newOrders);
      }
    } catch (error) {
      console.error('注文取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4" />
            保留中
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            完了
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" />
            キャンセル
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full text-sm bg-gray-100">{status}</span>;
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast('ステータスを更新しました', 'success');
        fetchOrders();
      } else {
        showToast('更新に失敗しました', 'error');
      }
    } catch (error) {
      showToast('通信エラーが発生しました', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-700 font-medium">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">注文管理</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">まだ注文がありません</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">注文ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">商品</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">数量</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">合計金額</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ステータス</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">注文日時</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {order.product?.imagePath && (
                            <img
                              src={`http://localhost:8080${order.product.imagePath}`}
                              alt={order.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {order.product?.name || '商品情報なし'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.quantity}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ¥{order.total_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">保留中</option>
                          <option value="completed">完了</option>
                          <option value="cancelled">キャンセル</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 ヒント: 生成したHTMLページから商品が購入されると、ここに注文が表示されます
          </p>
        </div>
      </div>
    </div>
  );
}
