'use client'
import { useState } from 'react';

import SaveModal from './SaveModal';
import ChatWindow from './ChatWindow';
import HtmlPreview from './HtmlPreview';
type Message = {
  role: 'user' | 'assistant';
  content: string;
};
export default function EditPage() {
  const [messages, setMessages] = useState<Message[]>([
  { role: 'assistant', content: 'こんにちは！HTMLについて質問があればお答えします。どのようなHTMLを作成したいですか？' }
]);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savePath, setSavePath] = useState('');
  const baseUrl = 'http://localhost:8080/api/html/save/';
  const handleSaveHtml = async () => {
    if (!savePath || !htmlPreview) {
      alert('保存ファイル名とHTML内容が必要です');
      return;
    }

    const fullUrl = baseUrl + savePath;

    try {
      const res = await fetch(fullUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/html' },
        body: htmlPreview,
        credentials: 'include',
      });

      if (res.ok) {
        alert('保存に成功しました！');
        setSaveModalOpen(false);
      } else {
        alert('保存に失敗しました');
      }
    } catch {
      alert('通信エラー：保存に失敗しました');
    }
  };

  return (
    <div className="relative h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">表示・編集ページ</h1>
      <p className="text-gray-600 mb-6">ここではデータの表示やAIとのチャット編集ができます。</p>

      <HtmlPreview htmlPreview={htmlPreview} onSaveClick={() => setSaveModalOpen(true)} />
      {saveModalOpen && (
        <SaveModal
          savePath={savePath}
          setSavePath={setSavePath}
          onClose={() => setSaveModalOpen(false)}
          onSave={handleSaveHtml}
        />
      )}
      <ChatWindow
        messages={messages}
        setMessages={setMessages}
        setHtmlPreview={setHtmlPreview}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}
