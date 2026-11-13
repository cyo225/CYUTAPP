import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Coupon, StudentProfile, RepairTicket } from '../types';
import { 
  Gift, 
  Flame, 
  Ticket, 
  ShoppingBag, 
  Store, 
  Award, 
  CheckCircle2, 
  Tag, 
  Wrench, 
  Sparkles, 
  Plus, 
  AlertTriangle,
  QrCode,
  X,
  Coins
} from 'lucide-react';

interface RewardsMarketHubProps {
  profile: StudentProfile;
  userCoupons: Coupon[];
  marketplaceCoupons: Coupon[];
  repairTickets: RepairTicket[];
  onCheckIn: () => void;
  onDrawMysteryBox: () => Coupon;
  onListCouponForSale: (couponId: string, salePrice: number) => boolean;
  onBuyMarketCoupon: (coupon: Coupon) => boolean;
  onNavigateToRepair: () => void;
}

export const RewardsMarketHub: React.FC<RewardsMarketHubProps> = ({
  profile,
  userCoupons,
  marketplaceCoupons,
  repairTickets,
  onCheckIn,
  onDrawMysteryBox,
  onListCouponForSale,
  onBuyMarketCoupon,
  onNavigateToRepair,
}) => {
  const [activeTab, setActiveTab] = useState<'mystery-box' | 'my-coupons' | 'c2c-market' | 'tasks'>('mystery-box');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPrize, setDrawnPrize] = useState<Coupon | null>(null);

  // C2C Resale listing modal
  const [selectedListingCoupon, setSelectedListingCoupon] = useState<Coupon | null>(null);
  const [resalePrice, setResalePrice] = useState<number>(0);
  const [resaleError, setResaleError] = useState<string | null>(null);

  // Active coupon QR modal
  const [activeQrCoupon, setActiveQrCoupon] = useState<Coupon | null>(null);

  const streakDays = [
    { day: 1, points: 20, reward: '20 點' },
    { day: 2, points: 25, reward: '25 點' },
    { day: 3, points: 30, reward: '30 點 + 抽獎券' },
    { day: 4, points: 35, reward: '35 點' },
    { day: 5, points: 40, reward: '40 點' },
    { day: 6, points: 50, reward: '50 點 + 抽獎券' },
    { day: 7, points: 80, reward: '80 點 + 必中盲盒' },
  ];

  const handlePerformCheckIn = () => {
    onCheckIn();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E50914', '#FF4D4D', '#FFD700', '#FFFFFF'],
    });
  };

  const handleDrawBox = () => {
    if (profile.points < 50) {
      alert('點數不足！每次抽取美食盲盒需 50 點，請透過簽到或教室報修獲取。');
      return;
    }

    setIsDrawing(true);
    setTimeout(() => {
      const prize = onDrawMysteryBox();
      setDrawnPrize(prize);
      setIsDrawing(false);
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#E50914', '#FFD700', '#10B981'],
      });
    }, 1500);
  };

  const handleOpenListModal = (cp: Coupon) => {
    setSelectedListingCoupon(cp);
    // Set default price to exactly 90% of original value (safe)
    const safePrice = Math.floor(cp.originalValue * 0.85);
    setResalePrice(safePrice);
    setResaleError(null);
  };

  const handleConfirmListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingCoupon) return;

    const maxAllowed = Math.floor(selectedListingCoupon.originalValue * 0.95);
    if (resalePrice > maxAllowed) {
      setResaleError(`轉售價格不得超過原價值的 95%（此券上限為 NT$ ${maxAllowed}）！`);
      return;
    }
    if (resalePrice <= 0) {
      setResaleError('轉售價格必須大於 0 元。');
      return;
    }

    const success = onListCouponForSale(selectedListingCoupon.id, resalePrice);
    if (success) {
      setSelectedListingCoupon(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Points & Daily Check-in Hero Section */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0B0F17] via-[#1A2234] to-[#0B0F17] border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-[#E50914] tracking-widest uppercase">
              朝陽科大校園點數中心 · REWARDS HUB
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              每日簽到加碼 & 美食盲盒抽獎
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              持續簽到累積加成倍率；透過「教室報修與公共回饋」任務快速累積點數，抽取霧峰合作商圈美食折價券。
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/90 p-3.5 px-5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">目前可用點數</div>
              <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono tabular-nums">
                {profile.points} <span className="text-xs font-sans text-slate-400">PTS</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">美食抽獎券</div>
              <div className="text-xl md:text-2xl font-bold text-[#E50914] font-mono tabular-nums">
                {profile.lotteryTickets} <span className="text-xs font-sans text-slate-400">張</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Streak Timeline */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-bold text-white">
                連續簽到進度：已達 {profile.streakDays} 天
              </span>
            </div>
            <button
              onClick={handlePerformCheckIn}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E50914] hover:bg-red-600 text-white shadow-lg shadow-red-950/60 active:scale-95 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>今日簽到領取點數</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {streakDays.map((s) => {
              const isPassed = s.day <= profile.streakDays;
              const isToday = s.day === profile.streakDays + 1;

              return (
                <div
                  key={s.day}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isPassed
                      ? 'bg-red-950/30 border-red-800/80 text-white'
                      : isToday
                      ? 'bg-slate-900 border-[#E50914] text-white ring-1 ring-[#E50914]'
                      : 'bg-slate-950/50 border-slate-900 text-slate-500'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-400">第 {s.day} 天</div>
                  <div className="text-sm font-black text-amber-400 font-mono mt-1">
                    +{s.points}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">{s.reward}</div>
                  {isPassed && (
                    <div className="text-[10px] text-emerald-400 font-bold mt-1">✓ 已領取</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Mystery Box vs My Coupons vs C2C Market vs Tasks */}
      <div className="flex items-center gap-2 overflow-x-auto netflix-scrollbar border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('mystery-box')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-lg whitespace-nowrap transition ${
            activeTab === 'mystery-box'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>美食盲盒抽獎</span>
        </button>
        <button
          onClick={() => setActiveTab('my-coupons')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-lg whitespace-nowrap transition ${
            activeTab === 'my-coupons'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>我的優惠券夾 ({userCoupons.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('c2c-market')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-lg whitespace-nowrap transition ${
            activeTab === 'c2c-market'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>C2C 優惠券二級市場 (最高95折)</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-lg whitespace-nowrap transition ${
            activeTab === 'tasks'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>成就任務 (教室報修)</span>
        </button>
      </div>

      {/* Tab 1: Food Mystery Box */}
      {activeTab === 'mystery-box' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Mystery Box Machine */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#E50914] to-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-900/60 animate-pulse">
                <Gift className="w-12 h-12" />
              </div>

              <h3 className="text-xl font-black text-white">朝陽美食幸運盲盒機</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                消耗 <strong className="text-amber-400 font-mono">50 點數</strong> 或 1 張抽獎券，隨機抽取第一學餐、第二學餐、波浪廣場路易莎或霧峰老街合作商家折價券！
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <div className="font-bold text-slate-200 mb-2">🎁 本期合作特賞清單：</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-left">
                  <div>· 晨曦手搖飲 全品項折 $15</div>
                  <div>· 路易莎咖啡 拿鐵大杯 8 折</div>
                  <div>· 霧峰老街肉圓 套餐折 $20</div>
                  <div>· 綠漾舒肥輕食 便當現折 $25</div>
                </div>
              </div>

              <button
                onClick={handleDrawBox}
                disabled={isDrawing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-[#E50914] to-red-600 hover:from-red-500 hover:to-red-500 text-white font-extrabold text-base shadow-xl shadow-red-950/80 active:scale-98 transition disabled:opacity-50"
              >
                {isDrawing ? '🎰 盲盒抽取中...' : '🎲 消耗 50 點數抽取美食盲盒'}
              </button>
            </div>
          </div>

          {/* Drawn Prize Card / Showcase */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-[#161F30] border border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>最新抽取成果</span>
            </h4>

            {drawnPrize ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-red-900/60 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                    恭喜中獎！
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    價值 NT$ {drawnPrize.originalValue}
                  </span>
                </div>

                <h4 className="text-base font-black text-white">{drawnPrize.title}</h4>
                <div className="text-xs text-slate-300">{drawnPrize.storeName}</div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  {drawnPrize.discountDescription}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    券號: {drawnPrize.code}
                  </span>
                  <button
                    onClick={() => setActiveQrCoupon(drawnPrize)}
                    className="text-xs font-bold text-[#E50914] hover:underline"
                  >
                    查看出示 QR Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center text-xs">
                <Ticket className="w-10 h-10 mb-2 text-slate-600 opacity-60" />
                <span>尚未抽取盲盒</span>
                <span className="text-[11px] text-slate-600 mt-1">
                  點擊左側「抽取美食盲盒」試試手氣！
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: My Coupons */}
      {activeTab === 'my-coupons' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            點擊「出示條碼」可於店面結帳折抵；若暫時用不到，可點擊「上架二級市場」轉售給其他朝陽同學（售價限制不可超過 95%）。
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCoupons.map((cp) => (
              <div
                key={cp.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {cp.storeName}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      原價 NT$ {cp.originalValue}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1">{cp.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {cp.discountDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">效期至 {cp.expiryDate}</span>

                  <div className="flex items-center gap-2">
                    {cp.isListedForSale ? (
                      <span className="text-xs font-bold text-amber-400">已上架中 (NT$ {cp.salePrice})</span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenListModal(cp)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                        >
                          轉售
                        </button>
                        <button
                          onClick={() => setActiveQrCoupon(cp)}
                          className="px-3 py-1 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>出示</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: C2C Secondary Coupon Marketplace */}
      {activeTab === 'c2c-market' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-[#E50914]" />
                <span>CYUT 學生二級優惠券交換市集</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                嚴格遵循校規防黃牛規範：所有二級轉售價格<strong>「不得超過原價值之 95%」</strong>，系統自動檢核保障買賣雙方。
              </p>
            </div>

            <div className="text-xs text-amber-400 font-mono font-bold">
              最高折價限制：≤ 95%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketplaceCoupons.map((mkt) => {
              const discountRatio = Math.round((mkt.salePrice! / mkt.originalValue) * 100);

              return (
                <div
                  key={mkt.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                        {mkt.storeName}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {discountRatio} 折轉讓
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1">{mkt.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{mkt.discountDescription}</p>

                    <div className="text-[11px] text-slate-400 mt-2">
                      轉售同學：<span className="text-slate-200">{mkt.sellerName}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 line-through">原價 NT$ {mkt.originalValue}</div>
                      <div className="text-base font-black text-amber-400 font-mono">
                        NT$ {mkt.salePrice}
                      </div>
                    </div>

                    <button
                      onClick={() => onBuyMarketCoupon(mkt)}
                      className="px-4 py-2 text-xs font-bold bg-[#E50914] hover:bg-red-600 text-white rounded-xl shadow-md transition active:scale-95"
                    >
                      購買搶收
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Achievement Tasks (Strictly Classroom Repair & Public Feedback) */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#E50914]" />
                <span>成就任務：僅保留「教室報修 / 公共回饋」</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                依校務規章，日常點數成就純粹依賴實質校園公德貢獻（報修投影機、冷氣、桌椅問題），每筆完成確認即獲 50 點！
              </p>
            </div>

            <button
              onClick={onNavigateToRepair}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#E50914] text-white rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-950/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>通報教室報修</span>
            </button>
          </div>

          <div className="space-y-3">
            {repairTickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{t.building} {t.classroom}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {t.status === 'resolved' ? '已修復完畢' : '總務處檢修中'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">{t.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">通報時間: {t.timestamp}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-amber-400 font-mono">
                    +{t.pointsAwarded} PTS
                  </div>
                  <div className="text-[10px] text-slate-400">公共貢獻成就獎勵</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C2C Resale Listing Modal with Hard <= 95% Limit Validation */}
      {selectedListingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">上架轉售優惠券</h3>
              <button
                onClick={() => setSelectedListingCoupon(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4">
              <div className="text-xs font-bold text-white">{selectedListingCoupon.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">{selectedListingCoupon.storeName}</div>
              <div className="text-xs text-amber-400 font-mono mt-1">
                原票面價值：NT$ {selectedListingCoupon.originalValue}
              </div>
            </div>

            <form onSubmit={handleConfirmListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  自訂轉售價格 (NT$)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={Math.floor(selectedListingCoupon.originalValue * 0.95)}
                  value={resalePrice}
                  onChange={(e) => {
                    setResalePrice(Number(e.target.value));
                    setResaleError(null);
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-[#E50914]"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  🔒 嚴格規範：轉售價最高不得超過原價值 95%（上限 NT${' '}
                  <strong className="text-amber-400 font-mono">
                    {Math.floor(selectedListingCoupon.originalValue * 0.95)}
                  </strong>
                  ）
                </div>
              </div>

              {resaleError && (
                <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{resaleError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedListingCoupon(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition"
                >
                  確認上架市集
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Presentation Modal */}
      {activeQrCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center shadow-2xl">
            <h3 className="text-base font-bold text-white">{activeQrCoupon.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{activeQrCoupon.storeName}</p>

            {/* Simulated Clean SVG Barcode / QR */}
            <div className="my-6 p-4 bg-white rounded-2xl mx-auto w-52 h-52 flex flex-col items-center justify-center shadow-inner">
              <QrCode className="w-36 h-36 text-slate-900" />
              <div className="text-[10px] font-mono text-slate-700 tracking-wider mt-1">
                {activeQrCoupon.code}
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              結帳時出示此 QR Code 即可享有折抵優惠
            </p>

            <button
              onClick={() => setActiveQrCoupon(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition"
            >
              關閉條碼
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
