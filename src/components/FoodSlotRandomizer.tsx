import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CafeteriaCrowd, Coupon, MerchantStore } from '../types';
import { wheelAudio } from '../utils/wheelAudio';
import {
  Dices,
  Utensils,
  MapPin,
  Clock,
  Users,
  Navigation,
  Gift,
  QrCode,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  Store,
  ChevronRight,
} from 'lucide-react';

const DAILY_LUCKY_CLAIMS_KEY = 'cyut_daily_lucky_store_claims';

function getTaiwanDateString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function getTaiwanHour(): number {
  try {
    const h = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Taipei',
      hour: 'numeric',
      hour12: false,
    }).format(new Date());
    return Number(h) || new Date().getHours();
  } catch {
    return new Date().getHours();
  }
}

export function loadTodayClaimedStoreCoupons(): Record<string, Coupon> {
  try {
    const raw = localStorage.getItem(DAILY_LUCKY_CLAIMS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { date: string; claims: Record<string, Coupon> };
    if (parsed.date !== getTaiwanDateString()) return {};
    return parsed.claims || {};
  } catch {
    return {};
  }
}

export function saveTodayClaimedStoreCoupon(storeId: string, coupon: Coupon): void {
  try {
    const current = loadTodayClaimedStoreCoupons();
    current[storeId] = coupon;
    localStorage.setItem(
      DAILY_LUCKY_CLAIMS_KEY,
      JSON.stringify({
        date: getTaiwanDateString(),
        claims: current,
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

interface FoodSlotRandomizerProps {
  allMerchants: MerchantStore[];
  filteredMerchants: MerchantStore[];
  hasActiveFilter: boolean;
  cafeteriaList: CafeteriaCrowd[];
  onClaimStoreCoupon: (coupon: Coupon) => void;
  onShowCouponQr: (coupon: Coupon) => void;
  onSelectStoreDetail: (store: MerchantStore) => void;
}

export const FoodSlotRandomizer: React.FC<FoodSlotRandomizerProps> = ({
  allMerchants,
  filteredMerchants,
  hasActiveFilter,
  cafeteriaList,
  onClaimStoreCoupon,
  onShowCouponQr,
  onSelectStoreDetail,
}) => {
  const [poolScope, setPoolScope] = useState<'all' | 'filtered'>('all');
  const [isRolling, setIsRolling] = useState(false);
  const [reelIndex, setReelIndex] = useState(0);
  const [winnerStore, setWinnerStore] = useState<MerchantStore | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(wheelAudio.isMuted());
  const [claimedCouponsMap, setClaimedCouponsMap] = useState<Record<string, Coupon>>(() =>
    loadTodayClaimedStoreCoupons()
  );

  const rollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current !== null) {
        window.clearTimeout(rollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasActiveFilter && poolScope === 'filtered') {
      setPoolScope('all');
    }
  }, [hasActiveFilter, poolScope]);

  const activePool =
    poolScope === 'filtered' && filteredMerchants.length > 0 ? filteredMerchants : allMerchants;

  const safeReelIdx = activePool.length > 0 ? reelIndex % activePool.length : 0;
  const currentReelStore = activePool[safeReelIdx] || allMerchants[0];
  const prevReelStore =
    activePool.length > 1
      ? activePool[(safeReelIdx - 1 + activePool.length) % activePool.length]
      : null;
  const nextReelStore =
    activePool.length > 1 ? activePool[(safeReelIdx + 1) % activePool.length] : null;

  const toggleMute = () => {
    const next = !isMuted;
    wheelAudio.setMuted(next);
    setIsMuted(next);
    if (!next) {
      wheelAudio.unlock();
      wheelAudio.playMarqueeHop(0, 0.5);
    }
  };

  const handleStartBlindBoxRoll = () => {
    if (isRolling || activePool.length === 0) return;

    wheelAudio.unlock();
    wheelAudio.playSpinStart();
    setIsRolling(true);
    setWinnerStore(null);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const targetOffset = Math.floor(Math.random() * activePool.length);
    const totalSteps = prefersReducedMotion
      ? 6
      : Math.max(22, Math.min(34, activePool.length * 2 + 12)) + targetOffset;

    let step = 0;
    const startIdx = safeReelIdx;

    const tick = () => {
      const nextIdx = (startIdx + step) % activePool.length;
      setReelIndex(nextIdx);

      const progress = step / totalSteps;
      const speedFactor = 1 - progress;
      wheelAudio.playMarqueeHop(step, speedFactor);

      step += 1;

      if (step <= totalSteps) {
        const delay = prefersReducedMotion
          ? 65
          : Math.round(45 + Math.pow(progress, 2.8) * 330);
        rollTimerRef.current = window.setTimeout(tick, delay);
      } else {
        setIsRolling(false);
        const landed = activePool[nextIdx];
        setWinnerStore(landed);
        wheelAudio.playCelebration();

        const accentHex =
          getComputedStyle(document.documentElement).getPropertyValue('--accent-bright').trim() ||
          '#0EA5E9';
        confetti({
          particleCount: 105,
          spread: 80,
          origin: { y: 0.45 },
          colors: [accentHex, '#FACC15', '#10B981', '#F97316'],
        });
      }
    };

    tick();
  };

  const handleClaimLuckyCoupon = (store: MerchantStore) => {
    if (claimedCouponsMap[store.id]) return;

    const todayStr = getTaiwanDateString();
    const template = store.dailyLuckyCoupon || {
      title: `${store.name} 今日限定小確幸折 $15`,
      discountDescription: `今日內用或外帶消費滿百現折 NT$ 15（限 ${todayStr} 使用）`,
      originalValue: 90,
      couponCategory: 'bento' as const,
    };

    const mintedCoupon: Coupon = {
      id: `lucky-${store.id}-${Date.now()}`,
      title: template.title,
      storeName: store.name,
      category: template.couponCategory,
      originalValue: template.originalValue,
      discountDescription: template.discountDescription,
      code: `CYUT-DAY-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: `${todayStr}（限今日）`,
      isUsed: false,
      isListedForSale: false,
    };

    saveTodayClaimedStoreCoupon(store.id, mintedCoupon);
    setClaimedCouponsMap((prev) => ({ ...prev, [store.id]: mintedCoupon }));
    wheelAudio.playCelebration();
    onClaimStoreCoupon(mintedCoupon);
  };

  const resolveCrowdTelemetry = (store: MerchantStore) => {
    if (store.cafeteriaId) {
      const linked = cafeteriaList.find((c) => c.id === store.cafeteriaId);
      if (linked) {
        return {
          label:
            linked.level === 'peak' || linked.level === 'high'
              ? '學餐即時人流 · 尖峰較擁擠'
              : linked.level === 'medium'
              ? '學餐即時人流 · 適中好點餐'
              : '學餐即時人流 · 目前順暢',
          detail: `${linked.name} · 座位使用率 ${linked.percentage}%（${linked.updatedAt} 更新）`,
          tone:
            linked.level === 'peak' || linked.level === 'high'
              ? 'text-amber-400'
              : 'text-emerald-400',
        };
      }
    }

    const hour = getTaiwanHour();
    const isPeakLunch = hour >= 11 && hour <= 13;
    const isPeakDinner = hour >= 17 && hour <= 19;
    if (isPeakLunch || isPeakDinner) {
      return {
        label: '門市即時人流 · 用餐尖峰時段',
        detail: '周邊同學較多，建議提前 5 分鐘出發或致電預訂',
        tone: 'text-amber-400',
      };
    }
    return {
      label: '門市即時人流 · 目前順暢免排隊',
      detail: '內用與外帶出餐順暢，平均等待約 5–8 分鐘',
      tone: 'text-emerald-400',
    };
  };

  const winnerClaimedCoupon = winnerStore ? claimedCouponsMap[winnerStore.id] : undefined;
  const winnerCrowd = winnerStore ? resolveCrowdTelemetry(winnerStore) : null;

  return (
    <div className="rounded-3xl bg-[#0B101B] text-white border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Subtle Ambient Accent Glow */}
      <div
        className="pointer-events-none absolute -top-24 right-1/4 w-96 h-48 rounded-full blur-[120px] opacity-20"
        style={{ backgroundColor: 'var(--accent-bright)' }}
      />

      <div className="relative z-10 p-5 sm:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="text-xs font-bold tracking-wide text-amber-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>動態美食盲盒抽籤機</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
              今天吃什麼？交給盲盒滾軸幫你選！
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
              支援全部 {allMerchants.length} 家朝陽美食與自訂篩選範圍抽籤，隨選即看必點菜單與即時人流。
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {hasActiveFilter && filteredMerchants.length > 0 && (
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={() => setPoolScope('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    poolScope === 'all'
                      ? 'bg-accent text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  全部 ({allMerchants.length})
                </button>
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={() => setPoolScope('filtered')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    poolScope === 'filtered'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  篩選中 ({filteredMerchants.length})
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? '開啟抽籤音效' : '靜音抽籤音效'}
              className="min-h-[42px] min-w-[42px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center transition"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Main Split Layout: Slot Drum (5 cols) + Delivery-Grade Landed Card (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Slot Machine Drum & CTA (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="relative p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-[inset_0_0_28px_rgba(0,0,0,0.85)] space-y-2.5 overflow-hidden">
              {/* Top Ghost Reel Slot */}
              {prevReelStore && (
                <div className="px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/50 opacity-40 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-semibold text-slate-300 flex items-center gap-2">
                    <span aria-hidden="true">{prevReelStore.icon || '🍽️'}</span>
                    <span className="truncate">{prevReelStore.name}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {prevReelStore.category}
                  </span>
                </div>
              )}

              {/* Active Center Locked Reel Window */}
              <div
                className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                  !isRolling && winnerStore
                    ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-sky-500/15 border-amber-400 shadow-[0_0_24px_rgba(250,204,21,0.35)]'
                    : isRolling
                    ? 'bg-slate-900 border-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.45)]'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                {currentReelStore ? (
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center text-2xl shrink-0">
                      {currentReelStore.icon || '🍽️'}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-xs font-semibold text-amber-400 flex flex-wrap items-center gap-1.5 leading-snug">
                        <span>{currentReelStore.category}</span>
                        {currentReelStore.walkingTimeLabel && (
                          <>
                            <span aria-hidden="true" className="text-slate-600">
                              ·
                            </span>
                            <span className="text-sky-300">
                              {currentReelStore.walkingTimeLabel}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-base sm:text-lg font-black text-white leading-snug line-clamp-1">
                        {currentReelStore.name}
                      </div>
                      <div className="text-xs font-mono text-emerald-400 tabular-nums">
                        {currentReelStore.priceRange || 'NT$ 65 - 135'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-5 text-center text-xs text-slate-400">
                    尚無符合條件的店家
                  </div>
                )}
              </div>

              {/* Bottom Ghost Reel Slot */}
              {nextReelStore && (
                <div className="px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/50 opacity-40 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-semibold text-slate-300 flex items-center gap-2">
                    <span aria-hidden="true">{nextReelStore.icon || '🍽️'}</span>
                    <span className="truncate">{nextReelStore.name}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {nextReelStore.category}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleStartBlindBoxRoll}
              disabled={isRolling || activePool.length === 0}
              className="w-full min-h-[52px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm sm:text-base shadow-[0_8px_28px_-4px_rgba(245,158,11,0.5)] active:scale-[0.98] transition flex items-center justify-center gap-2.5 disabled:opacity-55"
            >
              <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
              <span>
                {isRolling
                  ? '美食盲盒滾動抽籤中...'
                  : winnerStore
                  ? '再抽一次・換家看看'
                  : '幫我決定下一餐（隨機盲盒）'}
              </span>
            </button>
          </div>

          {/* Right Column (7 cols): UberEats / Foodpanda Editorial Store Spotlight */}
          <div className="lg:col-span-7 flex flex-col">
            <AnimatePresence mode="wait">
              {winnerStore && !isRolling ? (
                <motion.div
                  key={winnerStore.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 p-5 sm:p-7 rounded-2xl bg-slate-900/95 border border-amber-400/45 shadow-xl flex flex-col justify-between gap-5"
                >
                  {/* Top Editorial Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0 mt-0.5">
                          {winnerStore.icon || '🍽️'}
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <div className="text-xs font-bold tracking-wide text-amber-400 flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
                            <span>盲盒鎖定推薦</span>
                            <span className="text-slate-600" aria-hidden="true">
                              ·
                            </span>
                            <span>{winnerStore.category}</span>
                            {winnerStore.walkingTimeLabel && (
                              <>
                                <span className="text-slate-600" aria-hidden="true">
                                  ·
                                </span>
                                <span className="text-sky-400">
                                  {winnerStore.walkingTimeLabel}
                                </span>
                              </>
                            )}
                          </div>

                          <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                            {winnerStore.name}
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-[13px] text-slate-300 leading-relaxed pt-0.5">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span>{winnerStore.address}</span>
                            </span>
                            {winnerStore.priceRange && (
                              <>
                                <span className="text-slate-600" aria-hidden="true">
                                  ·
                                </span>
                                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                                  {winnerStore.priceRange}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectStoreDetail(winnerStore)}
                        className="shrink-0 min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1 transition whitespace-nowrap"
                      >
                        <span>詳細菜單</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Spacious Stacked Information Blocks */}
                    <div className="space-y-3.5">
                      {/* Signature Dishes Block */}
                      <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2.5">
                        <div className="text-xs font-bold tracking-wide text-sky-400 flex items-center gap-2">
                          <Utensils className="w-3.5 h-3.5 shrink-0" />
                          <span>朝陽師生招牌必點推薦</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
                          {(
                            winnerStore.signatureDishes || ['主廚招牌特餐', '每日精選配菜', '人氣飲品']
                          )
                            .slice(0, 3)
                            .map((dish, i) => (
                              <div
                                key={i}
                                className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs sm:text-[13px] leading-relaxed"
                              >
                                <span className="font-mono text-[11px] font-bold text-amber-400 mr-1.5">
                                  0{i + 1}
                                </span>
                                <span className="font-semibold text-slate-100">{dish}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Business Hours & Live Crowd Telemetry Block */}
                      <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3">
                        {winnerStore.businessHours && (
                          <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-200 leading-relaxed">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-slate-400 font-semibold mr-1.5">
                                營業時間
                              </strong>
                              {winnerStore.businessHours}
                            </span>
                          </div>
                        )}
                        {winnerCrowd && (
                          <div className="flex items-start gap-2.5 pt-2.5 border-t border-slate-800/80">
                            <Users className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 leading-relaxed">
                              <div className={`text-xs sm:text-[13px] font-bold ${winnerCrowd.tone}`}>
                                {winnerCrowd.label}
                              </div>
                              <div className="text-xs text-slate-400">{winnerCrowd.detail}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        winnerStore.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition"
                    >
                      <Navigation className="w-4 h-4 shrink-0" />
                      <span>一鍵 Google Maps 導航</span>
                    </a>

                    {winnerClaimedCoupon ? (
                      <button
                        type="button"
                        onClick={() => onShowCouponQr(winnerClaimedCoupon)}
                        className="min-h-[46px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition"
                      >
                        <QrCode className="w-4 h-4 shrink-0" />
                        <span>已領取！出示動態 QR Code</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClaimLuckyCoupon(winnerStore)}
                        className="min-h-[46px] px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-black shadow-accent flex items-center justify-center gap-2 transition"
                      >
                        <Gift className="w-4 h-4 shrink-0" />
                        <span>領取今日小確幸折價券</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 p-6 sm:p-8 rounded-2xl bg-slate-900/75 border border-slate-800 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-2.5 text-base font-black text-white">
                    <Store className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>動態盲盒美食推薦系統</span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                    點擊左側「幫我決定下一餐」，滾軸將從{' '}
                    <strong className="text-white font-mono">{activePool.length} 家</strong>
                    朝陽校園與周邊美食中隨機挑選一間推薦餐廳，抽中後立即展示招牌必點菜色、即時人流狀態與導航按鈕。
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>支援下方搜尋與分類同步篩選抽籤</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>不限店家數量無限擴充</span>
                    </span>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
