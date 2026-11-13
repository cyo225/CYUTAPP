import React, { useState, useEffect } from 'react';
import { BusRouteInfo, ShuttleSchedule, TransferGuide } from '../types';
import {
  ArrowLeft,
  Bus,
  RefreshCw,
  Search,
  Star,
  MapPin,
  Clock,
  Users,
  Train,
  X,
  Navigation,
} from 'lucide-react';

interface PublicTransitHubProps {
  busRoutes: BusRouteInfo[];
  shuttleSchedules: ShuttleSchedule[];
  transferGuides: TransferGuide[];
  onBackHome: () => void;
}

type TransitFilter =
  | 'all'
  | 'favorites'
  | '校門口'
  | '宿舍區'
  | 'to_city'
  | 'to_campus';

export const PublicTransitHub: React.FC<PublicTransitHubProps> = ({
  busRoutes,
  shuttleSchedules,
  transferGuides,
  onBackHome,
}) => {
  const [routes, setRoutes] = useState<BusRouteInfo[]>(busRoutes);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TransitFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Date().toLocaleTimeString('zh-TW', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  );

  // Favorites persisted in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cyut_favorite_buses');
      return saved ? JSON.parse(saved) : ['bus-131-city', 'bus-151a-city'];
    } catch {
      return ['bus-131-city', 'bus-151a-city'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cyut_favorite_buses', JSON.stringify(favoriteIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [favoriteIds]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRoutes((prev) =>
        prev.map((bus) => {
          if (bus.status === 'unscheduled') return bus;
          const delta = Math.random() > 0.55 ? -1 : 1;
          const nextMin = Math.max(1, Math.min(25, bus.nextBusMinutes + delta));
          const nextStatus: BusRouteInfo['status'] =
            nextMin <= 2 ? 'arriving' : nextMin <= 8 ? 'approaching' : 'scheduled';
          return {
            ...bus,
            nextBusMinutes: nextMin,
            status: nextStatus,
          };
        })
      );
      setLastUpdated(
        new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setIsRefreshing(false);
    }, 500);
  };

  const filteredRoutes = routes.filter((bus) => {
    if (activeFilter === 'favorites' && !favoriteIds.includes(bus.id)) return false;
    if (activeFilter === '校門口' && bus.areaTag !== '校門口') return false;
    if (activeFilter === '宿舍區' && bus.areaTag !== '宿舍區') return false;
    if (activeFilter === 'to_city' && bus.direction !== 'to_city') return false;
    if (activeFilter === 'to_campus' && bus.direction !== 'to_campus') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      bus.route.toLowerCase().includes(q) ||
      bus.destination.toLowerCase().includes(q) ||
      bus.stopName.toLowerCase().includes(q) ||
      bus.directionLabel.toLowerCase().includes(q)
    );
  });

  const filterTabs: { id: TransitFilter; label: string }[] = [
    { id: 'all', label: `全部路線 (${routes.length})` },
    { id: 'favorites', label: `常用收藏 (${favoriteIds.length})` },
    { id: '校門口', label: '校門口站' },
    { id: '宿舍區', label: '宿舍區站' },
    { id: 'to_city', label: '往市區 / 高鐵' },
    { id: 'to_campus', label: '往朝陽科大' },
  ];

  const getCrowdingInfo = (level: BusRouteInfo['crowding']) => {
    if (level === 'high') {
      return { label: '較為擁擠', colorClass: 'text-red-400' };
    }
    if (level === 'medium') {
      return { label: '人潮適中', colorClass: 'text-amber-400' };
    }
    return { label: '舒適有座', colorClass: 'text-emerald-400' };
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Return Home + Title + Live Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            type="button"
            onClick={onBackHome}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#E50914]" />
            <span>返回主畫面</span>
          </button>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Bus className="w-5 h-5 text-[#E50914] shrink-0" />
              <span>大眾運輸交通工具系統</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              朝陽科大校門口與宿舍區公車即時倒數 · 校內接駁與雙鐵轉乘指南
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">最後更新時間</div>
            <div className="text-xs font-mono tabular-nums font-bold text-emerald-400">
              {lastUpdated}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E50914] hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-red-950/50 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? '更新中...' : '刷新動態'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋公車路線（例如 131、132、151 副線、158）、目的地或站牌..."
            className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#E50914] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="清除搜尋"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto netflix-scrollbar pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                activeFilter === tab.id
                  ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Split: Live Bus Cards (8 cols) + Shuttles & Transfers (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Bus Countdown Cards */}
        <div className="lg:col-span-8 space-y-4">
          {filteredRoutes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-3">
              <Bus className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-white">找不到符合條件的公車路線</div>
              <p className="text-xs text-slate-400">
                {activeFilter === 'favorites'
                  ? '您尚未收藏任何常用路線，點擊路線卡片右上角星號即可加入收藏。'
                  : '請嘗試調整搜尋關鍵字或切換站牌篩選條件。'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                顯示全部路線
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoutes.map((bus) => {
                const isFav = favoriteIds.includes(bus.id);
                const isArriving = bus.status === 'arriving' || (bus.nextBusMinutes >= 0 && bus.nextBusMinutes <= 2);
                const isUnscheduled = bus.status === 'unscheduled' || bus.nextBusMinutes < 0;
                const crowding = getCrowdingInfo(bus.crowding);

                return (
                  <div
                    key={bus.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isArriving
                        ? 'bg-gradient-to-br from-red-950/35 to-slate-900 border-red-800/80 shadow-lg shadow-red-950/20'
                        : 'bg-slate-900/95 border-slate-800 hover:border-slate-700 shadow-lg'
                    }`}
                  >
                    <div>
                      {/* Top Header: Route + Direction + Favorite Star */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-2xl font-black text-white font-mono tabular-nums tracking-tight">
                              {bus.route}
                            </span>
                            <span className="text-xs font-bold text-[#E50914] flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              <span>{bus.directionLabel}</span>
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{bus.stopName}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(bus.id)}
                          aria-label={isFav ? `取消收藏 ${bus.route}` : `收藏 ${bus.route}`}
                          className={`min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl transition ${
                            isFav
                              ? 'text-amber-400 hover:bg-amber-950/40'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/70'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      {/* Destination */}
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                        {bus.destination}
                      </p>
                    </div>

                    {/* ETA Countdown & Metadata Row */}
                    <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isArriving ? (
                            <span className="inline-flex items-center gap-2 text-base font-black text-[#E50914]">
                              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
                              <span>即將進站</span>
                              <span className="text-xs font-mono tabular-nums text-red-300 font-semibold">
                                ({bus.nextBusMinutes} 分)
                              </span>
                            </span>
                          ) : isUnscheduled ? (
                            <span className="text-sm font-bold text-slate-400">
                              未發車
                              {bus.nextDepartureTime ? (
                                <span className="ml-2 text-xs font-mono tabular-nums text-slate-300">
                                  · 預計 {bus.nextDepartureTime}
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            <span className="text-base font-black text-emerald-400 font-mono tabular-nums">
                              約 {bus.nextBusMinutes} 分
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-mono text-slate-300 tabular-nums">
                          {bus.plateNumber ? `車牌 ${bus.plateNumber}` : '待派車'}
                        </span>
                      </div>

                      {/* Unboxed Metadata Separators */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span className={`inline-flex items-center gap-1 font-semibold ${crowding.colorClass}`}>
                          <Users className="w-3.5 h-3.5" />
                          <span>{crowding.label}</span>
                        </span>
                        <span className="font-mono tabular-nums text-slate-500">
                          {bus.operatingHours}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Campus Shuttle & HSR/TRA Transfer Timetable Quick Cards */}
        <div className="lg:col-span-4 space-y-5">
          {/* Campus Shuttle Card */}
          <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E50914]" />
                <span>朝陽校內接駁車時刻</span>
              </h3>
              <span className="text-[11px] text-slate-400">持證免費</span>
            </div>

            <div className="space-y-4 divide-y divide-slate-800/80">
              {shuttleSchedules.map((shuttle, index) => (
                <div key={shuttle.id} className={index > 0 ? 'pt-4' : ''}>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{shuttle.name}</h4>
                    <span className="text-[11px] font-mono tabular-nums text-amber-400 font-semibold">
                      {shuttle.firstBus} - {shuttle.lastBus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {shuttle.routeSummary}
                  </p>
                  <div className="mt-2 space-y-1 text-[11px] text-slate-300">
                    <div>候車處：{shuttle.boardingStop}</div>
                    <div className="text-slate-400">尖峰班距：{shuttle.peakInterval}</div>
                    <div className="text-slate-400">離峰班距：{shuttle.offPeakInterval}</div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">{shuttle.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* HSR & TRA Transfer Guide Card */}
          <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Train className="w-4 h-4 text-[#E50914]" />
                <span>高鐵 / 台鐵轉乘快捷指南</span>
              </h3>
              <span className="text-[11px] text-slate-400">雙鐵接駁</span>
            </div>

            <div className="space-y-4 divide-y divide-slate-800/80">
              {transferGuides.map((guide, index) => (
                <div key={guide.id} className={index > 0 ? 'pt-4' : ''}>
                  <h4 className="text-xs font-bold text-white">{guide.hubName}</h4>
                  <div className="mt-1.5 text-xs text-amber-400 font-semibold">
                    推薦搭乘：{guide.recommendedRoutes.join(' · ')}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-300 font-mono tabular-nums">
                    <span>車程 {guide.estimatedTime}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{guide.firstLastInfo}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {guide.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
