'use client'
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface HTMLPage {
  id: number;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function HTMLViewerPage() {
  const [pages, setPages] = useState<HTMLPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<HTMLPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  // ユーザー名を取得
  const fetchUsername = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/dashboard', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username);
      }
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
    }
  };

  // ページリストを取得
  const fetchPages = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/html/list', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('ページリスト取得エラー:', error);
    }
  };

  // 特定のページを取得
  const fetchPageContent = async (pageName: string) => {
    if (!username) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/html/get/${username}/${pageName}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const page = await res.json();
        setSelectedPage(page);
      }
    } catch (error) {
      console.error('ページ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // ページを削除
  const deletePage = async (pageName: string) => {
    if (!username) return;
    if (!confirm(`「${pageName}」を削除しますか？`)) return;

    try {
      const res = await fetch(`http://localhost:8080/api/html/delete/${username}/${pageName}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        alert('削除しました');
        if (selectedPage?.name === pageName) {
          setSelectedPage(null);
        }
        fetchPages();
      } else {
        const error = await res.json();
        alert(`削除に失敗しました: ${error.error || '不明なエラー'}`);
      }
    } catch (error) {
      alert('通信エラー: 削除に失敗しました');
    }
  };

  useEffect(() => {
    fetchUsername();
    fetchPages();
  }, []);

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">HTML ページビューア</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ページリスト */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-900">保存されたページ</h2>
              <div className="space-y-2">
                {pages.length === 0 ? (
                  <p className="text-gray-600 text-sm">保存されたページがありません</p>
                ) : (
                  pages.map((page) => (
                    <div
                      key={page.id}
                      className={`relative group w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        selectedPage?.id === page.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <button
                        onClick={() => fetchPageContent(page.name)}
                        className="w-full text-left"
                      >
                        <div className="font-semibold text-gray-900">{page.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          更新: {new Date(page.updated_at).toLocaleString('ja-JP')}
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(page.name);
                        }}
                        className="absolute top-3 right-3 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* プレビュー */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
              <div className="border-b px-6 py-4 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedPage ? selectedPage.name : 'プレビュー'}
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-700 font-medium">読み込み中...</div>
                  </div>
                ) : selectedPage ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">
                        作成: {new Date(selectedPage.created_at).toLocaleString('ja-JP')}
                      </span>
                      <a
                        href={`http://localhost:8080/html/view/${username}/${selectedPage.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
                      >
                        新しいタブで開く
                      </a>
                    </div>
                    {/* HTMLコンテンツをレンダリング */}
                    <div className="bg-white rounded border overflow-hidden">
                      <iframe
                        srcDoc={selectedPage.content.includes('<base') ? selectedPage.content : `<base href="http://localhost:8080/">${selectedPage.content}`}
                        style={{
                          width: '100%',
                          minHeight: '400px',
                          border: 'none',
                        }}
                        sandbox="allow-same-origin allow-scripts allow-forms"
                        title={`HTML Preview - ${selectedPage.name}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-700 font-medium">
                    左のリストからページを選択してください
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
