import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CafeteriaCrowd, Coupon, MerchantStore, StudentProfile } from '../types';
import {
  FoodSlotRandomizer,
  loadTodayClaimedStoreCoupons,
  saveTodayClaimedStoreCoupon,
} from './FoodSlotRandomizer';
import { DynamicQrCode } from './DynamicQrCode';
import { wheelAudio } from '../utils/wheelAudio';
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
  Image as ImageIcon,
  Search,
  Utensils,
  Navigation,
  ChevronDown,
  CheckCircle2,
  Users,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export interface LotteryCouponTemplate {
  title: string;
  storeName: string;
  category: Coupon['category'];
  originalValue: number;
  discountDescription: string;
}

export interface DirectRedeemOffer {
  id: string;
  icon: string;
  pointsCost: number;
  coupon: LotteryCouponTemplate;
}

export type RewardsSubTab = 'merchants' | 'redeem-shop' | 'my-coupons';

interface RewardsMarketHubProps {
  profile: StudentProfile;
  merchants: MerchantStore[];
  cafeteriaList: CafeteriaCrowd[];
  userCoupons: Coupon[];
  initialSubTab?: RewardsSubTab;
  onSubTabChange?: (tab: RewardsSubTab) => void;
  onOpenCheckInModal: () => void;
  onRedeemCoupon: (template: LotteryCouponTemplate, costPoints: number) => Coupon | null;
  onGrantCoupon: (coupon: Coupon) => void;
}

const BATCH_SIZE = 6;

export const DIRECT_REDEEM_OFFERS: DirectRedeemOffer[] = [
  {
    id: 'offer-jifeng-brunch',
    icon: '🥪',
    pointsCost: 800,
    coupon: {
      title: '吉峰手作早午餐 滿 100 折 15 元券',
      storeName: '朝陽後門・吉峰手作早午餐',
      category: 'snack',
      originalValue: 110,
      discountDescription: '點購厚切豬排蛋餅或早午餐拼盤滿百現折 NT$ 15',
    },
  },
  {
    id: 'offer-boding-buffet',
    icon: '🍱',
    pointsCost: 1000,
    coupon: {
      title: '波錠學餐・元氣自助餐 全區 88 折券',
      storeName: '波錠學餐・元氣自助餐',
      category: 'bento',
      originalValue: 90,
      discountDescription: '第一學餐 B1 自助餐結帳享 88 折優惠（單筆最高折抵 NT$ 30）',
    },
  },
  {
    id: 'offer-morning-tea',
    icon: '🧋',
    pointsCost: 1200,
    coupon: {
      title: '晨曦手作黑糖波霸 免費飲品兌換券',
      storeName: '晨曦手作黑糖波霸專賣',
      category: 'beverage',
      originalValue: 65,
      discountDescription: '可免費兌換 NT$ 65 元以內任選特調飲品乙杯',
    },
  },
  {
    id: 'offer-wave-coffee',
    icon: '☕',
    pointsCost: 1500,
    coupon: {
      title: '晨光精品拿鐵 買一送一券',
      storeName: '波浪廣場 · 晨光精品咖啡',
      category: 'coffee',
      originalValue: 110,
      discountDescription: '大杯經典美式或海鹽焦糖拿鐵同品項買一送一',
    },
  },
  {
    id: 'offer-green-bento',
    icon: '🥗',
    pointsCost: 1400,
    coupon: {
      title: '綠漾健康舒肥餐盒 現折 $30 券',
      storeName: '綠漾健康舒肥輕食餐盒',
      category: 'bento',
      originalValue: 130,
      discountDescription: '任選舒肥餐盒立折 NT$ 30 並免費附贈冷泡茶乙瓶',
    },
  },
  {
    id: 'offer-dapu-teppan',
    icon: '🥩',
    pointsCost: 1600,
    coupon: {
      title: '大埔鐵板燒 主餐折 $25 ＋ 荷包蛋券',
      storeName: '大埔鐵板燒（霧峰吉峰店）',
      category: 'bento',
      originalValue: 150,
      discountDescription: '單點主餐現折 NT$ 25 並附贈鐵板半熟蛋乙顆',
    },
  },
  {
    id: 'offer-beefnoodle',
    icon: '🍜',
    pointsCost: 900,
    coupon: {
      title: '老字號紅燒牛肉麵 免費加麵 ＋ 小菜券',
      storeName: '吉峰東路・老字號紅燒牛肉麵',
      category: 'snack',
      originalValue: 95,
      discountDescription: '任選牛肉麵或乾拌麵免費升級大碗並加贈時令燙青菜',
    },
  },
  {
    id: 'offer-universal-50',
    icon: '🎟️',
    pointsCost: 2000,
    coupon: {
      title: '朝陽特約商家通用 NT$ 50 現金折價券',
      storeName: '朝陽特約合作商家通用券',
      category: 'bento',
      originalValue: 50,
      discountDescription: '於任一朝陽特約餐飲合作商家消費滿 NT$ 120 即折抵 NT$ 50',
    },
  },
];

export const RewardsMarketHub: React.FC<RewardsMarketHubProps> = ({
  profile,
  merchants,
  cafeteriaList,
  userCoupons,
  initialSubTab = 'merchants',
  onSubTabChange,
  onOpenCheckInModal,
  onRedeemCoupon,
  onGrantCoupon,
}) => {
  const [activeTab, setActiveTab] = useState<RewardsSubTab>(initialSubTab);
  const [redeemFeedback, setRedeemFeedback] = useState<{
    coupon?: Coupon;
    error?: string;
  } | null>(null);

  // Dynamic Search, Category Filter & Batched Loading state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);

  // Store Detail & Menu Modal
  const [selectedStoreModal, setSelectedStoreModal] = useState<MerchantStore | null>(null);
  const [claimedCouponsMap, setClaimedCouponsMap] = useState<Record<string, Coupon>>(() =>
    loadTodayClaimedStoreCoupons()
  );

  // Lightbox for Merchant Menu Image
  const [menuPreviewModal, setMenuPreviewModal] = useState<{ title: string; image: string } | null>(
    null
  );

  // Active coupon QR modal
  const [activeQrCoupon, setActiveQrCoupon] = useState<Coupon | null>(null);

  const redeemSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  const switchTab = (nextTab: RewardsSubTab) => {
    setActiveTab(nextTab);
    onSubTabChange?.(nextTab);
  };

  const handleOpenRedeemMall = () => {
    switchTab('redeem-shop');
    window.setTimeout(() => {
      redeemSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const checkedInToday = profile.lastCheckInDate === todayStr;

  const paidMerchants = useMemo(() => merchants.filter((m) => m.paid), [merchants]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of paidMerchants) {
      counts.set(m.category, (counts.get(m.category) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [paidMerchants]);

  const filteredMerchants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return paidMerchants.filter((m) => {
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (!q) return true;
      const haystack = [
        m.name,
        m.category,
        m.address,
        m.latestPromo || '',
        m.priceRange || '',
        ...(m.signatureDishes || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [paidMerchants, selectedCategory, searchQuery]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedCategory, searchQuery]);

  const visibleMerchants = filteredMerchants.slice(0, visibleCount);
  const remainingCount = Math.max(0, filteredMerchants.length - visibleMerchants.length);
  const hasActiveFilter = selectedCategory !== 'all' || searchQuery.trim().length > 0;

  const handleDirectRedeem = (offer: DirectRedeemOffer) => {
    if (profile.points < offer.pointsCost) {
      setRedeemFeedback({
        error: `點數不足！兌換「${offer.coupon.title}」需要 ${offer.pointsCost.toLocaleString()} 點（目前僅有 ${profile.points.toLocaleString()} 點）。`,
      });
      return;
    }

    const minted = onRedeemCoupon(offer.coupon, offer.pointsCost);
    if (minted) {
      wheelAudio.playCelebration();
      setRedeemFeedback({ coupon: minted });
    }
  };

  const handleClaimFromStoreModal = (store: MerchantStore) => {
    if (claimedCouponsMap[store.id]) return;
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
    onGrantCoupon(mintedCoupon);
  };

  const unusedCouponsCount = userCoupons.filter((c) => !c.isUsed).length;

  return (
    <div className="space-y-6">
      {/* 1. Clean & Intuitive Points Wallet + Direct Coupon Exchange Showcase */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl p-5 sm:p-6 space-y-5">
        {/* Top Clean 2-Metric Strip + Concise Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          {/* Two Clean Core Data Blocks */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4">
            <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 min-w-[155px]">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                目前可用點數 (PTS)
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums mt-0.5 leading-tight">
                {profile.points.toLocaleString()}
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 min-w-[155px]">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                可用票券庫存 (張數)
              </div>
              <div className="text-xl sm:text-2xl font-black text-accent font-mono tabular-nums mt-0.5 leading-tight">
                {unusedCouponsCount}{' '}
                <span className="text-xs font-sans font-semibold text-slate-500 dark:text-slate-400">
                  / {userCoupons.length} 張
                </span>
              </div>
            </div>
          </div>

          {/* Concise Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCheckInModal}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                checkedInToday
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  checkedInToday ? 'text-amber-500 dark:text-amber-400' : 'text-white'
                }`}
              />
              <span>{checkedInToday ? `已簽到 ${profile.streakDays} 天` : '每日簽到'}</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('my-coupons')}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-accent flex items-center gap-1.5 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>前往我的票券 QR Code</span>
            </button>

            <button
              type="button"
              onClick={handleOpenRedeemMall}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ShoppingBag className="w-4 h-4 text-accent" />
              <span>瀏覽更多特約優惠</span>
            </button>
          </div>
        </div>

        {/* Direct Coupon Purchase / Redeem Mall Showcase List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-accent" />
              <span>優惠券直購 / 點數兌換商城</span>
            </h2>
            <button
              type="button"
              onClick={handleOpenRedeemMall}
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1 shrink-0"
            >
              <span>查看全部 {DIRECT_REDEEM_COUPONS_COUNT} 款餐券</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {redeemFeedback?.error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{redeemFeedback.error}</span>
            </div>
          )}

          {redeemFeedback?.coupon && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  已兌換入庫：<strong>{redeemFeedback.coupon.title}</strong>（券號{' '}
                  <span className="font-mono font-bold">{redeemFeedback.coupon.code}</span>）
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveQrCoupon(redeemFeedback.coupon!)}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shrink-0 w-fit transition"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>立即出示 QR Code</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {DIRECT_REDEEM_OFFERS.slice(0, 4).map((offer) => (
              <div
                key={offer.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-accent transition flex flex-col justify-between gap-3.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 truncate font-medium">
                      <span className="mr-1.5" aria-hidden="true">
                        {offer.icon}
                      </span>
                      {offer.coupon.storeName}
                    </span>
                    <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
                      {offer.pointsCost.toLocaleString()} 點
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    {offer.coupon.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {offer.coupon.discountDescription}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDirectRedeem(offer)}
                  className="w-full min-h-[40px] px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-accent active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>消耗 {offer.pointsCost.toLocaleString()} 點兌換</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marketplace Core Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto netflix-scrollbar border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => switchTab('merchants')}
          className={`min-h-[44px] flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap shrink-0 transition ${
            activeTab === 'merchants'
              ? 'bg-accent text-white shadow-accent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>今天吃什麼 & 美食搜尋 ({paidMerchants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('redeem-shop')}
          className={`min-h-[44px] flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap shrink-0 transition ${
            activeTab === 'redeem-shop'
              ? 'bg-accent text-white shadow-accent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>優惠券兌換商城 ({DIRECT_REDEEM_OFFERS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('my-coupons')}
          className={`min-h-[44px] flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap shrink-0 transition ${
            activeTab === 'my-coupons'
              ? 'bg-accent text-white shadow-accent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>我的票券 ({userCoupons.length})</span>
        </button>
      </div>

      {/* TAB 1: Dynamic Food Slot Randomizer + Searchable & Filterable Infinite Merchant Stream */}
      {activeTab === 'merchants' && (
        <div className="space-y-6">
          {/* Dynamic Blind-Box / Slot Machine Randomizer */}
          <FoodSlotRandomizer
            allMerchants={paidMerchants}
            filteredMerchants={filteredMerchants}
            hasActiveFilter={hasActiveFilter}
            cafeteriaList={cafeteriaList}
            onClaimStoreCoupon={onGrantCoupon}
            onShowCouponQr={(coupon) => setActiveQrCoupon(coupon)}
            onSelectStoreDetail={(store) => setSelectedStoreModal(store)}
          />

          {/* Search & Category Filter Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  朝陽周邊與校內美食動態目錄
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  支援關鍵字搜尋、分類過濾與動態載入，點擊任一店家可檢視推薦菜單與 Google Maps 一鍵導航。
                </p>
              </div>

              {/* Keyword Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋店名、蛋餅、牛肉麵、手搖飲..."
                  className="w-full min-h-[42px] pl-10 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="清除搜尋關鍵字"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto netflix-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition border ${
                  selectedCategory === 'all'
                    ? 'bg-accent text-white border-transparent shadow-accent'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-accent'
                }`}
              >
                全部美食 ({paidMerchants.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition border ${
                    selectedCategory === cat.name
                      ? 'bg-accent text-white border-transparent shadow-accent'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-accent'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Merchant Cards Stream */}
          {filteredMerchants.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Store className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                找不到符合「{searchQuery || selectedCategory}」的美食店家
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold"
              >
                重設篩選條件顯示全部店家
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleMerchants.map((merchant) => {
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    merchant.address
                  )}`;
                  const isClaimedToday = Boolean(claimedCouponsMap[merchant.id]);

                  return (
                    <div
                      key={merchant.id}
                      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl flex flex-col justify-between hover:border-accent transition"
                    >
                      <div>
                        {/* Cover Photo or Clean Typographic Header */}
                        {merchant.coverImage ? (
                          <button
                            type="button"
                            onClick={() => setSelectedStoreModal(merchant)}
                            className="relative h-44 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden block text-left"
                          >
                            <img
                              src={merchant.coverImage}
                              alt={merchant.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedStoreModal(merchant)}
                            className="h-28 w-full bg-slate-100 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-950 flex items-center justify-center gap-3 px-4 text-slate-600 dark:text-slate-300 hover:opacity-90 transition"
                          >
                            <span className="text-3xl" aria-hidden="true">
                              {merchant.icon || '🍽️'}
                            </span>
                            <div className="text-left min-w-0">
                              <div className="text-xs font-bold text-accent">
                                {merchant.category}
                              </div>
                              <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                                {merchant.name}
                              </div>
                            </div>
                          </button>
                        )}

                        <div className="p-5 space-y-3">
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                              <span>{merchant.category}</span>
                              {merchant.walkingTimeLabel && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-accent font-semibold">
                                    {merchant.walkingTimeLabel}
                                  </span>
                                </>
                              )}
                              {merchant.priceRange && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                    {merchant.priceRange}
                                  </span>
                                </>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedStoreModal(merchant)}
                              className="text-left mt-0.5 group"
                            >
                              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-accent transition flex items-center gap-1.5 leading-snug">
                                {merchant.icon && <span aria-hidden="true">{merchant.icon}</span>}
                                <span>{merchant.name}</span>
                              </h3>
                            </button>
                          </div>

                          {/* Signature Dishes Preview */}
                          {merchant.signatureDishes && merchant.signatureDishes.length > 0 && (
                            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                              <Utensils className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">
                                必點：{merchant.signatureDishes.join(' · ')}
                              </span>
                            </div>
                          )}

                          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 text-slate-700 dark:text-slate-200 hover:text-accent transition"
                            >
                              <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              <span className="underline decoration-slate-300 dark:decoration-slate-700">
                                {merchant.address}
                              </span>
                            </a>

                            <a
                              href={`tel:${merchant.phone}`}
                              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{merchant.phone}</span>
                            </a>

                            {merchant.businessHours && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{merchant.businessHours}</span>
                              </div>
                            )}

                            {merchant.latestPromo && (
                              <div className="flex items-start gap-2 text-amber-600 dark:text-amber-300 pt-1">
                                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{merchant.latestPromo}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 pb-5 pt-2 flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStoreModal(merchant)}
                          className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-accent transition"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                          <span>
                            {isClaimedToday ? '查看菜單 · 已領券' : '查看菜單 & 領今日優惠'}
                          </span>
                        </button>

                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0"
                          title="開啟 Google Map 導航"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                          <span>導航</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Batch Load More Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  已載入 {visibleMerchants.length} / {filteredMerchants.length} 間美食商家
                </span>
                {remainingCount > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + BATCH_SIZE)}
                      className="min-h-[42px] px-5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 transition shadow-sm"
                    >
                      <ChevronDown className="w-4 h-4 text-accent" />
                      <span>動態載入更多店家（尚餘 {remainingCount} 間）</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredMerchants.length)}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                    >
                      展開全部
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Full Direct Coupon Redeem & Purchase Mall */}
      {activeTab === 'redeem-shop' && (
        <div ref={redeemSectionRef} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                朝陽特約餐券直購商城
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                直接使用目前可用點數兌換心儀合作商家餐券，兌換後立即入庫並產生動態核銷 QR Code。
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              目前點數：{profile.points.toLocaleString()} PTS
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIRECT_REDEEM_OFFERS.map((offer) => {
              const canAfford = profile.points >= offer.pointsCost;
              return (
                <div
                  key={offer.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-accent transition flex flex-col justify-between gap-4 shadow-sm dark:shadow-none"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">
                        <span className="mr-1.5" aria-hidden="true">
                          {offer.icon}
                        </span>
                        {offer.coupon.storeName}
                      </span>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
                        {offer.pointsCost.toLocaleString()} 點
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {offer.coupon.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {offer.coupon.discountDescription}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      <span>票券價值 NT$ {offer.coupon.originalValue}</span>
                      <span>即時入庫</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDirectRedeem(offer)}
                      disabled={!canAfford}
                      className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-45 text-white text-xs font-bold shadow-accent active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>
                        {canAfford
                          ? `消耗 ${offer.pointsCost.toLocaleString()} 點兌換`
                          : '點數不足'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: My Coupons Wallet */}
      {activeTab === 'my-coupons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              點擊「出示動態 QR Code」即可於朝陽特約餐飲核銷，亦可複製券號於商家後台測試即時核銷連動。
            </span>
            <button
              type="button"
              onClick={handleOpenRedeemMall}
              className="text-accent font-bold hover:underline shrink-0 text-left"
            >
              + 前往優惠券商城兌換更多餐券
            </button>
          </div>

          {userCoupons.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs space-y-3">
              <div>目前尚未擁有任何優惠券</div>
              <button
                type="button"
                onClick={handleOpenRedeemMall}
                className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold"
              >
                前往優惠券兌換商城
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCoupons.map((cp) => (
                <div
                  key={cp.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border flex flex-col justify-between transition shadow-sm dark:shadow-none ${
                    cp.isUsed
                      ? 'border-slate-200/70 dark:border-slate-800/60 opacity-65'
                      : 'border-slate-200 dark:border-slate-800 hover:border-accent'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {cp.storeName}
                      </span>
                      <span
                        className={`font-mono font-bold shrink-0 tabular-nums ${
                          cp.isUsed
                            ? 'text-slate-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {cp.isUsed ? '已核銷' : `價值 NT$ ${cp.originalValue}`}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                      {cp.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {cp.discountDescription}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
                      <span>{cp.code}</span>
                      <span>效期至 {cp.expiryDate}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveQrCoupon(cp)}
                      className={`w-full min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                        cp.isUsed
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          : 'bg-accent hover:bg-accent-hover text-white shadow-accent'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{cp.isUsed ? '檢視已核銷紀錄' : '出示動態 QR Code'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Store Detail & Full Menu Inspection Modal */}
      {selectedStoreModal && (
        <div
          onClick={() => setSelectedStoreModal(null)}
          className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/75 dark:bg-black/85 backdrop-blur-md p-3 sm:p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl netflix-scrollbar"
          >
            {/* Cover / Header */}
            <div className="relative">
              {selectedStoreModal.coverImage ? (
                <img
                  src={selectedStoreModal.coverImage}
                  alt={selectedStoreModal.name}
                  className="w-full h-48 sm:h-56 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center gap-3 text-white">
                  <span className="text-4xl" aria-hidden="true">
                    {selectedStoreModal.icon || '🍽️'}
                  </span>
                  <div className="text-lg font-black">{selectedStoreModal.name}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedStoreModal(null)}
                aria-label="關閉店家詳情"
                className="absolute top-3 right-3 min-h-[40px] min-w-[40px] rounded-xl bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-sm transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-accent">{selectedStoreModal.category}</span>
                  {selectedStoreModal.walkingTimeLabel && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{selectedStoreModal.walkingTimeLabel}</span>
                    </>
                  )}
                  {selectedStoreModal.priceRange && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {selectedStoreModal.priceRange}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  {selectedStoreModal.icon && (
                    <span aria-hidden="true">{selectedStoreModal.icon}</span>
                  )}
                  <span>{selectedStoreModal.name}</span>
                </h3>
              </div>

              {/* Signature Dishes & Menu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-amber-500" />
                    <span>推薦必點與招牌菜單</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {(
                      selectedStoreModal.signatureDishes || [
                        '店內主廚招牌餐點',
                        '朝陽學生人氣組合',
                      ]
                    ).map((dish, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-accent">
                          0{i + 1}.
                        </span>
                        <span className="font-semibold">{dish}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>門市營業與聯絡資訊</span>
                  </div>
                  <div>{selectedStoreModal.businessHours || '每日營業（詳洽門市）'}</div>
                  <a
                    href={`tel:${selectedStoreModal.phone}`}
                    className="block font-mono text-accent hover:underline"
                  >
                    電話：{selectedStoreModal.phone}
                  </a>
                  <div className="text-slate-500 dark:text-slate-400">
                    地址：{selectedStoreModal.address}
                  </div>
                  {selectedStoreModal.cafeteriaId && (() => {
                    const linked = cafeteriaList.find(
                      (c) => c.id === selectedStoreModal.cafeteriaId
                    );
                    if (!linked) return null;
                    return (
                      <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {linked.name} 目前座位使用率 {linked.percentage}%
                        </span>
                      </div>
                    );
                  })()}
                  {selectedStoreModal.website && (
                    <a
                      href={selectedStoreModal.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>前往官方網站</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Menu Image if available */}
              {selectedStoreModal.menuImage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span>店家完整菜單圖片</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setMenuPreviewModal({
                          title: `${selectedStoreModal.name} · 菜單`,
                          image: selectedStoreModal.menuImage!,
                        })
                      }
                      className="text-accent hover:underline"
                    >
                      點擊全螢幕放大
                    </button>
                  </div>
                  <img
                    src={selectedStoreModal.menuImage}
                    alt={`${selectedStoreModal.name} 菜單`}
                    onClick={() =>
                      setMenuPreviewModal({
                        title: `${selectedStoreModal.name} · 菜單`,
                        image: selectedStoreModal.menuImage!,
                      })
                    }
                    className="w-full h-44 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-95 transition"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Bottom Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selectedStoreModal.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition"
                >
                  <Navigation className="w-4 h-4" />
                  <span>一鍵 Google Maps 導航</span>
                </a>

                {claimedCouponsMap[selectedStoreModal.id] ? (
                  <button
                    type="button"
                    onClick={() => {
                      const cp = claimedCouponsMap[selectedStoreModal.id];
                      setSelectedStoreModal(null);
                      setActiveQrCoupon(cp);
                    }}
                    className="min-h-[46px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>已領取！出示動態 QR Code</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleClaimFromStoreModal(selectedStoreModal)}
                    className="min-h-[46px] px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-black shadow-accent flex items-center justify-center gap-2 transition"
                  >
                    <Gift className="w-4 h-4" />
                    <span>領取該店今日小確幸折價券</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Image Zoom Modal */}
      {menuPreviewModal && (
        <div
          onClick={() => setMenuPreviewModal(null)}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/75 dark:bg-black/85 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {menuPreviewModal.title}
              </h4>
              <button
                type="button"
                onClick={() => setMenuPreviewModal(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={menuPreviewModal.image}
              alt={menuPreviewModal.title}
              className="w-full max-h-[75vh] object-contain rounded-xl bg-slate-100 dark:bg-slate-950"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Dynamic QR Code Presentation Modal */}
      {activeQrCoupon && (
        <div
          onClick={() => setActiveQrCoupon(null)}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/65 dark:bg-black/80 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center shadow-2xl space-y-4"
          >
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {activeQrCoupon.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeQrCoupon.storeName}
              </p>
            </div>

            <DynamicQrCode code={activeQrCoupon.code} isUsed={activeQrCoupon.isUsed} />

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activeQrCoupon.isUsed
                ? '此優惠券已完成核銷使用，感謝您支持朝陽特約商家'
                : '結帳時請出示此動態 QR Code 供店家掃描，或提供上方券號給店員手動核銷'}
            </p>

            <button
              type="button"
              onClick={() => setActiveQrCoupon(null)}
              className="w-full min-h-[42px] py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              關閉動態條碼
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DIRECT_REDEEM_COUPONS_COUNT = DIRECT_REDEEM_OFFERS.length;
