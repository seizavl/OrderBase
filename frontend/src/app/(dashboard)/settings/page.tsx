'use client'
import { useState, useEffect } from 'react';
import { Save, Key, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/openai/get-key', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setHasKey(data.has_key);
        setMaskedKey(data.masked_key || '');
      }
    } catch (error) {
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('http://localhost:8080/api/openai/set-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (res.ok) {
        setApiKey('');
        setShowKey(false);
        fetchApiKey();
      }
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">設定</h1>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">OpenAI API設定</h2>
          </div>

          <div className="space-y-6">
            {/* 現在の設定状態 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>ステータス:</strong>{' '}
                {hasKey ? (
                  <span className="text-green-600 font-medium">✓ 設定済み</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ 未設定</span>
                )}
              </p>
              {hasKey && maskedKey && (
                <p className="text-sm text-gray-600 mt-2">
                  現在のキー: <code className="bg-white px-2 py-1 rounded">{maskedKey}</code>
                </p>
              )}
            </div>

            {/* APIキー入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI APIキー
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                OpenAI APIキーは{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  こちら
                </a>
                から取得できます
              </p>
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSaveApiKey}
              disabled={saving || !apiKey.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-sm ${
                saving || !apiKey.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
              }`}
            >
              <Save className="w-5 h-5" />
              {saving ? '保存中...' : 'APIキーを保存'}
            </button>

            {/* 注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ 注意事項</h3>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>APIキーは安全に暗号化されて保存されます</li>
                <li>このキーを使用してAIチャット機能が動作します</li>
                <li>APIキーの使用料金はご自身のOpenAIアカウントに請求されます</li>
                <li>キーを他人に共有しないでください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
