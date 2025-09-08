"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reply, setReply] = useState("");
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [copied, setCopied] = useState(false);
  const [destination, setDestination] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [origin, setOrigin] = useState("");
  const [routeError, setRouteError] = useState("");
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [calTitle, setCalTitle] = useState("");
  const [calStart, setCalStart] = useState("");
  const [calEnd, setCalEnd] = useState("");
  const [calLocation, setCalLocation] = useState("");
  const [calDetails, setCalDetails] = useState("");
  const [calError, setCalError] = useState("");

  const extractDestinationFromText = (text: string): string => {
    if (!text) return "";

    // 正規化
    const source = text.replace(/[\t\r]+/g, "\n");

    const extractCoreAddress = (raw: string): string => {
      const s = raw.trim();
      const m = s.match(/[\u4E00-\u9FFF]+(都|道|府|県)/);
      if (!m) return s.replace(/[。．、,]+$/, "");
      const start = m.index ?? 0;
      let core = s.slice(start);
      core = core.split(/(※|\(|（|。|\.|，|,)/)[0] || core;
      return core.trim().replace(/[。．、,]+$/, "");
    };

    // 1) GoogleマップURL
    try {
      const urlMatch = source.match(/https?:\/\/[^\s)\]}]+/g);
      if (urlMatch) {
        for (const u of urlMatch) {
          try {
            const url = new URL(u.replace(/[),。]+$/, ""));
            if (url.hostname.includes("google") && url.pathname.includes("maps")) {
              // /maps/place/<encoded address>/ 形式
              const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/);
              if (placeMatch) {
                const decoded = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ");
                if (decoded) return decoded;
              }
              const q = url.searchParams.get("q") || url.searchParams.get("destination");
              if (q) return decodeURIComponent(q);
            }
          } catch {}
        }
      }
    } catch {}

    // 2) ラベルつき住所行（住所/所在地/会場/場所/集合場所/開催地/本社/支社/オフィス/勤務地）
    const labelRegex = /^(住所|所在地|会場|場所|集合場所|開催地|本社|支社|オフィス|勤務地)[\s　]*[：:]*[\s　]*([^\n]+)/m;
    const labelMatch = source.match(labelRegex);
    if (labelMatch) {
      const candidate = extractCoreAddress(labelMatch[2]);
      if (candidate) return candidate;
    }

    // 3) 郵便番号 + 住所
    const zipBlockRegex = /(〒?\s?\d{3}[-ー―]\d{4})[\s　]*([^\n]+)/;
    const zipBlock = source.match(zipBlockRegex);
    if (zipBlock) {
      const merged = `${zipBlock[1]} ${zipBlock[2].trim()}`.replace(/[。．、,]+$/, "");
      if (merged) return merged;
    }

    // 4) 緯度経度（柔軟）
    const coord = source.match(/(-?\d{1,3}\.\d{2,7})\s*,\s*(-?\d{1,3}\.\d{2,7})/);
    if (coord) return `${coord[1]},${coord[2]}`;

    // 5) 日本の住所らしき行（都/道/府/県 を含む）
    const lines = source.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const addressCandidates: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/[\u4E00-\u9FFF]+(都|道|府|県)/.test(line)) {
        const withoutLabel = line.replace(/^(住所|所在地|会場|場所|集合場所|開催地|本社|支社|オフィス|勤務地)[\s　]*[：:][\s　]*/, "");
        const cleaned = extractCoreAddress(withoutLabel);
        addressCandidates.push(cleaned);
      }
    }
    if (addressCandidates.length > 0) {
      // 最も長いものを採用
      addressCandidates.sort((a, b) => b.length - a.length);
      return addressCandidates[0];
    }

    return "";
  };

  const handleExtractDestination = () => {
    const extracted = extractDestinationFromText(email || summary);
    if (extracted) {
      setDestination(extracted);
      setRouteError("");
    } else {
      setRouteError("本文から目的地を抽出できませんでした");
    }
  };

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
    setReply("");
    setReplyError("");
    setDestination("");
    setOrigin("");
    setRouteError("");
    setCalTitle("");
    setCalStart("");
    setCalEnd("");
    setCalLocation("");
    setCalDetails("");
    setCalError("");
  };

  const handleGenerateReply = async () => {
    if (!email.trim()) return;
    setIsReplyLoading(true);
    setReplyError("");
    setReply("");

    try {
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, tone: '丁寧', length: '中' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'エラーが発生しました');
      }

      setReply(data.reply || "");
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsReplyLoading(false);
    }
  };

  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setReplyError('クリップボードへのコピーに失敗しました');
    }
  };

  const openMaps = (originParam: string | null, destinationParam: string) => {
    const params = new URLSearchParams({ api: "1", destination: destinationParam });
    if (originParam && originParam.trim()) params.set("origin", originParam);
    const url = `https://www.google.com/maps/dir/?${params.toString()}`;
    window.open(url, "_blank");
  };

  const handleOpenRoute = async () => {
    setRouteError("");
    if (!destination.trim()) {
      setRouteError("目的地を入力してください");
      return;
    }
    setIsRouteLoading(true);
    try {
      const dest = destination.trim();
      if (useCurrentLocation && typeof navigator !== 'undefined' && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });
        const { latitude, longitude } = position.coords;
        const originCoords = `${latitude},${longitude}`;
        openMaps(originCoords, dest);
      } else {
        const originText = origin.trim() ? origin.trim() : "";
        openMaps(originText || null, dest);
      }
    } catch (e) {
      // フォールバック: 現在地取得に失敗しても出発地なしで開く
      try {
        const dest = destination.trim();
        openMaps(null, dest);
      } catch {
        setRouteError("経路を開けませんでした");
      }
    } finally {
      setIsRouteLoading(false);
    }
  };

  const toGCalDate = (datetimeLocal: string): string => {
    const d = new Date(datetimeLocal);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  };

  const handleOpenCalendar = () => {
    setCalError("");
    let title = calTitle.trim();
    if (!title) {
      title = (summary.split('\n')[0] || '予定').slice(0, 60);
      setCalTitle(title);
    }
    let datesParam = "";
    if (calStart) {
      const start = toGCalDate(calStart);
      if (!start) {
        setCalError("開始日時の形式が正しくありません");
        return;
      }
      let end = "";
      if (calEnd) {
        end = toGCalDate(calEnd);
        if (!end) {
          setCalError("終了日時の形式が正しくありません");
          return;
        }
        if (new Date(calEnd) < new Date(calStart)) {
          setCalError("終了は開始より後にしてください");
          return;
        }
      } else {
        const oneHour = new Date(new Date(calStart).getTime() + 60 * 60 * 1000);
        end = oneHour.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
      }
      datesParam = `${start}/${end}`;
    }
    const params = new URLSearchParams();
    params.set('text', title);
    if (datesParam) params.set('dates', datesParam);
    if (calLocation.trim()) params.set('location', calLocation.trim());
    const detailsText = calDetails.trim() || summary || email;
    if (detailsText) params.set('details', detailsText);
    const url = `https://calendar.google.com/calendar/u/0/r/eventedit?${params.toString()}`;
    window.open(url, '_blank');
  };

  const handleExtractCalendar = () => {
    const source = `${summary}\n${email}`;
    if (!calTitle.trim()) {
      const mSubject = source.match(/(件名|タイトル|題名)[：:]\s*(.+)/);
      if (mSubject) setCalTitle(mSubject[2].trim());
      else setCalTitle((summary.split('\n')[0] || '予定').slice(0, 60));
    }
    if (!calLocation.trim()) {
      const extracted = extractDestinationFromText(source);
      if (extracted) setCalLocation(extracted);
    }
    if (!calStart) {
      const mDateTime = source.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+(\d{1,2}):(\d{2})/);
      if (mDateTime) {
        const [_, y, mo, d, h, mi] = mDateTime;
        const mm = (mo as string).padStart(2,'0');
        const dd = (d as string).padStart(2,'0');
        const hh = (h as string).padStart(2,'0');
        const mimi = (mi as string).padStart(2,'0');
        setCalStart(`${y}-${mm}-${dd}T${hh}:${mimi}`);
      }
    }
    if (!calEnd && calStart) {
      const endDefault = new Date(new Date(calStart).getTime() + 60 * 60 * 1000);
      const iso = endDefault.toISOString();
      setCalEnd(iso.slice(0,16));
    }
    if (!calDetails.trim()) setCalDetails(summary);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/80 border border-gray-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xl">💬</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">返信を作成</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">個人情報なし</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">要約をもとに丁寧な返信案を生成します。</p>
                    </div>
                  </div>
                  <button aria-label="返信を作成" title="返信を作成" onClick={handleGenerateReply} disabled={isReplyLoading} className="w-full group bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <span className="text-lg">{isReplyLoading ? '生成中…' : '返信を作成'}</span>
                  </button>
                </div>

                <div className="bg-white/80 border border-gray-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 text-white text-xl">🗺️</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900">ルート検索</h4>
                        {destination.trim() ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">準備OK</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">目的地未入力</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">現在地から目的地までの経路をGoogleマップで開きます。</p>
                      {!destination.trim() && (
                        <button type="button" onClick={handleExtractDestination} className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700">本文から目的地を抽出する</button>
                      )}
                    </div>
                  </div>
                  <button aria-label="ルート検索" title="ルート検索" onClick={handleOpenRoute} disabled={isRouteLoading || !destination.trim()} className="w-full group bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <span className="text-lg">{isRouteLoading ? '開いています…' : 'ルート検索'}</span>
                  </button>
                </div>

                <div className="bg-white/80 border border-gray-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white text-xl">📅</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900">カレンダー追加</h4>
                        {(calTitle || calStart || calLocation) ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">準備OK</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">任意入力</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">件名・日時・場所を指定してGoogleカレンダーを開きます。</p>
                      {!(calTitle || calStart || calLocation) && (
                        <button type="button" onClick={handleExtractCalendar} className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700">本文から情報を抽出する</button>
                      )}
                    </div>
                  </div>
                  <button aria-label="カレンダー追加" title="カレンダー追加" onClick={handleOpenCalendar} className="w-full group bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <span className="text-lg">カレンダー追加</span>
                  </button>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">件名</label>
                  <input value={calTitle} onChange={(e) => setCalTitle(e.target.value)} placeholder="件名（未入力なら要約の先頭行）" className="w-full p-3 bg-white border-2 border-gray-2 00 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">場所</label>
                  <div className="flex gap-2">
                    <input value={calLocation} onChange={(e) => setCalLocation(e.target.value)} placeholder="場所（未入力なら本文から抽出可）" className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all" />
                    <button type="button" onClick={handleExtractCalendar} className="whitespace-nowrap bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-bold py-2 px-3 rounded-xl shadow-md hover:shadow-lg transition-all">本文から抽出</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">開始</label>
                  <input type="datetime-local" value={calStart} onChange={(e) => setCalStart(e.target.value)} className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">終了</label>
                  <input type="datetime-local" value={calEnd} onChange={(e) => setCalEnd(e.target.value)} className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">詳細</label>
                  <textarea value={calDetails} onChange={(e) => setCalDetails(e.target.value)} placeholder="イベントの詳細（未入力なら本文/要約）" className="w-full h-28 p-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all" />
                </div>
              </div>
              {calError && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium">{calError}</span>
                </div>
              )}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">目的地</label>
                  <div className="flex gap-2">
                    <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="例: 東京駅 / 35.6812,139.7671 / 住所" className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all" />
                    <button type="button" onClick={handleExtractDestination} className="whitespace-nowrap bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-bold py-2 px-3 rounded-xl shadow-md hover:shadow-lg transition-all">本文から抽出</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">出発地（任意）</label>
                  <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="未指定で現在地またはGoogle側推定" disabled={useCurrentLocation} className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500" />
                  <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={useCurrentLocation} onChange={(e) => setUseCurrentLocation(e.target.checked)} className="rounded" />
                    現在地を出発地にする
                  </label>
                </div>
              </div>
              {routeError && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium">{routeError}</span>
                </div>
              )}
              {replyError && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium">{replyError}</span>
                </div>
              )}
              {reply && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                      <span className="text-lg">💡</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800">返信案</h4>
                    <button onClick={handleCopyReply} className="ml-auto group bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                      <span>{copied ? '✅ コピーしました' : '📋 コピー'}</span>
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-2xl p-6 border border-emerald-100 shadow-inner">
                    <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                      {reply}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}