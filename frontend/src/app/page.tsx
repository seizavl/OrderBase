import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle, Calendar, Users, Package, Clock, TrendingUp, Shield, Smartphone, MessageCircle } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Smartphone,
      title: 'モバイルオーダー',
      description: 'スマホ対応の注文ページを簡単に作成'
    },
    {
      icon: Calendar,
      title: '予約管理',
      description: '予約の受付から確認まで一元管理'
    },
    {
      icon: Package,
      title: '商品管理',
      description: 'メニューや商品を簡単に登録・編集'
    },
    {
      icon: Users,
      title: '顧客管理',
      description: '顧客情報を安全に管理'
    },
    {
      icon: Clock,
      title: '勤怠管理',
      description: 'スタッフの勤怠を効率的に管理'
    },
    {
      icon: TrendingUp,
      title: '売上分析',
      description: 'リアルタイムで売上を確認'
    },
    {
      icon: Shield,
      title: 'セキュリティ',
      description: 'データを安全に保護'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ナビゲーション */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-white shadow-lg p-1.5 border-2 border-blue-100">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo.png"
                    alt="OrderBase Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-800">OrderBase</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative w-40 h-40 rounded-full bg-white shadow-2xl p-6 border-4 border-blue-100">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo.png"
                    alt="OrderBase Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              飲食店経営を
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                もっとスマートに
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              スマホ対応のモバイルオーダーページ作成から、予約管理、商品管理、勤怠管理まで。
              <br />
              飲食店経営に必要な機能を一つに集約した次世代の管理システムです
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                無料で始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-md border-2 border-gray-200"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">主な機能</h2>
            <p className="text-xl text-gray-600">飲食店経営に必要な機能が揃っています</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* モバイルオーダー詳細セクション */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              スマホで完結する
              <br />
              モバイルオーダーシステム
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              OrderBaseなら、お客様のスマホから直接注文できる
              <br />
              オーダーページを簡単に作成できます
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            {/* 左側：スマホイメージ */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 h-[600px] bg-white rounded-[3rem] shadow-2xl p-4 transform hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] flex flex-col p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">メニュー</h3>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg"></div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">ハンバーガーセット</p>
                            <p className="text-xs text-gray-600">¥980</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg"></div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">ピザマルゲリータ</p>
                            <p className="text-xs text-gray-600">¥1,280</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg"></div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">サラダボウル</p>
                            <p className="text-xs text-gray-600">¥780</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg mt-4">
                      注文する
                    </button>
                  </div>
                </div>
                {/* スマホの影 */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-64 h-8 bg-black/30 rounded-full blur-2xl"></div>
              </div>
            </div>

            {/* 右側：特徴リスト */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">AIチャットで簡単HTML作成</h3>
                    <p className="text-blue-100">AIと会話しながらHTMLページを作成。プログラミング知識がなくても、理想のデザインが実現できます</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">レスポンシブ対応</h3>
                    <p className="text-blue-100">スマホ、タブレット、PCなど、あらゆるデバイスで快適に表示されます</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">リアルタイム更新</h3>
                    <p className="text-blue-100">商品情報や価格の変更がすぐに反映。在庫切れも即座に表示できます</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">注文管理も一元化</h3>
                    <p className="text-blue-100">受けた注文は自動で管理画面に反映。効率的にオペレーションできます</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">お客様向けチャットサポート</h3>
                    <p className="text-blue-100">お客様の質問に24時間自動で対応。メニューの問い合わせから注文までサポートします</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl"
            >
              今すぐモバイルオーダーを始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* システム構造の説明セクション */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">シンプルな仕組み</h2>
            <p className="text-xl text-gray-600">フロントエンドで作成したHTMLを、バックエンドが配信</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {/* ステップ1 */}
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-400 mb-2">01</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">AIチャットで作成</h3>
                  <p className="text-gray-600">
                    フロントエンドの管理画面で、AIと会話しながらモバイルオーダー用のHTMLページを作成
                  </p>
                </div>

                {/* ステップ2 */}
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-400 mb-2">02</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">バックエンドに保存</h3>
                  <p className="text-gray-600">
                    作成したHTMLページはバックエンドのサーバーに安全に保存されます
                  </p>
                </div>

                {/* ステップ3 */}
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-400 mb-2">03</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">お客様へ配信</h3>
                  <p className="text-gray-600">
                    バックエンドが保存されたHTMLページをお客様のスマホに配信。すぐに注文可能に
                  </p>
                </div>
              </div>

              {/* 説明エリア */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 border-t border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">フロントエンド・バックエンド分離設計</h4>
                    <p className="text-gray-700">
                      管理画面（フロントエンド）でページを作成し、配信サーバー（バックエンド）が顧客向けにHTMLを提供。
                      この分離設計により、管理画面とお客様向けページが独立して動作し、高速で安定したサービスを実現します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">OrderBaseを選ぶ理由</h2>
              <p className="text-xl text-blue-100">シンプルで使いやすい、次世代の管理システム</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">簡単操作</h3>
                <p className="text-blue-100">直感的なUIで誰でもすぐに使いこなせます</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">クラウド対応</h3>
                <p className="text-blue-100">どこからでもアクセス可能</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">安全・安心</h3>
                <p className="text-blue-100">データは暗号化して安全に保管</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            今すぐ始めましょう
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            アカウント登録は無料。すぐにご利用いただけます。
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            無料で始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="relative w-10 h-10 rounded-full bg-white shadow-lg p-1.5">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo.png"
                    alt="OrderBase Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-bold">OrderBase</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2026 OrderBase. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
