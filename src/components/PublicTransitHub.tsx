import React, { useState, useEffect, useCallback } from 'react';
import type { BusRouteInfo, ShuttleSchedule, TransferGuide } from '../types';
import {
  evaluateCyutTransit,
  getTaiwanClock,
  type TransitApiResponse,
} from '../utils/transitEngine';
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
  Radio,
  Moon,
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

const REFRESH_INTERVAL_SEC = 15;

export const PublicTransitHub: React.FC<PublicTransitHubProps> = ({
  shuttleSchedules,
  transferGuides,
  onBackHome,
}) => {
  // Always initialize from real-time Taiwan clock schedule (never stale hardcoded ETAs)
  const [transitSnapshot, setTransitSnapshot] = useState<TransitApiResponse>(() =>
    evaluateCyutTransit(new Date())
  );
  const [taiwanTimeNow, setTaiwanTimeNow] = useState<string>(() =>
    getTaiwanClock(new Date()).formattedTime
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TransitFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(REFRESH_INTERVAL_SEC);

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

  const syncTransitData = useCallback(async () => {
    try {
      const res = await fetch('/api/transit/cyut', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as TransitApiResponse;
        setTransitSnapshot(data);
        return;
      }
    } catch {
      // Offline / PWA fallback to local Taiwan real-time schedule engine
    }
    setTransitSnapshot(evaluateCyutTransit(new Date()));
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await syncTransitData();
    setRefreshCountdown(REFRESH_INTERVAL_SEC);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 300);
  }, [syncTransitData]);

  // Initial fetch from /api/transit/cyut
  useEffect(() => {
    void syncTransitData();
  }, [syncTransitData]);

  // 1-second real-time Taiwan clock tick + 15-second auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTaiwanTimeNow(getTaiwanClock(new Date()).formattedTime);
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          void syncTransitData();
          return REFRESH_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncTransitData]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const routes = transitSnapshot.routes;

  const filteredRoutes = routes.filter((bus) => {
    if (activeFilter === 'favorites' && !favoriteIds.includes(bus.id)) return false;
    if (
      activeFilter === '校門口' &&
      bus.areaTag !== '校門口' &&
      !bus.stopName.includes('校門口') &&
      bus.stopName !== '朝陽科技大學'
    )
      return false;
    if (
      activeFilter === '宿舍區' &&
      bus.areaTag !== '宿舍區' &&
      !bus.stopName.includes('宿舍區')
    )
      return false;
    if (activeFilter === 'to_city' && bus.direction !== 'to_city') return false;
    if (activeFilter === 'to_campus' && bus.direction !== 'to_campus') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      bus.route.toLowerCase().includes(q) ||
      bus.destination.toLowerCase().includes(q) ||
      bus.stopName.toLowerCase().includes(q) ||
      bus.directionLabel.toLowerCase().includes(q) ||
      bus.operator.toLowerCase().includes(q)
    );
  });

  const filterTabs: { id: TransitFilter; label: string }[] = [
    { id: 'all', label: `全部路線 (${routes.length})` },
    { id: 'favorites', label: `常用收藏 (${favoriteIds.length})` },
    { id: '校門口', label: '校門口站' },
    { id: '宿舍區', label: '宿舍區站' },
    { id: 'to_city', label: '往市區 / 北屯 / 高鐵 (下山)' },
    { id: 'to_campus', label: '往朝陽科大 (進站上山)' },
  ];

  const getCrowdingInfo = (level: BusRouteInfo['crowding'], status: BusRouteInfo['status']) => {
    if (status === 'ended' || status === 'unscheduled') {
      return { label: '目前無載客班次', colorClass: 'text-slate-500' };
    }
    if (level === 'high') {
      return { label: '人潮較多 (建議提早排隊)', colorClass: 'text-rose-600 dark:text-red-400' };
    }
    if (level === 'medium') {
      return { label: '人潮適中', colorClass: 'text-amber-600 dark:text-amber-400' };
    }
    return { label: '舒適有座', colorClass: 'text-emerald-600 dark:text-emerald-400' };
  };

  const getArrivalBadge = (bus: BusRouteInfo) => {
    if (bus.status === 'ended') {
      return {
        label: '今日營運已結束',
        detail: '今日營運已結束',
        badgeClass: 'bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        etaTextClass: 'text-slate-500 dark:text-slate-400',
        isLive: false,
      };
    }
    if (bus.status === 'unscheduled' || bus.nextBusMinutes < 0) {
      return {
        label: '未發車',
        detail: bus.nextDepartureTime ? `未發車 · ${bus.nextDepartureTime}` : '尚未發車',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        etaTextClass: 'text-slate-500 dark:text-slate-400',
        isLive: false,
      };
    }
    if (bus.status === 'arriving' || bus.nextBusMinutes <= 1) {
      return {
        label: '進站中',
        detail: bus.nextBusMinutes === 0 ? '進站中' : '約 1 分內進站',
        badgeClass: 'bg-accent text-white border border-accent shadow-sm shadow-accent',
        etaTextClass: 'text-accent',
        isLive: true,
      };
    }
    if (bus.status === 'approaching' || bus.nextBusMinutes <= 4) {
      return {
        label: '將到站',
        detail: `約 ${bus.nextBusMinutes} 分鐘`,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/80',
        etaTextClass: 'text-amber-600 dark:text-amber-400',
        isLive: true,
      };
    }
    return {
      label: '行駛中',
      detail: `約 ${bus.nextBusMinutes} 分鐘`,
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80',
      etaTextClass: 'text-emerald-600 dark:text-emerald-400',
      isLive: false,
    };
  };

  const getShuttleStatusLabel = (status: 'operating' | 'before_hours' | 'ended') => {
    if (status === 'ended') return { text: '今日營運已結束', cls: 'text-slate-500 dark:text-slate-400' };
    if (status === 'before_hours') return { text: '尚未開班', cls: 'text-amber-600 dark:text-amber-400' };
    return { text: '營運中', cls: 'text-emerald-600 dark:text-emerald-400' };
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Return Home + Live Taiwan Clock + Auto-Refresh Countdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            type="button"
            onClick={onBackHome}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-accent" />
            <span>返回主畫面</span>
          </button>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bus className="w-5 h-5 text-accent shrink-0" />
              <span>台中 / 朝陽公車即時動態系統</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {transitSnapshot.source === 'tdx'
                ? '已串接交通部 TDX 臺中市公車即時動態 API · 同步顯示臺灣標準時間'
                : '同步臺灣標準時間 (UTC+8) 嚴格判斷班表 · 支援串接交通部 TDX 即時動態 API'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-950/70 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/90">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">臺灣當地時間</div>
              <div className="text-sm font-mono tabular-nums font-black text-slate-900 dark:text-white">
                {taiwanTimeNow}
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                <span>即時更新倒數</span>
              </div>
              <div className="text-sm font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                {refreshCountdown} 秒後同步
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-accent disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? '同步中...' : '立即更新'}</span>
          </button>
        </div>
      </div>

      {/* Strict Late-Night Service Ended Notice (After 22:30 or Overnight) */}
      {transitSnapshot.allEnded && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/95 border border-accent-soft flex items-start sm:items-center gap-3 text-xs text-slate-700 dark:text-slate-200 shadow-sm dark:shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-accent-soft border border-accent-soft flex items-center justify-center text-accent shrink-0">
            <Moon className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 dark:text-white">
              今日公車營運已全部結束（目前臺灣時間 {taiwanTimeNow}）
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              依據臺中市公車與朝陽科大末班營運規範（22:30 以後收班），目前所有公車路線均已切換顯示「今日營運已結束」，明日首班車將於 05:50 起陸續發車。
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋公車路線（如 131、132、151 副線、158）、客運業者、目的地或站牌..."
            className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-accent transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="清除搜尋"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                  ? 'bg-accent text-white shadow-md shadow-accent'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
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
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm dark:shadow-none">
              <Bus className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">找不到符合條件的公車路線</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white transition"
              >
                顯示全部路線
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoutes.map((bus) => {
                const isFav = favoriteIds.includes(bus.id);
                const arrival = getArrivalBadge(bus);
                const crowding = getCrowdingInfo(bus.crowding, bus.status);
                const isEnded = bus.status === 'ended';

                return (
                  <div
                    key={bus.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      bus.status === 'arriving'
                        ? 'bg-accent-soft border-accent shadow-lg shadow-accent'
                        : isEnded
                        ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/70 opacity-85'
                        : 'bg-white dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-lg'
                    }`}
                  >
                    <div>
                      {/* Top Header: Route + Arrival Status Badge + Favorite Star */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                              {bus.route}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold inline-flex items-center gap-1 ${arrival.badgeClass}`}
                            >
                              {arrival.isLive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                              )}
                              <span>{arrival.label}</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {bus.operator}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(bus.id)}
                          aria-label={isFav ? `取消收藏 ${bus.route}` : `收藏 ${bus.route}`}
                          className={`min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl transition ${
                            isFav
                              ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${isFav ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      {/* Direction + Boarding Stop + Destination */}
                      <div className="mt-3 space-y-1.5">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-bold ${
                            bus.direction === 'to_city' ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'
                          }`}
                        >
                          <Navigation className="w-3.5 h-3.5 shrink-0" />
                          <span>{bus.directionLabel}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                          {bus.destination}
                        </p>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate">候車站牌：{bus.stopName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Vehicle Telemetry & ETA Section */}
                    <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <span className={`text-base font-black font-mono tabular-nums ${arrival.etaTextClass}`}>
                            {arrival.detail}
                          </span>
                          {bus.secondBusMinutes !== undefined && !isEnded && (
                            <span className="ml-2 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                              下班約 {bus.secondBusMinutes} 分
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                          {isEnded
                            ? bus.nextDepartureTime || '明日首班見'
                            : bus.plateNumber
                            ? `車號 ${bus.plateNumber}`
                            : '尚未派車'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/75 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                        {bus.currentStop}
                      </div>

                      {/* Unboxed Metadata Separators */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
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
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <span>朝陽校內接駁車時刻</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">持證免費</span>
            </div>

            <div className="space-y-4 divide-y divide-slate-200 dark:divide-slate-800/80">
              {shuttleSchedules.map((shuttle, index) => {
                const shuttleStatus = transitSnapshot.shuttleStatuses[shuttle.id] || 'ended';
                const statusLabel = getShuttleStatusLabel(shuttleStatus);

                return (
                  <div key={shuttle.id} className={index > 0 ? 'pt-4' : ''}>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{shuttle.name}</h4>
                      <span className={`text-[11px] font-bold ${statusLabel.cls}`}>
                        {statusLabel.text}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                      營運時段：{shuttle.firstBus} - {shuttle.lastBus}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {shuttle.routeSummary}
                    </p>
                    <div className="mt-2 space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                      <div>候車處：{shuttle.boardingStop}</div>
                      <div className="text-slate-500 dark:text-slate-400">尖峰班距：{shuttle.peakInterval}</div>
                      <div className="text-slate-500 dark:text-slate-400">離峰班距：{shuttle.offPeakInterval}</div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">{shuttle.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HSR & TRA Transfer Guide Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Train className="w-4 h-4 text-accent" />
                <span>高鐵 / 台鐵轉乘快捷指南</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">雙鐵接駁</span>
            </div>

            <div className="space-y-4 divide-y divide-slate-200 dark:divide-slate-800/80">
              {transferGuides.map((guide, index) => (
                <div key={guide.id} className={index > 0 ? 'pt-4' : ''}>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{guide.hubName}</h4>
                  <div className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    推薦搭乘：{guide.recommendedRoutes.join(' · ')}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                    <span>車程 {guide.estimatedTime}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 dark:text-slate-400">{guide.firstLastInfo}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
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
