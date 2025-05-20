
export default function DashboardContent({ username }: { username: string }) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">ようこそ</h2>
        </div>
        <div className="px-6 py-5">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-sm text-blue-700">
              こんにちは、<span className="font-semibold">{username}</span> さん！ ダッシュボードへようこそ。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['最近のアクティビティ', 'お知らせ', '統計情報'].map((title) => (
              <div key={title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">データはまだありません</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  