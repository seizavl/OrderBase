'use client'
import { useState, useEffect } from 'react';
import { Trash2, Star, ExternalLink, FileText, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  const [mainMenuPage, setMainMenuPage] = useState('');

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
        // 更新日時の降順でソート（新しいものが上）
        const sortedPages = (data.pages || []).sort((a: HTMLPage, b: HTMLPage) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setPages(sortedPages);
      }
    } catch (error) {
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
    } finally {
      setLoading(false);
    }
  };

  // メインメニューを取得
  const fetchMainMenu = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/user/main-menu', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setMainMenuPage(data.main_menu_page || '');
      }
    } catch (error) {
    }
  };

  // メインメニューを設定
  const setAsMainMenu = async (pageName: string) => {
    try {
      const res = await fetch('http://localhost:8080/api/user/main-menu', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ main_menu_page: pageName }),
      });
      if (res.ok) {
        setMainMenuPage(pageName);
      }
    } catch (error) {
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
        if (selectedPage?.name === pageName) {
          setSelectedPage(null);
        }
        fetchPages();
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchUsername();
    fetchPages();
    fetchMainMenu();
  }, []);

  return (
    <div className="h-full overflow-auto p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ページリスト */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">保存されたページ</h2>
                <span className="ml-auto text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                  {pages.length}
                </span>
              </div>
              <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                {pages.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">保存されたページがありません</p>
                  </div>
                ) : (
                  pages.map((page) => (
                    <div
                      key={page.id}
                      className={`relative group w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                        selectedPage?.id === page.id
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 shadow-md shadow-blue-100'
                          : 'bg-white border-gray-200 hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 hover:border-gray-300 hover:shadow-lg'
                      }`}
                    >
                      <button
                        onClick={() => fetchPageContent(page.name)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className={`w-4 h-4 ${selectedPage?.id === page.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className={`font-semibold ${selectedPage?.id === page.id ? 'text-blue-900' : 'text-gray-900'} truncate`}>
                            {page.name}
                          </span>
                          {mainMenuPage === page.name && (
                            <span title="メインメニュー" className="ml-auto">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className={`text-xs mt-1 ${selectedPage?.id === page.id ? 'text-blue-600' : 'text-gray-500'}`}>
                          更新: {new Date(page.updated_at).toLocaleString('ja-JP')}
                        </div>
                      </button>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAsMainMenu(page.name);
                          }}
                          className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors shadow-sm hover:shadow"
                          title="メインメニューに設定"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(page.name);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors shadow-sm hover:shadow"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* プレビュー */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedPage ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-200'} transition-all`}>
                    <FileText className={`w-5 h-5 ${selectedPage ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {selectedPage ? selectedPage.name : 'プレビュー'}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <div className="text-gray-700 font-medium">読み込み中...</div>
                  </div>
                ) : selectedPage ? (
                  <div className="space-y-4">
                    {/* メタ情報とアクション */}
                    <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">作成:</span>
                        <span>{new Date(selectedPage.created_at).toLocaleString('ja-JP')}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <a
                          href={`http://100.110.79.39:8080/html/view/${username}/${selectedPage.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          新しいタブで開く
                        </a>
                        <div className="group relative">
                          <div className="bg-white p-3 rounded-xl border-2 border-gray-300 shadow-lg group-hover:border-blue-400 transition-all">
                            <QRCodeSVG
                              value={`http://100.110.79.39:8080/html/view/${username}/${selectedPage.name}`}
                              size={100}
                              level="M"
                            />
                          </div>
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            QRコードをスキャン
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* HTMLコンテンツをレンダリング */}
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
                      <iframe
                        srcDoc={selectedPage.content.includes('<base') ? selectedPage.content : `<base href="http://localhost:8080/">${selectedPage.content}`}
                        style={{
                          width: '100%',
                          minHeight: '500px',
                          border: 'none',
                        }}
                        sandbox="allow-same-origin allow-scripts allow-forms"
                        title={`HTML Preview - ${selectedPage.name}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="p-6 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl mb-4">
                      <FileText className="w-16 h-16 text-gray-300" />
                    </div>
                    <p className="text-gray-700 font-medium text-lg">左のリストからページを選択してください</p>
                    <p className="text-gray-500 text-sm mt-2">プレビューがここに表示されます</p>
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
