'use client'
import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setHtmlPreview: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function ChatWindow({ messages, setMessages, setHtmlPreview, isLoading, setIsLoading }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [chatVisible, setChatVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      let response = '';
      const userInput = input.toLowerCase();

      if (userInput.includes('メニュー')) {
        response = '以下がメニューのHTMLです：\n\n```html\n<ul>\n  <li>ラーメン3</li>\n  <li>餃子</li>\n  <li>チャーハン</li>\n</ul>\n```';
      } else {
        response = 'HTMLやCSSについて質問してください！';
      }

      const match = response.match(/```html\n([\s\S]*?)```/);
      if (match) setHtmlPreview(match[1]);

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 800);
  };

  const startDrag = (e: React.MouseEvent) => {
    isDragging.current = true;
    offset.current = {
      x: e.clientX - (chatRef.current?.getBoundingClientRect().left || 0),
      y: e.clientY - (chatRef.current?.getBoundingClientRect().top || 0),
    };
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging.current || !chatRef.current) return;
    chatRef.current.style.left = `${e.clientX - offset.current.x}px`;
    chatRef.current.style.top = `${e.clientY - offset.current.y}px`;
  };

  const stopDrag = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
  };

  if (!chatVisible) return null;

  return (
    <div
      ref={chatRef}
      className="fixed top-24 left-10 w-96 h-[500px] bg-white rounded-lg shadow-lg z-50 flex flex-col border border-gray-300"
    >
      <div
        className="bg-blue-500 text-white px-4 py-2 rounded-t-lg flex justify-between items-center cursor-move"
        onMouseDown={startDrag}
      >
        <span className="font-semibold">AIチャット</span>
        <button onClick={() => setChatVisible(false)} className="text-lg">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <pre className="whitespace-pre-wrap">{msg.content}</pre>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-left text-gray-500">考え中...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="HTMLについて質問..."
          className="flex-1 p-2 text-sm border-none focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600"
          disabled={isLoading}
        >
          送信
        </button>
      </form>
    </div>
  );
}
