import React, { useState } from 'react';
import { MerchantPlan, MerchantStore } from '../types';
import { Store, Save, CheckCircle2, ImagePlus, ExternalLink, MapPin, Phone, Clock, Sparkles } from 'lucide-react';

interface MerchantDashboardProps {
  store: MerchantStore;
  onUpdateStore: (updated: MerchantStore) => void;
  onPreviewMarketplace: () => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  store,
  onUpdateStore,
  onPreviewMarketplace,
}) => {
  const [name, setName] = useState(store.name);
  const [address, setAddress] = useState(store.address);
  const [phone, setPhone] = useState(store.phone);
  const [website, setWebsite] = useState(store.website || '');
  const [businessHours, setBusinessHours] = useState(store.businessHours || '');
  const [latestPromo, setLatestPromo] = useState(store.latestPromo || '');
  const [coverImage, setCoverImage] = useState(store.coverImage || '');
  const [menuImage, setMenuImage] = useState(store.menuImage || '');
  const [savedBanner, setSavedBanner] = useState(false);

  const planMap: Record<MerchantPlan, string> = {
    monthly: '月繳方案 (NT$ 490/月)',
    quarterly: '季繳方案 (NT$ 1,290/季)',
    yearly: '年繳方案 (NT$ 4,500/年)',
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStore({
      ...store,
      name: name.trim() || store.name,
      address: address.trim() || store.address,
      phone: phone.trim() || store.phone,
      website: website.trim() || undefined,
      businessHours: businessHours.trim() || undefined,
      latestPromo: latestPromo.trim() || undefined,
      coverImage: coverImage || undefined,
      menuImage: menuImage || undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-emerald-400">
            合作商家管理後台 · {planMap[store.plan]}（已啟用上架）
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">{store.name}</h2>
        </div>

        <button
          onClick={onPreviewMarketplace}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl transition whitespace-nowrap"
        >
          <Store className="w-4 h-4 text-[#E50914]" />
          <span>前往學生市集檢視曝光效果</span>
        </button>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>商家資訊與選填項目已更新，學生市集頁面已同步生效！</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Edit Form (7 cols) */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
        >
          <h3 className="text-base font-bold text-white">編輯門市資訊與選填刊登項目</h3>
          <p className="text-xs text-slate-400">
            留空的選填欄位（如菜單圖片、官網、營業時間或最新活動）在學生市集列表中會自動隱藏不佔空間。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">店名（必填）</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">電話（必填）</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">地址（必填，點擊可直接導航 Google Map）</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">營業時間（選填）</label>
              <input
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                placeholder="例如：週一至週五 10:00 - 20:00"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">商家官網（選填）</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">最新活動 / 學生專屬優惠（選填）</label>
            <input
              type="text"
              value={latestPromo}
              onChange={(e) => setLatestPromo(e.target.value)}
              placeholder="例如：憑學生證外帶享 9 折"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">店面封面照（選填）</label>
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-slate-500 cursor-pointer text-xs text-slate-300">
                <ImagePlus className="w-4 h-4 text-[#E50914]" />
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
                  className="text-[11px] text-slate-500 hover:text-red-400"
                >
                  清除封面照
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">菜單圖片（選填）</label>
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-slate-500 cursor-pointer text-xs text-slate-300">
                <ImagePlus className="w-4 h-4 text-amber-400" />
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
                  className="text-[11px] text-slate-500 hover:text-red-400"
                >
                  清除菜單圖片
                </button>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>儲存並同步上架資訊</span>
            </button>
          </div>
        </form>

        {/* Live Student Card Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400">學生端市集即時預覽</div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            {coverImage ? (
              <img
                src={coverImage}
                alt={name}
                className="w-full h-44 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-36 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center text-slate-500">
                <Store className="w-8 h-8 mb-1 opacity-50" />
                <span className="text-xs">{name}</span>
              </div>
            )}
            <div className="p-5 space-y-3">
              <div>
                <div className="text-xs text-slate-400">{store.category}</div>
                <h4 className="text-base font-bold text-white mt-0.5">{name}</h4>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#E50914] shrink-0 mt-0.5" />
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
                  <div className="flex items-start gap-2 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{latestPromo}</span>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-2 text-sky-400">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{website}</span>
                  </div>
                )}
              </div>

              {menuImage && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1.5">菜單預覽</div>
                  <img
                    src={menuImage}
                    alt={`${name} 菜單`}
                    className="w-full h-24 object-cover rounded-xl border border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
