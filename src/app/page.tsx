"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'エラーが発生しました');
      }

      setSummary(data.summary);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setSummary("");
    setError("");
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-4 left-1/4 w-24 h-24 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-4 right-1/4 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-24 h-24 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
              <span className="text-2xl">📧</span>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              メールっと
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">AIがメールを瞬時に要約 ✨</p>
          <p className="text-sm text-gray-500 mt-2">忙しいあなたのための、かんたんメール整理術</p>
        </header>

        {!isSubmitted ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-lg">✉️</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                メールを貼り付けてください
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <textarea
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メール全文をここに貼り付けてください...&#10;&#10;💡 ヒント: Ctrl+V (Cmd+V) で簡単に貼り付けできます"
                  className="w-full h-80 p-6 text-gray-700 bg-gray-50/80 border-2 border-gray-200 rounded-2xl resize-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all duration-300 placeholder-gray-400 text-base leading-relaxed group-hover:bg-gray-50"
                  required
                />
                <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
                  {email.length > 0 && `${email.length} 文字`}
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-shake">
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}
              
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="group relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-2xl shadow-xl hover:shadow-2xl disabled:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  <span className="relative z-10 flex items-center gap-3 text-lg">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>AI要約中...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>要約する</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">✨</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  要約完了！
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="group bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span>🔄</span>
                <span>新しいメール</span>
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl p-8 mb-8 border border-blue-100 shadow-inner">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                {summary}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  推奨アクション
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="group bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3">
                  <span className="text-xl">💬</span>
                  <span>返信を作成</span>
                </button>
                <button className="group bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3">
                  <span className="text-xl">🗺️</span>
                  <span>ルート検索</span>
                </button>
                <button className="group bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 sm:col-span-2 lg:col-span-1">
                  <span className="text-xl">📅</span>
                  <span>カレンダー追加</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}