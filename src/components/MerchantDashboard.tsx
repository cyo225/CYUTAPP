import React, { useEffect, useState } from 'react';
import {
  Coupon,
  MerchantCouponInventory,
  MerchantPlan,
  MerchantRedemptionRecord,
  MerchantStore,
} from '../types';
import {
  Store,
  Save,
  CheckCircle2,
  ImagePlus,
  ExternalLink,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  QrCode,
  Ticket,
  Plus,
  Power,
  AlertCircle,
  ScanLine,
  History,
  BadgeCheck,
} from 'lucide-react';

export interface VerifyCouponResult {
  ok: boolean;
  message: string;
}

interface MerchantDashboardProps {
  store: MerchantStore;
  coupons: MerchantCouponInventory[];
  issuedCoupons?: Coupon[];
  redemptionLogs: MerchantRedemptionRecord[];
  onUpdateStore: (updated: MerchantStore) => void;
  onVerifyCouponCode: (
    code: string,
    matchedCouponId?: string,
    channel?: 'QR 掃碼核銷' | '券號手動核銷'
  ) => VerifyCouponResult;
  onToggleCouponActive: (couponId: string) => void;
  onAddCoupon: (
    newCoupon: Omit<MerchantCouponInventory, 'id' | 'claimedCount' | 'redeemedToday'>
  ) => void;
  onPreviewMarketplace: () => void;
}

type MerchantTab = 'redemption' | 'coupons' | 'profile';

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  store,
  coupons,
  issuedCoupons = [],
  redemptionLogs,
  onUpdateStore,
  onVerifyCouponCode,
  onToggleCouponActive,
  onAddCoupon,
  onPreviewMarketplace,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<MerchantTab>('redemption');

  // Store profile edit state
  const [name, setName] = useState(store.name);
  const [address, setAddress] = useState(store.address);
  const [phone, setPhone] = useState(store.phone);
  const [website, setWebsite] = useState(store.website || '');
  const [businessHours, setBusinessHours] = useState(store.businessHours || '');
  const [priceRange, setPriceRange] = useState(store.priceRange || '');
  const [walkingTimeLabel, setWalkingTimeLabel] = useState(store.walkingTimeLabel || '');
  const [latestPromo, setLatestPromo] = useState(store.latestPromo || '');
  const [coverImage, setCoverImage] = useState(store.coverImage || '');
  const [menuImage, setMenuImage] = useState(store.menuImage || '');
  const [savedBanner, setSavedBanner] = useState(false);

  // Verification console state
  const [manualCode, setManualCode] = useState('');
  const [verifyFeedback, setVerifyFeedback] = useState<VerifyCouponResult | null>(null);

  // Add coupon inline form state
  const [showAddCouponForm, setShowAddCouponForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDiscountSummary, setNewDiscountSummary] = useState('');
  const [newCodePrefix, setNewCodePrefix] = useState('JF-PROMO');
  const [newQuota, setNewQuota] = useState('100');

  useEffect(() => {
    setName(store.name);
    setAddress(store.address);
    setPhone(store.phone);
    setWebsite(store.website || '');
    setBusinessHours(store.businessHours || '');
    setPriceRange(store.priceRange || '');
    setWalkingTimeLabel(store.walkingTimeLabel || '');
    setLatestPromo(store.latestPromo || '');
    setCoverImage(store.coverImage || '');
    setMenuImage(store.menuImage || '');
  }, [store.id]);

  const storeCoupons = coupons.filter((c) => c.storeId === store.id);
  const storeLogs = redemptionLogs.filter((r) => r.storeId === store.id);

  const todayRedemptionsFromCoupons = storeCoupons.reduce((acc, c) => acc + c.redeemedToday, 0);
  const todayRedemptionsCount = Math.max(todayRedemptionsFromCoupons, storeLogs.length);
  const totalClaimedCount = storeCoupons.reduce((acc, c) => acc + c.claimedCount, 0);
  const activeCouponCount = storeCoupons.filter((c) => c.isActive).length;

  const planMap: Record<MerchantPlan, string> = {
    monthly: '月繳方案 (NT$ 490/月)',
    quarterly: '季繳方案 (NT$ 1,290/季)',
    yearly: '年繳方案 (NT$ 4,500/年)',
  };

  const planShortMap: Record<MerchantPlan, string> = {
    monthly: '月繳曝光中',
    quarterly: '季繳曝光中',
    yearly: '年繳尊榮曝光',
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStore({
      ...store,
      name: name.trim() || store.name,
      address: address.trim() || store.address,
      phone: phone.trim() || store.phone,
      website: website.trim() || undefined,
      businessHours: businessHours.trim() || undefined,
      priceRange: priceRange.trim() || undefined,
      walkingTimeLabel: walkingTimeLabel.trim() || undefined,
      latestPromo: latestPromo.trim() || undefined,
      coverImage: coverImage || undefined,
      menuImage: menuImage || undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const result = onVerifyCouponCode(manualCode.trim().toUpperCase(), undefined, '券號手動核銷');
    setVerifyFeedback(result);
    if (result.ok) {
      setManualCode('');
    }
  };

  const handleSimulateQrScan = (coupon: MerchantCouponInventory) => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const simulatedCode = `${coupon.couponCodePrefix}-${randomDigits}`;
    const result = onVerifyCouponCode(simulatedCode, coupon.id, 'QR 掃碼核銷');
    setVerifyFeedback(result);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDiscountSummary.trim()) return;
    const parsedQuota = Math.max(10, Math.min(2000, Number(newQuota) || 100));
    onAddCoupon({
      storeId: store.id,
      title: newTitle.trim(),
      discountSummary: newDiscountSummary.trim(),
      couponCodePrefix: (newCodePrefix.trim() || 'CYUT-PROMO').toUpperCase(),
      totalQuota: parsedQuota,
      isActive: true,
    });
    setNewTitle('');
    setNewDiscountSummary('');
    setNewCodePrefix('JF-PROMO');
    setNewQuota('100');
    setShowAddCouponForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4 shrink-0" />
            <span>
              合作商家管理後台 · {planMap[store.plan]} · 已啟用上架
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            {store.icon && <span aria-hidden="true">{store.icon}</span>}
            <span>{store.name}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {store.category} · {store.address}
            {store.businessHours ? ` · ${store.businessHours}` : ''}
          </p>
        </div>

        <button
          onClick={onPreviewMarketplace}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl transition whitespace-nowrap"
        >
          <Store className="w-4 h-4 text-accent" />
          <span>前往學生市集檢視曝光效果</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">今日核銷總數</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {todayRedemptionsCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">筆</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">學生已領取張數</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {totalClaimedCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">張</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">進行中優惠券</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-accent font-mono tabular-nums">
              {activeCouponCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              / {storeCoupons.length} 檔
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">合作曝光方案</div>
          <div className="mt-1.5 text-base font-extrabold text-amber-600 dark:text-amber-400">
            {planShortMap[store.plan]}
          </div>
        </div>
      </div>

      {/* Segmented Sub-navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 w-full sm:w-fit">
        <button
          onClick={() => setActiveSubTab('redemption')}
          className={`min-h-[40px] flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeSubTab === 'redemption'
              ? 'bg-accent text-white shadow-accent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>營運核銷與即時紀錄</span>
        </button>

        <button
          onClick={() => setActiveSubTab('coupons')}
          className={`min-h-[40px] flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeSubTab === 'coupons'
              ? 'bg-accent text-white shadow-accent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>優惠券庫存管理 ({storeCoupons.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`min-h-[40px] flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeSubTab === 'profile'
              ? 'bg-accent text-white shadow-accent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>門市資訊與曝光預覽</span>
        </button>
      </div>

      {/* Sub-tab 1: Live Redemption Console & Today's Timeline */}
      {activeSubTab === 'redemption' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Instant Redemption Test Console (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-5">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ScanLine className="w-4 h-4 text-accent" />
                <h3>即時核銷測試台</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                掃描學生出示的優惠券動態 QR Code，或手動輸入券號進行核銷入帳（支援本店前綴與抽獎券號）。
              </p>
            </div>

            {verifyFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                  verifyFeedback.ok
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                }`}
              >
                {verifyFeedback.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{verifyFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleManualVerify} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                輸入學生優惠券序號
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="例如：JF-PORK10-8842 或 CYUT-BOX-1234"
                  className="flex-1 min-h-[44px] px-3.5 py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold whitespace-nowrap transition shadow-accent"
                >
                  立即核銷驗證
                </button>
              </div>
            </form>

            {/* Live Synced Student Wallet Unredeemed Coupons */}
            {issuedCoupons.filter((c) => !c.isUsed).length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    學生錢包待核銷動態票券（即時連動）
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {issuedCoupons.filter((c) => !c.isUsed).length} 張可核銷
                  </span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto netflix-scrollbar pr-0.5">
                  {issuedCoupons
                    .filter((c) => !c.isUsed)
                    .slice(0, 6)
                    .map((uc) => (
                      <div
                        key={uc.id}
                        className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {uc.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                            {uc.code} · {uc.storeName}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const result = onVerifyCouponCode(uc.code, undefined, 'QR 掃碼核銷');
                            setVerifyFeedback(result);
                          }}
                          className="shrink-0 min-h-[34px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>一鍵核銷</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Quick 1-click QR Scan Simulator */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                快速模擬學生 QR 掃碼核銷（本店發行檔期）
              </div>
              {storeCoupons.filter((c) => c.isActive).length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  目前尚無啟用中的優惠券，請至「優惠券庫存管理」新增或啟用。
                </div>
              ) : (
                <div className="space-y-2">
                  {storeCoupons
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSimulateQrScan(c)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-left transition"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {c.title}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            前綴 {c.couponCodePrefix} · 今日已核 {c.redeemedToday} 筆
                          </div>
                        </div>
                        <span className="shrink-0 text-[11px] font-bold text-accent flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5" />
                          <span>模擬掃碼</span>
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Today's Redemption Timeline (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <History className="w-4 h-4 text-accent" />
                <h3>今日核銷即時時間軸</h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                共 {storeLogs.length} 筆紀錄
              </span>
            </div>

            {storeLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                今日尚無核銷紀錄，可使用左側即時核銷測試台進行驗證測試。
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {storeLogs.map((log) => (
                  <div
                    key={log.id}
                    className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <span className="font-mono tabular-nums text-accent">{log.redeemedAt}</span>
                        <span className="text-slate-400">·</span>
                        <span className="truncate">{log.couponTitle}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {log.studentDeptMasked} · {log.channel}
                      </div>
                    </div>

                    <div className="shrink-0 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/70 w-fit">
                      {log.couponCode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Coupon Inventory Management */}
      {activeSubTab === 'coupons' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                本店學生優惠券發放清單
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                即時控管每檔優惠的學生領取配額、核銷數與上下架狀態。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCouponForm((prev) => !prev)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold flex items-center justify-center gap-1.5 shadow-accent transition w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddCouponForm ? '收起新增表單' : '新增學生優惠券'}</span>
            </button>
          </div>

          {showAddCouponForm && (
            <form
              onSubmit={handleCreateCoupon}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                建立新檔期學生優惠券
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    優惠券名稱（必填）
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="例如：期中歐趴雙人套餐折 25 元"
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    券號前綴（英文/數字）
                  </label>
                  <input
                    type="text"
                    required
                    value={newCodePrefix}
                    onChange={(e) => setNewCodePrefix(e.target.value)}
                    placeholder="JF-MIDTERM"
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    使用規則與折扣說明（必填）
                  </label>
                  <input
                    type="text"
                    required
                    value={newDiscountSummary}
                    onChange={(e) => setNewDiscountSummary(e.target.value)}
                    placeholder="例如：結帳出示數位學生證，消費滿 NT$ 150 現折 25 元"
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    總發行張數
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={2000}
                    required
                    value={newQuota}
                    onChange={(e) => setNewQuota(e.target.value)}
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCouponForm(false)}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold shadow-accent"
                >
                  立即發行上架
                </button>
              </div>
            </form>
          )}

          {storeCoupons.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              本店目前尚未建立優惠券檔期，點擊右上角「新增學生優惠券」立即建立。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storeCoupons.map((coupon) => {
                const ratio = Math.min(
                  100,
                  Math.round((coupon.claimedCount / Math.max(1, coupon.totalQuota)) * 100)
                );
                return (
                  <div
                    key={coupon.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition flex flex-col justify-between gap-4 ${
                      coupon.isActive
                        ? 'border-slate-200 dark:border-slate-800'
                        : 'border-slate-200/70 dark:border-slate-800/60 opacity-75'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            前綴 {coupon.couponCodePrefix} · {coupon.isActive ? '發放中' : '已暫停'}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {coupon.title}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleCouponActive(coupon.id)}
                          className={`min-h-[36px] shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition ${
                            coupon.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{coupon.isActive ? '暫停發放' : '恢復啟用'}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {coupon.discountSummary}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          學生領取進度：
                          <strong className="font-mono tabular-nums text-slate-900 dark:text-white ml-1">
                            {coupon.claimedCount} / {coupon.totalQuota}
                          </strong>
                        </span>
                        <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                          今日核銷 {coupon.redeemedToday} 張
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-300"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 3: Store Info Form & Student Live Card Preview */}
      {activeSubTab === 'profile' && (
        <div className="space-y-4">
          {savedBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-700 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>商家資訊與選填項目已更新，學生市集與動態美食推薦清單已同步生效！</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Edit Form (7 cols) */}
            <form
              onSubmit={handleSaveProfile}
              className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                編輯門市資訊與選填刊登項目
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                留空的選填欄位（如菜單圖片、官網、營業時間或最新活動）在學生市集列表中會自動隱藏不佔空間。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    店名（必填）
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    電話（必填）
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  地址（必填，點擊可直接導航 Google Map）
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    營業時間（選填）
                  </label>
                  <input
                    type="text"
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    placeholder="例如：每日 06:30 - 14:00"
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    平均價位區間（選填）
                  </label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="例如：NT$ 45 - 125"
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    距離校門步行時間（選填）
                  </label>
                  <input
                    type="text"
                    value={walkingTimeLabel}
                    onChange={(e) => setWalkingTimeLabel(e.target.value)}
                    placeholder="例如：後門步行 3 分鐘"
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    商家官網（選填）
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  最新活動 / 學生專屬優惠（選填）
                </label>
                <input
                  type="text"
                  value={latestPromo}
                  onChange={(e) => setLatestPromo(e.target.value)}
                  placeholder="例如：憑學生證外帶享 9 折"
                  className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    店面封面照（選填）
                  </label>
                  <label className="min-h-[44px] flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
                    <ImagePlus className="w-4 h-4 text-accent" />
                    <span>上傳更新店面照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setCoverImage)}
                      className="hidden"
                    />
                  </label>
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="text-[11px] text-slate-500 hover:text-rose-500"
                    >
                      清除封面照
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    菜單圖片（選填）
                  </label>
                  <label className="min-h-[44px] flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
                    <ImagePlus className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>上傳更新菜單圖片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setMenuImage)}
                      className="hidden"
                    />
                  </label>
                  {menuImage && (
                    <button
                      type="button"
                      onClick={() => setMenuImage('')}
                      className="text-[11px] text-slate-500 hover:text-rose-500"
                    >
                      清除菜單圖片
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold flex items-center gap-2 shadow-accent transition"
                >
                  <Save className="w-4 h-4" />
                  <span>儲存並同步上架資訊</span>
                </button>
              </div>
            </form>

            {/* Live Student Card Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                學生端市集即時預覽
              </div>
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md dark:shadow-xl">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={name}
                    className="w-full h-44 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-36 bg-slate-100 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-950 flex flex-col items-center justify-center text-slate-500">
                    <Store className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-xs">{name}</span>
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {store.category}
                      {walkingTimeLabel ? ` · ${walkingTimeLabel}` : ''}
                      {priceRange ? ` · ${priceRange}` : ''}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {name}
                    </h4>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                      <span>{address}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{phone}</span>
                    </div>
                    {businessHours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{businessHours}</span>
                      </div>
                    )}
                    {latestPromo && (
                      <div className="flex items-start gap-2 text-amber-600 dark:text-amber-300">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{latestPromo}</span>
                      </div>
                    )}
                    {website && (
                      <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{website}</span>
                      </div>
                    )}
                  </div>

                  {menuImage && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                        菜單預覽
                      </div>
                      <img
                        src={menuImage}
                        alt={`${name} 菜單`}
                        className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
