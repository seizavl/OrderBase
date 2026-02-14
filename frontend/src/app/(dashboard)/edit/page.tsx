'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';

import SaveModal from './SaveModal';
import ChatWindow from './ChatWindow';
import HtmlViewerPanel from './html-viewer-panel';
import TemplateSelector, { TemplateSelection } from './TemplateSelector';
import { Monitor, MessageSquare, X, Plus, FileEdit, RotateCcw } from 'lucide-react';

interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
};

type Product = {
  id: number;
  name: string;
  price: number;
  imagePath: string;
  labels?: string;
};

type HTMLPage = {
  id: number;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function EditPage() {
  const [htmlPreview, setHtmlPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savePath, setSavePath] = useState('');
  const [username, setUsername] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [pages, setPages] = useState<HTMLPage[]>([]);
  const [showPageSelector, setShowPageSelector] = useState(true); // 初回は選択画面を表示
  const [showTemplateSelector, setShowTemplateSelector] = useState(false); // テンプレート選択画面
  const [currentPageName, setCurrentPageName] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: '' },
    { role: 'assistant', content: 'こんにちは！HTMLについて質問があればお答えします。どのようなHTMLを作成したいですか？' }
  ]);

  // LocalStorageから編集内容を復元
  useEffect(() => {
    const savedPageName = localStorage.getItem('edit-current-page');

    if (savedPageName) {
      // ページ名が保存されている場合、そのページのデータを復元
      const savedHtml = localStorage.getItem(`edit-html-preview-${savedPageName}`);
      const savedMessages = localStorage.getItem(`edit-messages-${savedPageName}`);

      if (savedHtml) setHtmlPreview(savedHtml);
      setCurrentPageName(savedPageName);
      setShowPageSelector(false);

      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
        }
      }
    }
  }, []);

  // 編集内容をLocalStorageに保存（ページごと）
  useEffect(() => {
    if (htmlPreview && currentPageName) {
      localStorage.setItem(`edit-html-preview-${currentPageName}`, htmlPreview);
    }
  }, [htmlPreview, currentPageName]);

  useEffect(() => {
    if (currentPageName) {
      localStorage.setItem('edit-current-page', currentPageName);
    }
  }, [currentPageName]);

  useEffect(() => {
    if (messages.length > 2 && currentPageName) {
      localStorage.setItem(`edit-messages-${currentPageName}`, JSON.stringify(messages));
    }
  }, [messages, currentPageName]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/dashboard', {
          withCredentials: true,
        });
        setUsername(res.data.username);
      } catch (err) {
      }
    };
    fetchUser();
  }, []);

  // 商品情報を取得
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/products/mine', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
      }
    };
    fetchProducts();
  }, []);

  // ページリストを取得
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/html/list', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setPages(data.pages || []);
        }
      } catch (err) {
      }
    };
    fetchPages();
  }, []);

  // 商品情報が読み込まれたらシステムプロンプトを更新
  useEffect(() => {
    if (products.length > 0) {
      const productInfo = products.map(p =>
        `- ID: ${p.id}, 商品名: ${p.name}, 価格: ¥${p.price.toLocaleString()}, 画像パス: ${p.imagePath}${p.labels ? `, ラベル: ${p.labels}` : ''}`
      ).join('\n');

      const systemPrompt = `HTML専門家として完全なHTMLコードを生成。

【ルール】
- \`\`\`html\`\`\`で囲む、説明不要、コードのみ出力
- 完全なHTML(<!DOCTYPE html>～</html>)
- 既存コード提示時は保持し追加のみ、削除・置換禁止

【重要：テーブル情報の取得と送信】
QRコードからアクセスされた場合、URLに table=<テーブル番号> というクエリパラメータが付いています。
このテーブル番号をJavaScriptで取得して注文時に送信する必要があります。

以下のコードをHTMLに含めてください：
1. URLからテーブル番号を取得：
   const params = new URLSearchParams(window.location.search);
   const tableNumber = params.get('table');

2. checkout関数を修正：
   async function checkout(tableNumber=null){
     if(!confirm('注文しますか？'))return;
     try{
       const checkoutBody = {};
       if(tableNumber){
         checkoutBody.table_id = parseInt(tableNumber);
       }
       const r=await fetch(API_BASE+'/api/cart/checkout',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(checkoutBody)});
       // ... 以下省略
     }
   }

3. 購入ボタンでテーブル番号を渡す：
   <button onclick="const params = new URLSearchParams(window.location.search); const table = params.get('table'); checkout(table);">購入手続きへ</button>

この実装により、テーブルから購入された注文は自動的にそのテーブルに紐付けられます。

【商品情報】
${productInfo}

【商品カードのレイアウト（絶対遵守）】
商品を表示する際は、以下のCSSとHTML構造を必ず使用してください。インラインスタイルではなく、<style>タグ内でクラスを定義してください。

必須CSS：
<style>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  align-items: stretch;
}
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
  display: block;
}
.product-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
}
.product-info {
  flex: 1;
}
.product-button {
  margin-top: auto;
  width: 100%;
  padding: 10px;
}
</style>

必須HTML構造（この構造を必ず守ること）：
<div class="product-grid">
  <div class="product-card">
    <img src="商品画像パス" alt="商品名" class="product-image">
    <div class="product-content">
      <div class="product-info">
        <h3>商品名</h3>
        <p>価格: ¥1,000</p>
        <p>ラベル: xxx</p>
      </div>
      <button class="product-button" onclick="addToCart(商品ID)">カート追加</button>
    </div>
  </div>
  <!-- 他の商品カードも同じ構造で繰り返す -->
</div>

重要：
- imgタグには必ず class="product-image" を付けてください
- divタグには必ず class="product-card", class="product-content", class="product-info" を付けてください
- buttonタグには必ず class="product-button" を付けてください
- インラインスタイル（style=""）は使用しないでください

【グラスモーフィズムデザイン（推奨）】
モダンなグラスモーフィズムデザインを取り入れてください：
<style>
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
.glass-dark {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>

【カート機能（必須）】
商品表示時は必ず以下の要素を含めてください。ページ下部やサイドバーにカート情報を常に表示しないでください。

1. 固定カートボタン（右上に配置）：
<button id="cart-btn" onclick="toggleCart()" style="position: fixed; top: 20px; right: 20px; z-index: 1000; padding: 12px 24px; background: rgba(59, 130, 246, 0.9); backdrop-filter: blur(10px); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); font-weight: bold; display: flex; align-items: center; gap: 8px;">
  🛒 カート <span id="cart-count" style="background: white; color: #3b82f6; padding: 2px 8px; border-radius: 20px; font-size: 12px;">0</span>
</button>

2. カートモーダル（ボタンクリック時のみ表示）：
<div id="cart-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(5px); z-index: 2000; justify-content: center; align-items: center;">
  <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 30px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 24px;">🛒 カート</h2>
      <button onclick="toggleCart()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
    </div>
    <div id="cart-items"></div>
  </div>
</div>

3. 商品カードのカート追加ボタン：
<button class="product-button" onclick="addToCart(商品ID)">カートに追加</button>

重要：
- <div id="cart-area"></div> のような常に表示されるカート情報エリアは作成しないでください
- カート情報はモーダル内でのみ表示してください
- ページ下部やサイドバーにカート一覧を表示しないでください

4. 必須JavaScript：
<script>
const API_BASE=window.location.origin;
let cartData = { items: [], total_price: 0 };

async function addToCart(id,q=1){
  try{
    const r=await fetch(API_BASE+'/api/cart',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({product_id:id,quantity:q})});
    const d=await r.json();
    if(r.ok){
      await loadCart();
      showNotification('カートに追加しました');
    }
  }catch{}
}

async function loadCart(){
  try{
    const r=await fetch(API_BASE+'/api/cart',{credentials:'include'});
    const d=await r.json();
    if(r.ok){
      cartData = { items: d.items || [], total_price: d.total_price || 0 };
      updateCartDisplay();
    }
  }catch(e){}
}

function updateCartDisplay(){
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  if(!countEl || !itemsEl) return;

  const itemCount = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
  countEl.textContent = itemCount;

  if(cartData.items.length === 0){
    itemsEl.innerHTML = '<p style="text-align: center; color: #999; padding: 40px 0;">カートは空です</p>';
  }else{
    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    cartData.items.forEach(item => {
      html += \`<div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.5); border-radius: 12px; backdrop-filter: blur(10px);">
        <img src="\${item.product.imagePath}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        <div style="flex: 1;">
          <div style="font-weight: bold;">\${item.product.name}</div>
          <div style="color: #666; font-size: 14px;">¥\${item.product.price.toLocaleString()} × \${item.quantity}</div>
        </div>
        <div style="font-weight: bold; color: #3b82f6;">¥\${(item.product.price * item.quantity).toLocaleString()}</div>
      </div>\`;
    });
    html += '</div>';
    html += \`<div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid rgba(0, 0, 0, 0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="font-size: 18px; font-weight: bold;">合計</span>
        <span style="font-size: 24px; font-weight: bold; color: #3b82f6;">¥\${cartData.total_price.toLocaleString()}</span>
      </div>
      <button onclick="const params = new URLSearchParams(window.location.search); const table = params.get('table'); checkout(table);" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">購入手続きへ</button>
    </div>\`;
    itemsEl.innerHTML = html;
  }
}

function toggleCart(){
  const modal = document.getElementById('cart-modal');
  if(modal.style.display === 'none' || !modal.style.display){
    modal.style.display = 'flex';
  }else{
    modal.style.display = 'none';
  }
}

function showNotification(msg){
  const notif = document.createElement('div');
  notif.textContent = msg;
  notif.style.cssText = 'position: fixed; top: 80px; right: 20px; background: rgba(34, 197, 94, 0.9); backdrop-filter: blur(10px); color: white; padding: 12px 24px; border-radius: 50px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4); z-index: 3000; animation: slideIn 0.3s ease-out;';
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

async function checkout(tableNumber=null){
  if(!confirm('注文しますか？'))return;
  try{
    const checkoutBody = {};
    if(tableNumber){
      checkoutBody.table_id = parseInt(tableNumber);
    }
    const r=await fetch(API_BASE+'/api/cart/checkout',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(checkoutBody)});
    const d=await r.json();
    if(r.ok){
      await loadCart();
      toggleCart();
    }
  }catch{}
}

document.addEventListener('DOMContentLoaded', loadCart);
</script>

<style>
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>`;

      setMessages(prev => {
        const newMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...prev.slice(1)
        ];
        return newMessages;
      });
    }
  }, [products]);

  const handleSaveHtml = async () => {
    const nameToSave = savePath || currentPageName;
    if (!nameToSave || !htmlPreview || !username) {
      return;
    }

    const fullUrl = `http://localhost:8080/api/html/save/${username}/${nameToSave}`;

    try {
      const res = await fetch(fullUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/html' },
        body: htmlPreview,
        credentials: 'include',
      });

      if (res.ok) {
        setCurrentPageName(nameToSave);
        setSaveModalOpen(false);
      }
    } catch (error) {
    }
  };

  const loadExistingPage = async (pageName: string) => {
    if (!username) return;

    try {
      const res = await fetch(`http://localhost:8080/api/html/get/${username}/${pageName}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const page = await res.json();
        setHtmlPreview(page.content);
        setCurrentPageName(pageName);
        setSavePath(pageName);
        setShowPageSelector(false);

        // このページのチャット履歴を復元
        const savedMessages = localStorage.getItem(`edit-messages-${pageName}`);
        if (savedMessages) {
          try {
            setMessages(JSON.parse(savedMessages));
          } catch (e) {
            // 復元失敗時はデフォルトメッセージにリセット
            setMessages([
              { role: 'system', content: messages[0].content },
              { role: 'assistant', content: 'こんにちは！HTMLについて質問があればお答えします。どのようなHTMLを作成したいですか？' }
            ]);
          }
        } else {
          // チャット履歴がない場合はリセット
          setMessages([
            { role: 'system', content: messages[0].content },
            { role: 'assistant', content: 'こんにちは！HTMLについて質問があればお答えします。どのようなHTMLを作成したいですか？' }
          ]);
        }
      }
    } catch (error) {
    }
  };

  const startNewPage = () => {
    // テンプレート選択画面を表示
    setShowTemplateSelector(true);
    setShowPageSelector(false);
  };

  const handleTemplateComplete = async (selection: TemplateSelection) => {
    // テンプレート選択完了後、AIに初期プロンプトを送信
    setShowTemplateSelector(false);
    setHtmlPreview('');
    setCurrentPageName('');
    setSavePath('');

    // 選択内容に基づいて初期プロンプトを生成
    const initialPrompt = generateInitialPrompt(selection);

    // メッセージをリセットしてAIリクエストを送信
    const systemMessage = messages[0];
    const newMessages: Message[] = [
      systemMessage,
      { role: 'user', content: initialPrompt }
    ];

    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages: [systemMessage, { role: 'user', content: initialPrompt }] }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);

        // HTMLコードを抽出してプレビューに反映
        const content = data.message.content;
        const htmlMatch = content.match(/```html\s*\n?([\s\S]*?)```/);
        if (htmlMatch) {
          const htmlCode = htmlMatch[1].trim();
          setHtmlPreview(htmlCode);
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }

    localStorage.removeItem('edit-current-page');
  };

  const generateInitialPrompt = (selection: TemplateSelection): string => {
    const layoutDescriptions: Record<string, string> = {
      'single-column': 'シングルカラムの縦長レイアウト。コンテンツが上から下に流れる構成',
      '2-column': '2カラムレイアウト。左側にサイドバー（ナビゲーションやカテゴリ）、右側にメインコンテンツ',
      'grid': 'グリッドレイアウト。商品やアイテムをカード形式で3カラムで並べる',
      'landing': 'ランディングページ。上部に大きなヒーロー画像とキャッチコピー、その下にコンテンツが続く訴求型のデザイン',
    };

    const themeDescriptions: Record<string, string> = {
      'modern': 'モダンなデザイン。青色（#3b82f6, #60a5fa）と白をベースにした洗練されたカラースキーム',
      'warm': '温かみのあるデザイン。オレンジ（#f97316, #fb923c）とベージュ（#fef3c7）を使った親しみやすいカラースキーム',
      'cool': 'クールなデザイン。黒（#111827）、グレー（#4b5563, #d1d5db）を使ったスタイリッシュなカラースキーム',
      'natural': 'ナチュラルなデザイン。緑（#16a34a, #4ade80）と茶色（#d97706）を使った自然で落ち着いたカラースキーム',
    };

    const purposeDescriptions: Record<string, string> = {
      'product-showcase': '商品紹介ページ。商品の画像、詳細説明、価格、カート追加ボタンを魅力的に配置',
      'campaign': 'キャンペーンLPページ。期間限定セールや特別企画を訴求する構成。目を引くタイトル、カウントダウン要素、CTAボタン',
      'menu': 'メニュー表ページ。商品名、価格、説明を見やすく整理したリスト形式',
      'event': 'イベント告知ページ。イベント名、日時、場所、詳細情報、申込ボタンを配置',
    };

    return `以下の要件で完全なHTMLページを作成してください：

【レイアウト】
${layoutDescriptions[selection.layout]}

【配色テーマ】
${themeDescriptions[selection.theme]}

【用途】
${purposeDescriptions[selection.purpose]}

【重要】
- 登録されている商品情報を活用してください
- レスポンシブデザインにしてください
- 適切な余白と視覚的階層を持たせてください
- 商品を表示する場合は必ずカート機能を含めてください
- 商品カードは必ず以下のクラスを使用してください：
  * コンテナ: class="product-grid"
  * カード: class="product-card"
  * 画像: class="product-image" (height: 200px固定、object-fit: cover)
  * コンテンツ: class="product-content"
  * 情報エリア: class="product-info"
  * ボタン: class="product-button"
- すべての商品画像の高さを200pxに統一し、object-fit: coverを適用してください
- グリッドレイアウトでalign-items: stretchを使用し、すべてのカードの高さを揃えてください`;
  };

  const resetCurrentWork = () => {
    if (confirm('現在の編集内容を破棄して最初からやり直しますか？')) {
      // 現在のページのLocalStorageデータを削除
      if (currentPageName) {
        localStorage.removeItem(`edit-html-preview-${currentPageName}`);
        localStorage.removeItem(`edit-messages-${currentPageName}`);
      }
      startNewPage();
    }
  };

  // テンプレート選択画面
  if (showTemplateSelector) {
    return (
      <TemplateSelector
        onComplete={handleTemplateComplete}
        onBack={() => {
          setShowTemplateSelector(false);
          setShowPageSelector(true);
        }}
      />
    );
  }

  if (showPageSelector) {
    return (
      <div className="h-full overflow-auto p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">ページを選択してください</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 新規作成カード */}
            <button
              onClick={startNewPage}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-8 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">新規作成</h2>
              <p className="text-blue-100">新しいHTMLページを作成します</p>
            </button>

            {/* 既存ページ編集カード */}
            <button
              onClick={() => {
                if (pages.length > 0) {
                  // ページ選択リストを表示するためのフラグ
                  document.getElementById('page-list')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-8 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              <FileEdit className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">既存ページを編集</h2>
              <p className="text-purple-100">保存済みのページを編集します</p>
            </button>
          </div>

          {/* 既存ページリスト */}
          {pages.length > 0 && (
            <div id="page-list" className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-900">保存されたページ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => loadExistingPage(page.name)}
                    className="text-left p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="font-semibold text-gray-900 mb-1">{page.name}</div>
                    <div className="text-xs text-gray-600">
                      更新: {new Date(page.updated_at).toLocaleString('ja-JP')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ヘッダーバー - より洗練されたデザイン */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        {/* 左側: ナビゲーション */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPageSelector(true)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <FileEdit className="w-4 h-4" />
            戻る
          </button>
        </div>

        {/* 中央: 編集中のページ名 */}
        {currentPageName && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">編集中:</span>
            <span className="text-sm font-semibold text-gray-900">{currentPageName}</span>
          </div>
        )}

        {/* 右側: アクションボタン */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentPageName && !savePath) {
                setSavePath(currentPageName);
              }
              setSaveModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={resetCurrentWork}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm border border-red-200"
          >
            <RotateCcw className="w-4 h-4" />
            やり直す
          </button>
        </div>
      </div>

      {/* メインコンテンツ - シンプルレイアウト */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading && !htmlPreview ? (
          // AI生成中のローディング画面
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Monitor className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">AIがページを生成中...</h3>
              <p className="text-gray-600">選択したテンプレートに基づいて、HTMLページを作成しています</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-blue-700 font-medium">処理中</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full p-6 bg-gray-50">
            <div className="w-full h-full flex gap-6">
              {/* 左側: iPhone プレビュー */}
              <div className="flex-1 min-w-0">
                <HtmlViewerPanel
                  html={htmlPreview}
                  title={currentPageName || "HTMLビューア"}
                  icon={Monitor}
                  viewerId={1}
                  onSave={() => {
                    if (currentPageName && !savePath) {
                      setSavePath(currentPageName);
                    }
                    setSaveModalOpen(true);
                  }}
                />
              </div>

              {/* 右側: チャットウィンドウ */}
              <div className="w-96">
                <ChatWindow
                  messages={messages}
                  setMessages={setMessages}
                  setHtmlPreview={setHtmlPreview}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  currentHtml={htmlPreview}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {saveModalOpen && (
        <SaveModal
          savePath={savePath}
          setSavePath={setSavePath}
          onClose={() => setSaveModalOpen(false)}
          onSave={handleSaveHtml}
        />
      )}
    </div>
  );
}
