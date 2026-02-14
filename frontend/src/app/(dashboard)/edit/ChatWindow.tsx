'use client'
import { useEffect, useRef, useState } from 'react';
import { Code, Image as ImageIcon, Scale, X } from 'lucide-react';

interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}

interface ChatWindowProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setHtmlPreview: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentHtml: string;
}

export default function ChatWindow({ messages, setMessages, setHtmlPreview, isLoading, setIsLoading, currentHtml }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    let userMessage: Message; // UI表示用
    let apiMessage: Message;  // API送信用

    if (selectedImage) {
      // 画像付きメッセージ
      const content: MessageContent[] = [
        { type: 'text', text: input || '画像を分析してください' }
      ];
      content.push({
        type: 'image_url',
        image_url: {
          url: selectedImage
        }
      });
      userMessage = { role: 'user', content };
      apiMessage = userMessage; // 画像の場合は同じ
    } else {
      // テキストのみ - UIには元のメッセージのみ表示
      userMessage = { role: 'user', content: input };

      // API送信用にHTMLコンテキストを追加
      let apiInput = input;
      if (currentHtml) {
        apiInput = `【現在のHTML】\n\`\`\`html\n${currentHtml}\n\`\`\`\n\n【要望】\n${input}`;
      }
      apiMessage = { role: 'user', content: apiInput };
    }

    // UI表示用のメッセージを保存
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // API送信用のメッセージリストを作成（履歴なし - システムプロンプトと最新の要望のみ）
      const allMessages = [...messages, apiMessage];

      // 最新のシステムメッセージのみ取得
      const systemMessages = allMessages.filter(m => m.role === 'system');
      const latestSystemMessage = systemMessages.length > 0 ? [systemMessages[systemMessages.length - 1]] : [];

      // 最新のユーザーメッセージのみ送信（履歴は送らない）
      const apiMessages = [...latestSystemMessage, apiMessage];

      const res = await fetch('http://localhost:8080/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);

        // HTMLコードが含まれている場合はプレビューに反映
        const content = data.message.content;
        // より柔軟な正規表現で ```html から ``` までを抽出
        const htmlMatch = content.match(/```html\s*\n?([\s\S]*?)```/);
        if (htmlMatch) {
          const htmlCode = htmlMatch[1].trim();
          setHtmlPreview(htmlCode);
        }
      } else {
        const error = await res.json();
        const errorMessage = error.error || '応答の取得に失敗しました';

        // レート制限エラーの場合は待機時間を提案
        if (errorMessage.includes('tokens per min') || errorMessage.includes('TPM')) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `⚠️ レート制限エラー\n\n${errorMessage}\n\n【対処法】\n1. 30秒ほど待ってから再送信してください\n2. より多くのトークンを使いたい場合は、OpenAIアカウントをアップグレードしてください（https://platform.openai.com/account/billing）`
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `エラー: ${errorMessage}`
          }]);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '通信エラー: APIに接続できませんでした。APIキーが設定されているか確認してください。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string | MessageContent[]) => {
    if (Array.isArray(content)) {
      return (
        <div className="space-y-2">
          {content.map((item, idx) => (
            <div key={idx}>
              {item.type === 'text' && item.text && (
                <pre className="whitespace-pre-wrap font-mono leading-relaxed">{item.text}</pre>
              )}
              {item.type === 'image_url' && item.image_url && (
                <img
                  src={item.image_url.url}
                  alt="Uploaded"
                  className="max-w-full rounded border border-white/20 mt-2"
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    // 文字列の場合、HTMLコードブロックとコンテキスト情報を除去して表示
    let displayContent = content;

    // 【現在のHTML】セクションを除去
    displayContent = displayContent.replace(/【現在のHTML】\n```html\n[\s\S]*?\n```\n\n【要望】\n/g, '');

    // HTMLコードブロックを除去（アシスタントの応答から）
    displayContent = displayContent.replace(/```html\n[\s\S]*?\n```/g, '');

    // 空白行を整理
    displayContent = displayContent.replace(/\n{3,}/g, '\n\n').trim();

    // 空の場合は「プレビューを確認してください」と表示
    if (!displayContent || displayContent.length === 0) {
      displayContent = 'プレビューを確認してください';
    }

    return <pre className="whitespace-pre-wrap font-mono leading-relaxed">{displayContent}</pre>;
  };

  return (
    <div className="h-full flex flex-col" style={{scale: "0.9" }}>
      <div className="relative w-full h-full">
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col">
          <div className="rounded-xl overflow-hidden flex flex-col h-full bg-gray-50">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200 flex items-center space-x-2 flex-shrink-0">
              <Code className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700 font-mono font-medium">AI Chat</span>
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.filter(msg => msg.role !== 'system').map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                  }`}>
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="font-mono">考え中...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex-shrink-0">
              {selectedImage && (
                <div className="mb-2 relative inline-block">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-h-20 rounded border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors shadow-sm"
                  disabled={isLoading}
                  title="画像を添付"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="HTMLについて質問..."
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                  disabled={isLoading}
                >
                  送信
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
