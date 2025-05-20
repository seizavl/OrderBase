interface SaveModalProps {
  savePath: string;
  setSavePath: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function SaveModal({ savePath, setSavePath, onClose, onSave }: SaveModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">保存ファイル名を入力（例: page1）</h2>
        <input
          type="text"
          value={savePath}
          onChange={(e) => setSavePath(e.target.value)}
          placeholder="page1"
          className="w-full border p-2 rounded mb-2"
        />
        <p className="text-sm text-gray-500 mb-4">
          保存先URL: <code>http://localhost:8080/api/html/save/{savePath || '<未入力>'}</code>
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={onSave}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
