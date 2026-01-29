'use client'
import { useState } from 'react';
import { LayoutGrid, Palette, Target, ArrowRight } from 'lucide-react';

export interface TemplateSelection {
  layout: string;
  theme: string;
  purpose: string;
}

interface TemplateSelectorProps {
  onComplete: (selection: TemplateSelection) => void;
  onBack: () => void;
}

export default function TemplateSelector({ onComplete, onBack }: TemplateSelectorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selection, setSelection] = useState<TemplateSelection>({
    layout: '',
    theme: '',
    purpose: '',
  });

  const layouts = [
    {
      id: 'single-column',
      name: 'シングルカラム',
      description: '縦長の1列レイアウト',
      preview: (
        <div className="w-full h-24 bg-gradient-to-b from-blue-100 to-white border-2 border-gray-300 rounded p-2">
          <div className="w-full h-3 bg-blue-400 rounded mb-2"></div>
          <div className="w-full h-2 bg-gray-300 rounded mb-1"></div>
          <div className="w-3/4 h-2 bg-gray-300 rounded mb-1"></div>
          <div className="w-full h-2 bg-gray-300 rounded"></div>
        </div>
      )
    },
    {
      id: '2-column',
      name: '2カラム',
      description: 'サイドバー付きレイアウト',
      preview: (
        <div className="w-full h-24 bg-gradient-to-b from-blue-100 to-white border-2 border-gray-300 rounded p-2 flex gap-2">
          <div className="w-1/3 h-full bg-blue-400 rounded"></div>
          <div className="flex-1 space-y-1">
            <div className="w-full h-2 bg-gray-300 rounded"></div>
            <div className="w-3/4 h-2 bg-gray-300 rounded"></div>
            <div className="w-full h-2 bg-gray-300 rounded"></div>
          </div>
        </div>
      )
    },
    {
      id: 'grid',
      name: 'グリッド',
      description: '商品一覧向けカードレイアウト',
      preview: (
        <div className="w-full h-24 bg-gradient-to-b from-blue-100 to-white border-2 border-gray-300 rounded p-2">
          <div className="grid grid-cols-3 gap-2 h-full">
            <div className="bg-blue-400 rounded"></div>
            <div className="bg-blue-400 rounded"></div>
            <div className="bg-blue-400 rounded"></div>
            <div className="bg-blue-400 rounded"></div>
            <div className="bg-blue-400 rounded"></div>
            <div className="bg-blue-400 rounded"></div>
          </div>
        </div>
      )
    },
    {
      id: 'landing',
      name: 'ランディングページ',
      description: 'ヒーロー画像付き訴求型',
      preview: (
        <div className="w-full h-24 bg-gradient-to-b from-blue-100 to-white border-2 border-gray-300 rounded overflow-hidden">
          <div className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <div className="w-16 h-2 bg-white rounded"></div>
          </div>
          <div className="p-2 space-y-1">
            <div className="w-3/4 h-2 bg-gray-300 rounded mx-auto"></div>
            <div className="w-1/2 h-2 bg-gray-300 rounded mx-auto"></div>
          </div>
        </div>
      )
    },
  ];

  const themes = [
    {
      id: 'modern',
      name: 'モダン',
      description: '青・白ベースの洗練されたデザイン',
      colors: ['bg-blue-500', 'bg-blue-300', 'bg-white', 'bg-gray-100']
    },
    {
      id: 'warm',
      name: '温かみ',
      description: 'オレンジ・ベージュの親しみやすいデザイン',
      colors: ['bg-orange-500', 'bg-orange-300', 'bg-amber-100', 'bg-yellow-50']
    },
    {
      id: 'cool',
      name: 'クール',
      description: '黒・グレーのスタイリッシュなデザイン',
      colors: ['bg-gray-900', 'bg-gray-600', 'bg-gray-300', 'bg-gray-100']
    },
    {
      id: 'natural',
      name: 'ナチュラル',
      description: '緑・茶色の自然で落ち着いたデザイン',
      colors: ['bg-green-600', 'bg-green-400', 'bg-amber-200', 'bg-green-50']
    },
  ];

  const purposes = [
    {
      id: 'product-showcase',
      name: '商品紹介',
      description: '商品の魅力を詳しく伝えるページ',
      icon: '🛍️'
    },
    {
      id: 'campaign',
      name: 'キャンペーンLP',
      description: '期間限定セールや特別企画の告知',
      icon: '🎯'
    },
    {
      id: 'menu',
      name: 'メニュー表',
      description: '飲食店やサービスのメニュー一覧',
      icon: '📋'
    },
    {
      id: 'event',
      name: 'イベント告知',
      description: 'イベントの詳細や参加募集',
      icon: '🎪'
    },
  ];

  const handleSelect = (key: keyof TemplateSelection, value: string) => {
    setSelection(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !selection.layout) {
      alert('レイアウトを選択してください');
      return;
    }
    if (currentStep === 2 && !selection.theme) {
      alert('配色テーマを選択してください');
      return;
    }
    if (currentStep === 3 && !selection.purpose) {
      alert('用途を選択してください');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(selection);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-5xl mx-auto">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">ステップ {currentStep} / 3</span>
            <span className="text-sm text-gray-500">
              {currentStep === 1 ? 'レイアウト選択' : currentStep === 2 ? '配色選択' : '用途選択'}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* ステップ1: レイアウト選択 */}
        {currentStep === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <LayoutGrid className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">レイアウトを選択</h2>
              <p className="text-gray-600">ページの基本構成を選んでください</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleSelect('layout', layout.id)}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                    selection.layout === layout.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="mb-4">{layout.preview}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{layout.name}</h3>
                  <p className="text-sm text-gray-600">{layout.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ステップ2: 配色テーマ選択 */}
        {currentStep === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">配色テーマを選択</h2>
              <p className="text-gray-600">ページの雰囲気を決めてください</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelect('theme', theme.id)}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                    selection.theme === theme.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                      : 'border-gray-300 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex gap-2 mb-4">
                    {theme.colors.map((color, idx) => (
                      <div key={idx} className={`flex-1 h-16 ${color} rounded`}></div>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{theme.name}</h3>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ステップ3: 用途選択 */}
        {currentStep === 3 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">用途を選択</h2>
              <p className="text-gray-600">どんなページを作りたいですか？</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {purposes.map((purpose) => (
                <button
                  key={purpose.id}
                  onClick={() => handleSelect('purpose', purpose.id)}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                    selection.purpose === purpose.id
                      ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                      : 'border-gray-300 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="text-5xl mb-3">{purpose.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{purpose.name}</h3>
                  <p className="text-sm text-gray-600">{purpose.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            {currentStep === 1 ? 'キャンセル' : '戻る'}
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {currentStep === 3 ? '生成開始' : '次へ'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
