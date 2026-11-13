import React, { useState } from 'react';
import { 
  BusRouteInfo, 
  RepairTicket, 
  SmartLockerBooking, 
  CafeteriaCrowd, 
  LeaveRecord,
  StudentProfile 
} from '../types';
import { 
  Bus, 
  Calendar, 
  AlertTriangle, 
  BookMarked, 
  Clock, 
  QrCode, 
  Utensils, 
  Wrench, 
  PhoneCall, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  Plus,
  Users,
  Compass
} from 'lucide-react';

interface CampusLifeHubProps {
  profile: StudentProfile;
  busRoutes: BusRouteInfo[];
  cafeteriaList: CafeteriaCrowd[];
  lockers: SmartLockerBooking[];
  leaveRecords: LeaveRecord[];
  repairTickets: RepairTicket[];
  onSubmitRepair: (repair: Omit<RepairTicket, 'id' | 'timestamp' | 'status' | 'pointsAwarded'>) => void;
  onOpen3DMap: () => void;
}

export const CampusLifeHub: React.FC<CampusLifeHubProps> = ({
  profile,
  busRoutes,
  cafeteriaList,
  lockers,
  leaveRecords,
  repairTickets,
  onSubmitRepair,
  onOpen3DMap,
}) => {
  const [activeSection, setActiveSection] = useState<
    'bus' | 'calendar' | 'emergency' | 'library' | 'leave' | 'locker' | 'cafeteria' | 'repair'
  >('bus');

  // Repair form state
  const [repBuilding, setRepBuilding] = useState('圖資大樓 (T2)');
  const [repClassroom, setRepClassroom] = useState('T2-308');
  const [repItem, setRepItem] = useState<'projector' | 'aircon' | 'lighting' | 'desk_chair' | 'pc_hardware' | 'network'>('projector');
  const [repDesc, setRepDesc] = useState('');
  const [repairSuccessMsg, setRepairSuccessMsg] = useState(false);

  // Bus refresh simulation
  const [isRefreshingBus, setIsRefreshingBus] = useState(false);
  const [busData, setBusData] = useState(busRoutes);

  const handleRefreshBuses = () => {
    setIsRefreshingBus(true);
    setTimeout(() => {
      setBusData((prev) =>
        prev.map((b) => ({
          ...b,
          nextBusMinutes: Math.max(1, b.nextBusMinutes + (Math.random() > 0.5 ? -1 : 1)),
        }))
      );
      setIsRefreshingBus(false);
    }, 800);
  };

  const handleCreateRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repDesc.trim()) return;

    onSubmitRepair({
      building: repBuilding,
      classroom: repClassroom,
      itemType: repItem,
      description: repDesc,
      reporterName: profile.name || '林朝陽',
    });

    setRepDesc('');
    setRepairSuccessMsg(true);
    setTimeout(() => setRepairSuccessMsg(false), 4000);
  };

  const calendarEvents = [
    { date: '2026-11-16 ~ 11-20', title: '115 學年度第 1 學期期中教學評量週', tag: '考試', urgent: true },
    { date: '2026-11-25', title: '全校停修課程申請截止日 (17:00 前)', tag: '教務', urgent: true },
    { date: '2026-12-05', title: '朝陽科技大學第 32 屆全校運動大會', tag: '活動', urgent: false },
    { date: '2026-12-25', title: '行憲紀念日彈性補假 (全校放假)', tag: '假期', urgent: false },
    { date: '2027-01-11 ~ 01-15', title: '第 1 學期期末考試週', tag: '考試', urgent: true },
    { date: '2027-01-18', title: '寒假開始', tag: '假期', urgent: false },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Submenu */}
      <div className="flex items-center gap-2 overflow-x-auto netflix-scrollbar border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSection('bus')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'bus'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bus className="w-3.5 h-3.5" />
          <span>臺中公車動態</span>
        </button>
        <button
          onClick={() => setActiveSection('cafeteria')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'cafeteria'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>學餐人流辨識</span>
        </button>
        <button
          onClick={() => setActiveSection('repair')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'repair'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>一鍵教室報修 (+50點)</span>
        </button>
        <button
          onClick={() => setActiveSection('locker')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'locker'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>智慧自取櫃 QR</span>
        </button>
        <button
          onClick={() => setActiveSection('calendar')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'calendar'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>校園行事曆</span>
        </button>
        <button
          onClick={() => setActiveSection('leave')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'leave'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>請假與曠課提醒</span>
        </button>
        <button
          onClick={() => setActiveSection('library')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'library'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>圖書館系統</span>
        </button>
        <button
          onClick={() => setActiveSection('emergency')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'emergency'
              ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>緊急事件通報</span>
        </button>
      </div>

      {/* 1. Taichung Bus Live Tracking */}
      {activeSection === 'bus' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bus className="w-4 h-4 text-[#E50914]" />
                <span>朝陽科技大學即時大眾運輸動態 (臺中市區公車)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                涵蓋 131、132、133、151、158 等專屬校園停靠路線，即時到站秒數換算。
              </p>
            </div>
            <button
              onClick={handleRefreshBuses}
              disabled={isRefreshingBus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBus ? 'animate-spin' : ''}`} />
              <span>更新動態</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {busData.map((bus) => {
              const isUnscheduled = bus.status === 'unscheduled' || bus.nextBusMinutes < 0;
              const isImminent = !isUnscheduled && bus.nextBusMinutes <= 2;

              return (
                <div
                  key={bus.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isImminent
                      ? 'bg-gradient-to-br from-red-950/40 to-slate-900 border-red-800/80'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-white font-mono flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]" />
                      {bus.route} 路
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                        isImminent
                          ? 'bg-[#E50914] text-white animate-pulse'
                          : isUnscheduled
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-slate-800 text-emerald-400 border border-slate-700'
                      }`}
                    >
                      {isUnscheduled
                        ? '未發車'
                        : bus.nextBusMinutes <= 1
                        ? '即將進站'
                        : `${bus.nextBusMinutes} 分鐘後`}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-slate-400">往目的地：</div>
                    <div className="text-sm font-bold text-white mt-0.5">{bus.destination}</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>站牌: {bus.stopName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{bus.operatingHours}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Cafeteria Crowd Density */}
      {activeSection === 'cafeteria' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#E50914]" />
              <span>朝陽學餐人流辨識系統 (即時擁擠程度監控)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              透過校園 AI 人流辨識攝影機即時運算學餐座位飽和度，避開中午尖峰大排長龍。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cafeteriaList.map((cafe) => (
              <div key={cafe.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-white">{cafe.name}</h4>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                      cafe.level === 'high' || cafe.level === 'peak'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : cafe.level === 'medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {cafe.level === 'high' ? '人流尖峰' : cafe.level === 'medium' ? '人潮適中' : '座位充裕'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-4">{cafe.location}</div>

                {/* Density Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">目前人流密度</span>
                    <span className="text-white font-bold">{cafe.percentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        cafe.percentage > 70 ? 'bg-[#E50914]' : cafe.percentage > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${cafe.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-300 pt-3 border-t border-slate-800 flex justify-between">
                  <span>熱門攤位：{cafe.popularStall}</span>
                  <span className="text-slate-500 font-mono text-[10px]">更新於 {cafe.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. One-Click Classroom Repair */}
      {activeSection === 'repair' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Wrench className="w-5 h-5 text-[#E50914]" />
              <span>一鍵教室報修通報</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              發現投影機故障、冷氣異音或課桌椅損壞？通報總務處維修即可獲得 <strong className="text-amber-400 font-mono">50 點數</strong> 成就獎勵！
            </p>

            {repairSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>報修單已成功送出！系統已自動為您注入 +50 點數獎勵！</span>
              </div>
            )}

            <form onSubmit={handleCreateRepair} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">所在大樓</label>
                  <select
                    value={repBuilding}
                    onChange={(e) => setRepBuilding(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="圖資大樓 (T2)">圖資大樓 (T2)</option>
                    <option value="設計大樓 (D)">設計大樓 (D)</option>
                    <option value="管理大樓 (M)">管理大樓 (M)</option>
                    <option value="行政大樓 (A)">行政大樓 (A)</option>
                    <option value="學生宿舍 (松濤樓)">學生第一宿舍 (松濤樓)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">教室編號</label>
                  <input
                    type="text"
                    required
                    value={repClassroom}
                    onChange={(e) => setRepClassroom(e.target.value)}
                    placeholder="例如：T2-308"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">故障項目</label>
                <select
                  value={repItem}
                  onChange={(e) => setRepItem(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="projector">單槍投影機 / HDMI 影音異常</option>
                  <option value="aircon">冷氣空調 / 遙控器故障</option>
                  <option value="lighting">電燈照明 / 走廊燈管閃爍</option>
                  <option value="desk_chair">課桌椅鬆脫 / 講台設備損壞</option>
                  <option value="pc_hardware">電腦教室主機 / 鍵盤滑鼠短缺</option>
                  <option value="network">校園 Wi-Fi (CYUT-WiFi) 連線異常</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">狀況簡述</label>
                <textarea
                  rows={3}
                  required
                  value={repDesc}
                  onChange={(e) => setRepDesc(e.target.value)}
                  placeholder="請簡述故障狀況，方便總務處工務班精準攜帶零件檢修..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white resize-none focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/60 transition active:scale-98"
              >
                立即提交報修 (領取 50 點)
              </button>
            </form>
          </div>

          {/* Recent Repair Records */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>全校即時報修處理動態 ({repairTickets.length} 件)</span>
            </h4>
            {repairTickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{t.building} · {t.classroom}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                      t.status === 'resolved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {t.status === 'resolved' ? '工務班已修復' : '處理派工中'}
                  </span>
                </div>
                <p className="text-slate-300 mt-1">{t.description}</p>
                <div className="text-[10px] text-slate-500 font-mono mt-2">
                  通報人: {t.reporterName} · {t.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Smart Locker QR Checkout */}
      {activeSection === 'locker' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#E50914]" />
              <span>智慧自取櫃 QR Code 數位化借還</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              教學器材（攝影機、投影轉接線）與專題教室備用鑰匙 24H 免排隊自助領取。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockers.map((l) => (
              <div key={l.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{l.lockerNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {l.status === 'active' ? '可取件中' : '已歸還'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-amber-400 mt-1">{l.purpose}</div>
                  <div className="text-xs text-slate-400 mt-1">{l.location}</div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500">取件 PIN 碼</div>
                    <div className="text-xl font-mono font-black text-white">{l.pickupPin}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <QrCode className="w-10 h-10 text-slate-950" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Calendar & Holidays */}
      {activeSection === 'calendar' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E50914]" />
              <span>朝陽科技大學學期重大行事曆與假期提醒</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              自動同步教務處 115 學年度第 1 學期重大期程、選課、停修與國定彈性放假。
            </p>
          </div>

          <div className="space-y-2.5">
            {calendarEvents.map((evt, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {evt.tag}
                    </span>
                    <h4 className="text-sm font-bold text-white">{evt.title}</h4>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-1">{evt.date}</div>
                </div>
                {evt.urgent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                    重大期程
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Leave & Truancy Warning */}
      {activeSection === 'leave' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E50914]" />
              <span>請假申請紀錄與缺課曠課預警通知</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              依朝陽科大學則規定，全學期缺曠時數達該課程三分之一者將強制停修扣考。
            </p>
          </div>

          <div className="space-y-3">
            {leaveRecords.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{rec.courseName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rec.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {rec.status === 'approved' ? '學務處審核通過' : '審核處理中'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  日期：{rec.date} · 節次：{rec.periods}
                </div>
                <div className="text-xs text-slate-300 mt-1">事由：{rec.reason}</div>
                {rec.warningNote && (
                  <div className="mt-2 text-[11px] text-emerald-400 font-semibold">
                    ✓ {rec.warningNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Library System */}
      {activeSection === 'library' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-[#E50914]" />
              <span>波生紀念圖書館 智慧自習席位與館藏檢索</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              即時查詢 2F/3F 寧靜自習區剩餘座位、預約研究小間與館藏借閱續借。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">2F 寧靜自習區</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">42 / 180</div>
              <div className="text-[11px] text-slate-500 mt-1">剩餘空位席數</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">個人借閱中圖書</div>
              <div className="text-2xl font-black text-white font-mono mt-1">3 冊</div>
              <div className="text-[11px] text-slate-500 mt-1">無逾期紀錄</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">研討室預約狀態</div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">L-304</div>
              <div className="text-[11px] text-slate-500 mt-1">預約於明日 14:00</div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Emergency SOS */}
      {activeSection === 'emergency' && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border border-red-900/60 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-[#E50914]" />
            <h3 className="text-lg font-bold text-white">校園緊急事件通報與 24H 安全聯絡專線</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            若於校園內發生緊急事故、意外受傷或安全危害，請立即撥打校安中心專線。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">校安中心 24H 專線</div>
              <div className="text-sm font-black text-[#E50914] font-mono mt-1">04-23323000 #3044</div>
              <div className="text-[10px] text-slate-500 mt-0.5">軍訓室教官輪值</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">大門警衛室</div>
              <div className="text-sm font-black text-white font-mono mt-1">04-23323000 #3000</div>
              <div className="text-[10px] text-slate-500 mt-0.5">校門口進出安全</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">衛生保健組 (醫護室)</div>
              <div className="text-sm font-black text-white font-mono mt-1">04-23323000 #3042</div>
              <div className="text-[10px] text-slate-500 mt-0.5">緊急傷病急救</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">霧峰分局吉峰派出所</div>
              <div className="text-sm font-black text-white font-mono mt-1">04-23302110</div>
              <div className="text-[10px] text-slate-500 mt-0.5">校外治安通報</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
