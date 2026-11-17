import React, { useState } from 'react';
import {
  CampusLifeSection,
  RepairTicket,
  SmartLockerBooking,
  CafeteriaCrowd,
  LeaveRecord,
  StudentProfile,
} from '../types';
import {
  Bus,
  Calendar,
  BookMarked,
  Clock,
  QrCode,
  Utensils,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

interface CampusLifeHubProps {
  profile: StudentProfile;
  activeSection: CampusLifeSection;
  onSelectSection: (section: CampusLifeSection) => void;
  onBackHome: () => void;
  onOpenTransit: () => void;
  cafeteriaList: CafeteriaCrowd[];
  lockers: SmartLockerBooking[];
  leaveRecords: LeaveRecord[];
  repairTickets: RepairTicket[];
  onSubmitRepair: (repair: Omit<RepairTicket, 'id' | 'timestamp' | 'status' | 'pointsAwarded'>) => void;
  onOpen3DMap: () => void;
}

export const CampusLifeHub: React.FC<CampusLifeHubProps> = ({
  profile,
  activeSection,
  onSelectSection,
  onBackHome,
  onOpenTransit,
  cafeteriaList,
  lockers,
  leaveRecords,
  repairTickets,
  onSubmitRepair,
}) => {
  // Repair form state
  const [repBuilding, setRepBuilding] = useState('圖資大樓 (T2)');
  const [repClassroom, setRepClassroom] = useState('T2-308');
  const [repItem, setRepItem] = useState<
    'projector' | 'aircon' | 'lighting' | 'desk_chair' | 'pc_hardware' | 'network'
  >('projector');
  const [repDesc, setRepDesc] = useState('');
  const [repairSuccessMsg, setRepairSuccessMsg] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<'all' | '1' | '2' | '3' | '4'>('all');

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

  type GradeScope = 'all' | '1' | '2' | '3' | '4';
  interface CalendarEventItem {
    date: string;
    targetDate: string;
    title: string;
    tag: string;
    gradeLabel: string;
    grades: GradeScope[];
    urgent: boolean;
  }

  const calendarEvents: CalendarEventItem[] = [
    {
      date: '2026-11-16 ~ 11-20',
      targetDate: '2026-11-20',
      title: '115 學年度第 1 學期期中教學評量週 & 期中考彙整',
      tag: '考試',
      gradeLabel: '全校年級',
      grades: ['all', '1', '2', '3', '4'],
      urgent: true,
    },
    {
      date: '2026-11-22',
      targetDate: '2026-11-22',
      title: '大一新生基礎學科期中學習預警輔導 & 英文分級補測',
      tag: '大一事項',
      gradeLabel: '大一專屬',
      grades: ['all', '1'],
      urgent: true,
    },
    {
      date: '2026-11-25',
      targetDate: '2026-11-25',
      title: '全校停修課程申請截止日 (17:00 前)',
      tag: '教務',
      gradeLabel: '全校年級',
      grades: ['all', '1', '2', '3', '4'],
      urgent: true,
    },
    {
      date: '2026-11-29',
      targetDate: '2026-11-29',
      title: '大二專業核心課程學程分流與服務學習時數初審截止',
      tag: '大二事項',
      gradeLabel: '大二專屬',
      grades: ['all', '2'],
      urgent: false,
    },
    {
      date: '2026-12-03',
      targetDate: '2026-12-03',
      title: '大三畢業專題指導教授媒合與產學實習說明會',
      tag: '大三事項',
      gradeLabel: '大三專屬',
      grades: ['all', '3'],
      urgent: true,
    },
    {
      date: '2026-12-05',
      targetDate: '2026-12-05',
      title: '朝陽科技大學第 32 屆全校運動大會',
      tag: '活動',
      gradeLabel: '全校年級',
      grades: ['all', '1', '2', '3', '4'],
      urgent: false,
    },
    {
      date: '2026-12-12',
      targetDate: '2026-12-12',
      title: '大四應屆畢業門檻審查（英文檢定 / 資訊證照 / 實務專題上傳）',
      tag: '大四事項',
      gradeLabel: '大四專屬',
      grades: ['all', '4'],
      urgent: true,
    },
    {
      date: '2026-12-25',
      targetDate: '2026-12-25',
      title: '行憲紀念日彈性補假 (全校放假)',
      tag: '假期',
      gradeLabel: '全校年級',
      grades: ['all', '1', '2', '3', '4'],
      urgent: false,
    },
    {
      date: '2027-01-11 ~ 01-15',
      targetDate: '2027-01-11',
      title: '第 1 學期期末考試週',
      tag: '考試',
      gradeLabel: '全校年級',
      grades: ['all', '1', '2', '3', '4'],
      urgent: true,
    },
    {
      date: '2027-01-18',
      targetDate: '2027-01-18',
      title: '寒假開始（全校放假至開學日）',
      tag: '假期',
      gradeLabel: '全校年級',
      grades: ['all', '1', '2', '3', '4'],
      urgent: false,
    },
  ];

  const computeDaysLeft = (targetIso: string): number => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const [y, m, d] = targetIso.split('-').map(Number);
    const targetMidnight = new Date(y, m - 1, d).getTime();
    return Math.ceil((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
  };

  const countdownMilestones = [
    {
      id: 'midterm',
      label: '期中評量與停修截止',
      dateLabel: '2026-11-25',
      days: computeDaysLeft('2026-11-25'),
      accentClass: 'text-amber-600 dark:text-amber-400',
      note: '停修申請於 17:00 截止',
    },
    {
      id: 'holiday',
      label: '最近國定假期（行憲紀念日）',
      dateLabel: '2026-12-25',
      days: computeDaysLeft('2026-12-25'),
      accentClass: 'text-emerald-600 dark:text-emerald-400',
      note: '全校彈性放假一日',
    },
    {
      id: 'finals',
      label: '第 1 學期期末考試週',
      dateLabel: '2027-01-11',
      days: computeDaysLeft('2027-01-11'),
      accentClass: 'text-rose-600 dark:text-rose-400',
      note: '期末大考倒數衝刺',
    },
    {
      id: 'winter',
      label: '寒假開始倒數',
      dateLabel: '2027-01-18',
      days: computeDaysLeft('2027-01-18'),
      accentClass: 'text-accent',
      note: '全學期課程結束',
    },
  ];

  const filteredCalendarEvents = calendarEvents.filter((evt) =>
    selectedGrade === 'all' ? true : evt.grades.includes(selectedGrade)
  );

  const sectionMeta: Record<CampusLifeSection, { title: string; subtitle: string }> = {
    cafeteria: {
      title: '學餐人流系統',
      subtitle: '即時偵測一餐、二餐與波浪廣場座位密度與熱門攤位排隊狀況',
    },
    repair: {
      title: '校園報修系統',
      subtitle: '教室設備故障一鍵通報總務處工務班，受理即贈 +50 點數獎勵',
    },
    locker: {
      title: '教室借還數位化系統（自取櫃）',
      subtitle: '教學器材與專題教室備用鑰匙 24 小時掃碼自主借還',
    },
    calendar: {
      title: '行事曆系統',
      subtitle: '115 學年度重要考試期程、停修截止日與國定假期提醒',
    },
    emergency: {
      title: '緊急事件通報整合系統',
      subtitle: '朝陽 24H 校安中心、警衛室、醫護室與派出所快速聯繫專線',
    },
    library: {
      title: '圖書館系統',
      subtitle: '波生紀念圖書館自習席位即時餘額、研討室預約與借閱紀錄',
    },
    leave: {
      title: '請假與曠課提醒',
      subtitle: '線上請假審核紀錄與各科缺曠時數預警',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
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
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{sectionMeta[activeSection].title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sectionMeta[activeSection].subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenTransit}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition self-start sm:self-auto shrink-0"
        >
          <Bus className="w-3.5 h-3.5 text-accent" />
          <span>前往公車即時動態</span>
        </button>
      </div>
      {/* Navigation Submenu */}
      <div className="flex items-center gap-2 overflow-x-auto netflix-scrollbar border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => onSelectSection('cafeteria')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'cafeteria'
              ? 'bg-accent text-white shadow-md shadow-accent'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>學餐人流系統</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('repair')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'repair'
              ? 'bg-accent text-white shadow-md shadow-accent'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>校園報修 (+50點)</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('locker')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'locker'
              ? 'bg-accent text-white shadow-md shadow-accent'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>教室借還自取櫃</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('calendar')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'calendar'
              ? 'bg-accent text-white shadow-md shadow-accent'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>行事曆系統</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('library')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'library'
              ? 'bg-accent text-white shadow-md shadow-accent'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>圖書館系統</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('emergency')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'emergency'
              ? 'bg-accent text-white shadow-md shadow-accent'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>緊急事件通報</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('leave')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeSection === 'leave'
              ? 'bg-accent text-white shadow-md shadow-accent'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>請假預警</span>
        </button>
      </div>

      {/* 2. Cafeteria Crowd Density */}
      {activeSection === 'cafeteria' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-accent" />
              <span>朝陽學餐人流辨識系統 (即時擁擠程度監控)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              透過校園 AI 人流辨識攝影機即時運算學餐座位飽和度，避開中午尖峰大排長龍。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cafeteriaList.map((cafe) => (
              <div key={cafe.id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{cafe.name}</h4>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                      cafe.level === 'high' || cafe.level === 'peak'
                        ? 'bg-rose-50 dark:bg-red-950 text-rose-700 dark:text-red-300 border border-rose-200 dark:border-red-800'
                        : cafe.level === 'medium'
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {cafe.level === 'high' ? '人流尖峰' : cafe.level === 'medium' ? '人潮適中' : '座位充裕'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">{cafe.location}</div>

                {/* Density Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">目前人流密度</span>
                    <span className="text-slate-900 dark:text-white font-bold">{cafe.percentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        cafe.percentage > 70 ? 'bg-rose-500' : cafe.percentage > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${cafe.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between">
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
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Wrench className="w-5 h-5 text-accent" />
              <span>一鍵教室報修通報</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              發現投影機故障、冷氣異音或課桌椅損壞？通報總務處維修即可獲得 <strong className="text-amber-600 dark:text-amber-400 font-mono">50 點數</strong> 成就獎勵！
            </p>

            {repairSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>報修單已成功送出！系統已自動為您注入 +50 點數獎勵！</span>
              </div>
            )}

            <form onSubmit={handleCreateRepair} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">所在大樓</label>
                  <select
                    value={repBuilding}
                    onChange={(e) => setRepBuilding(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                  >
                    <option value="圖資大樓 (T2)">圖資大樓 (T2)</option>
                    <option value="設計大樓 (D)">設計大樓 (D)</option>
                    <option value="管理大樓 (M)">管理大樓 (M)</option>
                    <option value="行政大樓 (A)">行政大樓 (A)</option>
                    <option value="學生宿舍 (松濤樓)">學生第一宿舍 (松濤樓)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">教室編號</label>
                  <input
                    type="text"
                    required
                    value={repClassroom}
                    onChange={(e) => setRepClassroom(e.target.value)}
                    placeholder="例如：T2-308"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">故障項目</label>
                <select
                  value={repItem}
                  onChange={(e) => setRepItem(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-accent"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">狀況簡述</label>
                <textarea
                  rows={3}
                  required
                  value={repDesc}
                  onChange={(e) => setRepDesc(e.target.value)}
                  placeholder="請簡述故障狀況，方便總務處工務班精準攜帶零件檢修..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white resize-none focus:outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-lg shadow-accent transition active:scale-98"
              >
                立即提交報修 (領取 50 點)
              </button>
            </form>
          </div>

          {/* Recent Repair Records */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>全校即時報修處理動態 ({repairTickets.length} 件)</span>
            </h4>
            {repairTickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{t.building} · {t.classroom}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                      t.status === 'resolved'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {t.status === 'resolved' ? '工務班已修復' : '處理派工中'}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mt-1">{t.description}</p>
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
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-accent" />
              <span>智慧自取櫃 QR Code 數位化借還</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              教學器材（攝影機、投影轉接線）與專題教室備用鑰匙 24H 免排隊自助領取。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockers.map((l) => (
              <div key={l.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm dark:shadow-none">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{l.lockerNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {l.status === 'active' ? '可取件中' : '已歸還'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">{l.purpose}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{l.location}</div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500">取件 PIN 碼</div>
                    <div className="text-xl font-mono font-black text-slate-900 dark:text-white">{l.pickupPin}</div>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-white rounded-lg border border-slate-200 dark:border-transparent">
                    <QrCode className="w-10 h-10 text-slate-950" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Calendar & Holidays (With Grade Filter & Exam/Holiday Countdowns) */}
      {activeSection === 'calendar' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>朝陽科技大學分年級行事曆與倒數提醒</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  支援大一至大四年級專屬事項篩選，並即時計算期中、期末與假期倒數天數。
                </p>
              </div>

              {/* Grade Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-x-auto netflix-scrollbar">
                {[
                  { id: 'all', label: '全部年級' },
                  { id: '1', label: '大一' },
                  { id: '2', label: '大二' },
                  { id: '3', label: '大三' },
                  { id: '4', label: '大四' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGrade(g.id as 'all' | '1' | '2' | '3' | '4')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition ${
                      selectedGrade === g.id
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Exam & Holiday Countdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {countdownMilestones.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col justify-between"
              >
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {m.label}
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-black font-mono tabular-nums ${m.accentClass}`}>
                    {m.days > 0 ? m.days : 0}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {m.days > 0 ? '天後' : m.days === 0 ? '就是今天' : '已結束'}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{m.dateLabel}</span>
                  <span>{m.note}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filtered Calendar Timeline */}
          <div className="space-y-2.5">
            {filteredCalendarEvents.map((evt, i) => {
              const daysUntil = computeDaysLeft(evt.targetDate);
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm dark:shadow-none"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {evt.tag}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-accent-soft text-accent">
                        {evt.gradeLabel}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{evt.date}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      {daysUntil > 0 ? `倒數 ${daysUntil} 天` : daysUntil === 0 ? '今日進行中' : '已結束'}
                    </span>
                    {evt.urgent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-red-950 text-rose-700 dark:text-red-400 border border-rose-200 dark:border-red-800">
                        重大期程
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Leave & Truancy Warning */}
      {activeSection === 'leave' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span>請假申請紀錄與缺課曠課預警通知</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              依朝陽科大學則規定，全學期缺曠時數達該課程三分之一者將強制停修扣考。
            </p>
          </div>

          <div className="space-y-3">
            {leaveRecords.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{rec.courseName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rec.status === 'approved'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {rec.status === 'approved' ? '學務處審核通過' : '審核處理中'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  日期：{rec.date} · 節次：{rec.periods}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">事由：{rec.reason}</div>
                {rec.warningNote && (
                  <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
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
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-accent" />
              <span>波生紀念圖書館 智慧自習席位與館藏檢索</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              即時查詢 2F/3F 寧靜自習區剩餘座位、預約研究小間與館藏借閱續借。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm dark:shadow-none">
              <div className="text-xs text-slate-500 dark:text-slate-400">2F 寧靜自習區</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">42 / 180</div>
              <div className="text-[11px] text-slate-500 mt-1">剩餘空位席數</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm dark:shadow-none">
              <div className="text-xs text-slate-500 dark:text-slate-400">個人借閱中圖書</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">3 冊</div>
              <div className="text-[11px] text-slate-500 mt-1">無逾期紀錄</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm dark:shadow-none">
              <div className="text-xs text-slate-500 dark:text-slate-400">研討室預約狀態</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">L-304</div>
              <div className="text-[11px] text-slate-500 mt-1">預約於明日 14:00</div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Emergency SOS */}
      {activeSection === 'emergency' && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-white dark:from-red-950/40 dark:via-slate-900 dark:to-slate-900 border border-rose-200 dark:border-red-900/60 shadow-xl dark:shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">校園緊急事件通報與 24H 安全聯絡專線</h3>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            若於校園內發生緊急事故、意外受傷或安全危害，請立即撥打校安中心專線。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">校安中心 24H 專線</div>
              <div className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono mt-1">04-23323000 #3044</div>
              <div className="text-[10px] text-slate-500 mt-0.5">軍訓室教官輪值</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">大門警衛室</div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-1">04-23323000 #3000</div>
              <div className="text-[10px] text-slate-500 mt-0.5">校門口進出安全</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">衛生保健組 (醫護室)</div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-1">04-23323000 #3042</div>
              <div className="text-[10px] text-slate-500 mt-0.5">緊急傷病急救</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">霧峰分局吉峰派出所</div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-1">04-23302110</div>
              <div className="text-[10px] text-slate-500 mt-0.5">校外治安通報</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
