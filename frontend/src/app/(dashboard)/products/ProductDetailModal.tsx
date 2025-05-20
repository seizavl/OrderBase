
import React from 'react';
import { Product } from '@/types';

export default function ProductDetailModal({
  product,
  onClose,
  onDelete,
}: {
  product: Product;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
        <h2 className="text-xl font-bold mb-4">商品詳細</h2>
        <p><strong>名前:</strong> {product.name}</p>
        <p><strong>価格:</strong> {product.price} 円</p>
        <div className="mt-4 flex gap-2">
          <button className="bg-yellow-400 text-white px-4 py-2 rounded">編集</button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded">公開停止</button>
          <button onClick={() => onDelete(product.id)} className="bg-red-500 text-white px-4 py-2 rounded">削除</button>
        </div>
      </div>
    </div>
  );
}
