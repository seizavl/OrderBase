//! app/page.tsx
'use client';

import { Product, Tag } from '@/types';
import { useEffect, useState } from 'react';
import TagList from './Taglist';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import ProductRegisterModal from './ProductRegisterModal';


export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = () => {
    fetch('http://localhost:8080/api/products/mine', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          setError(data.length === 0 ? '商品がありません' : '');
        } else {
          setError(data.error || '取得失敗');
        }
      })
      .catch(() => setError('通信エラー'));
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: number) => {
    if (!confirm('本当に削除しますか？')) return;
    const res = await fetch(`http://localhost:8080/api/products/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      alert('削除しました');
      setSelectedProduct(null);
      fetchProducts();
    } else {
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">登録済み商品</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          ＋ 新規登録
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
        ))}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <ProductRegisterModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}