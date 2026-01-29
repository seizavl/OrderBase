//! app/page.tsx
'use client';

import { Product, Tag } from '@/types';
import { useEffect, useState } from 'react';
import TagList from './Taglist';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import ProductRegisterModal from './ProductRegisterModal';
import { useToast } from '@/components/ToastContainer';


export default function ProductListPage() {
  const { showToast } = useToast();
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
          showToast(data.error || '取得失敗', 'error');
        }
      })
      .catch(() => {
        setError('通信エラー');
        showToast('通信エラー', 'error');
      });
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
      showToast('削除しました', 'success');
      setSelectedProduct(null);
      fetchProducts();
    } else {
      showToast('削除に失敗しました', 'error');
    }
  };

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">登録済み商品</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
            >
              ＋ 新規登録
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
            ))}
          </div>
        </div>

        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onDelete={handleDelete}
            onUpdate={fetchProducts}
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
    </div>
  );
}