//! components/ProductRegisterModal.tsx
import React, { useState } from 'react';

export default function ProductRegisterModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setMessage('画像を選択してください');
      return;
    }
    const tagList = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('image', image);
    formData.append('tags', JSON.stringify(tagList));
    const res = await fetch('http://localhost:8080/api/products/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('登録完了');
      onClose();
      onSuccess();
    } else {
      setMessage(data.error || '登録失敗');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
        <h2 className="text-xl font-bold mb-4">商品を登録する</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block font-medium">商品名</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1 w-full" required />
          </div>
          <div>
            <label className="block font-medium">価格</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="border rounded px-2 py-1 w-full" required />
          </div>
          <div>
            <label className="block font-medium">画像</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full" required />
          </div>
          
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">登録</button>
          {message && <p className="text-sm text-red-500">{message}</p>}
        </form>
      </div>
    </div>
  );
}
