
import React, { useState } from 'react';
import { Product } from '@/types';
import { useToast } from '@/components/ToastContainer';

export default function ProductDetailModal({
  product,
  onClose,
  onDelete,
  onUpdate,
}: {
  product: Product;
  onClose: () => void;
  onDelete: (id: number) => void;
  onUpdate?: () => void;
}) {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [labels, setLabels] = useState(product.labels || '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('labels', labels);

    try {
      const res = await fetch(`http://localhost:8080/api/products/${product.id}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });

      if (res.ok) {
        showToast('商品を更新しました', 'success');
        setIsEditing(false);
        if (onUpdate) onUpdate();
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        const data = await res.json();
        showToast(data.error || '更新に失敗しました', 'error');
      }
    } catch (error) {
      showToast('通信エラー', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>

        {!isEditing ? (
          <>
            <h2 className="text-xl font-bold mb-4">商品詳細</h2>
            <div className="mb-4">
              <img
                src={`http://localhost:8080${product.imagePath}`}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <p className="mb-2"><strong>名前:</strong> {product.name}</p>
              <p className="mb-2"><strong>価格:</strong> {product.price} 円</p>
              {product.labels && (
                <div className="mb-2">
                  <strong>ラベル:</strong>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {product.labels.split(',').map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full"
                      >
                        {label.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                削除
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">商品を編集</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">商品名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">価格</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">ラベル（カンマ区切り）</label>
                <input
                  type="text"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="例: ラーメン,人気"
                />
                <p className="text-xs text-gray-500 mt-1">複数のラベルはカンマで区切ってください</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(product.name);
                    setPrice(product.price.toString());
                    setLabels(product.labels || '');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
