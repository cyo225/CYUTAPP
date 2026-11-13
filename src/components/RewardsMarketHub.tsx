import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Coupon, MerchantStore, RepairTicket, StudentProfile } from '../types';
import {
  Gift,
  Flame,
  Ticket,
  Store,
  AlertTriangle,
  QrCode,
  X,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Sparkles,
  Wrench,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';

interface RewardsMarketHubProps {
  profile: StudentProfile;
  merchants: MerchantStore[];
  userCoupons: Coupon[];
  marketplaceCoupons: Coupon[];
  repairTickets: RepairTicket[];
  onOpenCheckInModal: () => void;
  onDrawMysteryBox: () => Coupon;
  onListCouponForSale: (couponId: string, salePrice: number) => boolean;
  onBuyMarketCoupon: (coupon: Coupon) => boolean;
  onNavigateToRepair: () => void;
}

const LOTTERY_COST = 2000;

export const RewardsMarketHub: React.FC<RewardsMarketHubProps> = ({
  profile,
  merchants,
  userCoupons,
  marketplaceCoupons,
  repairTickets,
  onOpenCheckInModal,
  onDrawMysteryBox,
  onListCouponForSale,
  onBuyMarketCoupon,
  onNavigateToRepair,
}) => {
  // Default view: Partner Merchants List ('merchants')
  const [activeTab, setActiveTab] = useState<'merchants' | 'lottery' | 'my-coupons' | 'c2c-market' | 'tasks'>('merchants');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPrize, setDrawnPrize] = useState<Coupon | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);

  // Lightbox for Merchant Menu Image
  const [menuPreviewModal, setMenuPreviewModal] = useState<{ title: string; image: string } | null>(null);

  // C2C Resale listing modal
  const [selectedListingCoupon, setSelectedListingCoupon] = useState<Coupon | null>(null);
  const [resalePrice, setResalePrice] = useState<number>(0);
  const [resaleError, setResaleError] = useState<string | null>(null);

  // Active coupon QR modal
  const [activeQrCoupon, setActiveQrCoupon] = useState<Coupon | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const checkedInToday = profile.lastCheckInDate === todayStr;

  const handleDrawBox = () => {
    if (profile.points < LOTTERY_COST) {
      setDrawError(`點數不足！每次抽優惠券需要 ${LOTTERY_COST.toLocaleString()} 點（目前僅有 ${profile.points.toLocaleString()} 點）。`);
      return;
    }

    setDrawError(null);
    setIsDrawing(true);
    setTimeout(() => {
      const prize = onDrawMysteryBox();
      setDrawnPrize(prize);
      setIsDrawing(false);
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#E50914', '#FFD700', '#10B981'],
      });
    }, 1200);
  };

  const handleOpenListModal = (cp: Coupon) => {
    setSelectedListingCoupon(cp);
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
    <div className="space-y-6">
      {/* Compact Top Bar: Daily Check-In Entry (Left) & Real-Time Available Points (Top-Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenCheckInModal}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
              checkedInToday
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-[#E50914] hover:bg-red-600 text-white shadow-red-950/50 active:scale-95'
            }`}
          >
            <Flame className={`w-4 h-4 ${checkedInToday ? 'text-amber-400' : 'text-white'}`} />
            <span>
              {checkedInToday
                ? `今日已簽到 · 連續 ${profile.streakDays} 天`
                : '每日簽到領點數（7天循環）'}
            </span>
          </button>

          <span className="text-xs text-slate-400">
            特約合作商家 · 滿 <span className="font-mono text-white">2,000</span> 點可抽優惠券
          </span>
        </div>

        {/* Top-Right Real-Time Available Points */}
        <div className="flex items-center justify-between sm:justify-end gap-4 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">目前可用點數</div>
            <div className="text-xl font-black text-amber-400 font-mono tabular-nums leading-tight">
              {profile.points.toLocaleString()} <span className="text-xs font-sans text-slate-400">PTS</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">我的票券</div>
            <div className="text-base font-bold text-[#E50914] font-mono tabular-nums leading-tight">
              {userCoupons.length} <span className="text-xs font-sans text-slate-400">張</span>
            </div>
          </div>
        </div>
      </div>

      {/* Separated Function Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto netflix-scrollbar border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('merchants')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'merchants'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>合作商家資訊 ({merchants.filter((m) => m.paid).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lottery')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'lottery'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>抽優惠券 (2000 點)</span>
        </button>

        <button
          onClick={() => setActiveTab('my-coupons')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'my-coupons'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>查看我的優惠券 ({userCoupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('c2c-market')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'c2c-market'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>二級轉售市集</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'tasks'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>教室報修任務</span>
        </button>
      </div>

      {/* DEFAULT VIEW: Partner Merchants Directory */}
      {activeTab === 'merchants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {merchants
            .filter((m) => m.paid)
            .map((merchant) => {
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                merchant.address
              )}`;

              return (
                <div
                  key={merchant.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    {/* Merchant Cover Photo (or clean fallback) */}
                    {merchant.coverImage ? (
                      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                        <img
                          src={merchant.coverImage}
                          alt={merchant.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center text-slate-500">
                        <Store className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-xs">{merchant.name}</span>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-xs text-slate-400">{merchant.category}</div>
                        <h3 className="text-lg font-extrabold text-white mt-0.5">
                          {merchant.name}
                        </h3>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300">
                        {/* Address -> Click opens Google Maps Navigation */}
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 text-slate-200 hover:text-[#E50914] transition group"
                          title="點擊開啟 Google Map 導航"
                        >
                          <MapPin className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                          <span className="underline decoration-slate-700 group-hover:decoration-[#E50914]">
                            {merchant.address}（開啟 Google Map 導航）
                          </span>
                        </a>

                        {/* Phone */}
                        <a
                          href={`tel:${merchant.phone}`}
                          className="flex items-center gap-2 text-slate-300 hover:text-white font-mono"
                        >
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{merchant.phone}</span>
                        </a>

                        {/* Business Hours (Auto-hidden if empty) */}
                        {merchant.businessHours && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{merchant.businessHours}</span>
                          </div>
                        )}

                        {/* Latest Promo (Auto-hidden if empty) */}
                        {merchant.latestPromo && (
                          <div className="flex items-start gap-2 text-amber-300 pt-1">
                            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{merchant.latestPromo}</span>
                          </div>
                        )}

                        {/* Website (Auto-hidden if empty) */}
                        {merchant.website && (
                          <a
                            href={merchant.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition"
                          >
                            <ExternalLink className="w-4 h-4 shrink-0" />
                            <span className="truncate">{merchant.website}</span>
                          </a>
                        )}
                      </div>

                      {/* Menu Image (Auto-hidden if empty) */}
                      {merchant.menuImage && (
                        <div className="pt-3 border-t border-slate-800/90">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span>店家菜單圖片</span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setMenuPreviewModal({
                                  title: `${merchant.name} · 菜單`,
                                  image: merchant.menuImage!,
                                })
                              }
                              className="text-[11px] font-bold text-[#E50914] hover:underline"
                            >
                              點擊放大檢視
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setMenuPreviewModal({
                                title: `${merchant.name} · 菜單`,
                                image: merchant.menuImage!,
                              })
                            }
                            className="w-full overflow-hidden rounded-xl border border-slate-800 hover:border-slate-600 transition"
                          >
                            <img
                              src={merchant.menuImage}
                              alt={`${merchant.name} 菜單`}
                              className="w-full h-28 object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* TAB 2: Dedicated Coupon Lottery Page (2000 Points Threshold) */}
      {activeTab === 'lottery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-[#E50914] to-red-500 flex items-center justify-center text-white shadow-xl shadow-red-950/50">
                <Gift className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-black text-white">合作商家優惠券抽獎機</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                每次抽獎需消耗{' '}
                <strong className="text-amber-400 font-mono tabular-nums">
                  {LOTTERY_COST.toLocaleString()} 點數
                </strong>
                ，隨機抽出合作商家折價券或飲品兌換券！
              </p>

              {/* Progress toward 2000 points */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">抽獎點數進度</span>
                  <span className="font-mono font-bold text-amber-400 tabular-nums">
                    {profile.points.toLocaleString()} / {LOTTERY_COST.toLocaleString()} PTS
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E50914] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (profile.points / LOTTERY_COST) * 100)}%` }}
                  />
                </div>
              </div>

              {drawError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 text-[#E50914] shrink-0" />
                  <span>{drawError}</span>
                </div>
              )}

              <button
                onClick={handleDrawBox}
                disabled={isDrawing}
                className="w-full py-4 rounded-2xl bg-[#E50914] hover:bg-red-600 text-white font-extrabold text-sm shadow-xl shadow-red-950/60 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isDrawing ? '抽取優惠券中...' : `消耗 ${LOTTERY_COST.toLocaleString()} 點抽取優惠券`}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>本次抽獎結果</span>
            </h4>

            {drawnPrize ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-red-900/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold">恭喜獲得優惠券</span>
                  <span className="font-mono text-amber-400 font-bold">
                    價值 NT$ {drawnPrize.originalValue}
                  </span>
                </div>
                <h4 className="text-base font-black text-white">{drawnPrize.title}</h4>
                <div className="text-xs text-slate-300">{drawnPrize.storeName}</div>
                <div className="text-xs text-slate-400">{drawnPrize.discountDescription}</div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    券號: {drawnPrize.code}
                  </span>
                  <button
                    onClick={() => setActiveQrCoupon(drawnPrize)}
                    className="text-xs font-bold text-[#E50914] hover:underline"
                  >
                    出示 QR Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-center text-xs">
                <Ticket className="w-10 h-10 mb-2 opacity-50" />
                <span>點擊左側按鈕消耗 2,000 點進行抽獎</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Dedicated My Coupons Page */}
      {activeTab === 'my-coupons' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            點擊「出示」可於合作商家結帳折抵；未使用的優惠券可上架至二級市場轉讓（售價上限為原價值 95%）。
          </div>

          {userCoupons.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
              目前尚未擁有任何優惠券，累積滿 2,000 點即可前往「抽優惠券」試試手氣。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCoupons.map((cp) => (
                <div
                  key={cp.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-300 truncate">{cp.storeName}</span>
                      <span className="font-mono font-bold text-amber-400 shrink-0">
                        價值 NT$ {cp.originalValue}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1">{cp.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {cp.discountDescription}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      效期至 {cp.expiryDate}
                    </span>

                    <div className="flex items-center gap-2">
                      {cp.isListedForSale ? (
                        <span className="text-xs font-bold text-amber-400">
                          已上架 (NT$ {cp.salePrice})
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenListModal(cp)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                          >
                            轉售
                          </button>
                          <button
                            onClick={() => setActiveQrCoupon(cp)}
                            className="px-3 py-1.5 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>出示</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: C2C Secondary Coupon Marketplace */}
      {activeTab === 'c2c-market' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              學生二級優惠券交換市集 · 轉售價嚴格限制不得超過原價值 95%
            </div>
            <div className="text-xs text-amber-400 font-mono font-bold">
              轉售價上限：≤ 95%
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
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-300 font-semibold">{mkt.storeName}</span>
                      <span className="font-bold text-emerald-400">{discountRatio} 折</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{mkt.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{mkt.discountDescription}</p>
                    <div className="text-[11px] text-slate-400 mt-2">
                      轉售同學：<span className="text-slate-200">{mkt.sellerName}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 line-through">
                        原價 NT$ {mkt.originalValue}
                      </div>
                      <div className="text-base font-black text-amber-400 font-mono">
                        NT$ {mkt.salePrice}
                      </div>
                    </div>

                    <button
                      onClick={() => onBuyMarketCoupon(mkt)}
                      className="px-4 py-2 text-xs font-bold bg-[#E50914] hover:bg-red-600 text-white rounded-xl transition active:scale-95"
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

      {/* TAB 5: Classroom Repair Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">教室報修與公共回饋任務</h3>
              <p className="text-xs text-slate-400 mt-1">
                通報教室設備問題經受理即可獲得 +50 點獎勵。
              </p>
            </div>
            <button
              onClick={onNavigateToRepair}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#E50914] text-white rounded-xl hover:bg-red-600 transition whitespace-nowrap"
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
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white">
                      {t.building} {t.classroom}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={t.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}>
                      {t.status === 'resolved' ? '已修復' : '檢修中'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">{t.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{t.timestamp}</div>
                </div>

                <div className="text-xs font-bold text-amber-400 font-mono shrink-0">
                  +{t.pointsAwarded} PTS
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Image Zoom Modal */}
      {menuPreviewModal && (
        <div
          onClick={() => setMenuPreviewModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">{menuPreviewModal.title}</h4>
              <button
                onClick={() => setMenuPreviewModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={menuPreviewModal.image}
              alt={menuPreviewModal.title}
              className="w-full max-h-[75vh] object-contain rounded-xl bg-slate-950"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* C2C Resale Listing Modal */}
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

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4 text-xs">
              <div className="font-bold text-white">{selectedListingCoupon.title}</div>
              <div className="text-slate-400 mt-0.5">{selectedListingCoupon.storeName}</div>
              <div className="text-amber-400 font-mono mt-1">
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
                  上限 NT$ {Math.floor(selectedListingCoupon.originalValue * 0.95)}（原價 95%）
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
                  確認上架
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

            <div className="my-6 p-4 bg-white rounded-2xl mx-auto w-52 h-52 flex flex-col items-center justify-center shadow-inner">
              <QrCode className="w-36 h-36 text-slate-900" />
              <div className="text-[10px] font-mono text-slate-700 tracking-wider mt-1">
                {activeQrCoupon.code}
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6">結帳時出示此 QR Code 即可折抵</p>

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
