import type { BusRouteInfo } from '../types';

export interface TaiwanClockParts {
  hour: number;
  minute: number;
  second: number;
  totalMinutes: number;
  formattedTime: string;
}

export interface TransitRouteTemplate {
  id: string;
  route: string;
  tdxRouteName: string;
  tdxDirection: 0 | 1; // TDX 標準定義：0 = 去程 (市區/高鐵發車 → 往朝陽科大上山), 1 = 返程 (朝陽科大發車下山 → 往市區/北屯/高鐵)
  operator: string;
  destination: string;
  direction: 'to_city' | 'to_campus';
  directionLabel: string;
  stopName: string;
  areaTag: '校門口' | '宿舍區' | '校內站' | '吉峰路口';
  firstMinutes: number;
  lastMinutes: number;
  headwayMinutes: number;
  phaseOffset: number;
  platePool: string[];
  approachStops: string[];
  isAccessible: boolean;
  operatingHours: string;
}

export interface TransitApiResponse {
  source: 'tdx' | 'schedule';
  taiwanTime: string;
  taiwanTotalMinutes: number;
  allEnded: boolean;
  routes: BusRouteInfo[];
  shuttleStatuses: Record<string, 'operating' | 'before_hours' | 'ended'>;
}

// Strict CYUT / Taichung City Bus Late-Night Cutoff: 22:30 (1350 mins)
export const GLOBAL_SERVICE_END_MINUTES = 22 * 60 + 30;
// Overnight cutoff before morning prep (00:00 - 04:59) also treated as ended for the night
export const OVERNIGHT_CUTOFF_MINUTES = 5 * 60;

export function getTaiwanClock(now: Date = new Date()): TaiwanClockParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getVal = (type: string) => {
    const found = parts.find((p) => p.type === type)?.value || '00';
    return parseInt(found, 10);
  };

  let hour = getVal('hour');
  if (hour === 24) hour = 0;
  const minute = getVal('minute');
  const second = getVal('second');
  const totalMinutes = hour * 60 + minute;

  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    hour,
    minute,
    second,
    totalMinutes,
    formattedTime: `${pad(hour)}:${pad(minute)}:${pad(second)}`,
  };
}

export function formatMinutesToHHMM(totalMins: number): string {
  const normalized = ((totalMins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const CYUT_ROUTE_TEMPLATES: TransitRouteTemplate[] = [
  {
    id: 'bus-131-city',
    route: '131',
    tdxRouteName: '131',
    tdxDirection: 1, // 返程：朝陽發車下山 → 往北屯民俗公園 / 臺中車站
    operator: '台中客運 · 低地板電動車',
    destination: '往北屯國兒運(民俗公園) (經大里仁愛醫院、中興大學、臺中車站)',
    direction: 'to_city',
    directionLabel: '返程 · 朝陽發車下山 → 往北屯 / 臺中車站',
    stopName: '朝陽科技大學(校門口)',
    areaTag: '校門口',
    firstMinutes: 5 * 60 + 50, // 05:50
    lastMinutes: 22 * 60 + 30, // 22:30
    headwayMinutes: 15,
    phaseOffset: 2,
    platePool: ['EAA-618', 'EAA-619', 'EAA-623'],
    approachStops: ['朝陽科技大學(宿舍區發車)', '設計大樓旁候車亭', '行政大樓前公車站'],
    isAccessible: true,
    operatingHours: '05:50 - 22:30 · 班距 15 分',
  },
  {
    id: 'bus-131-campus',
    route: '131',
    tdxRouteName: '131',
    tdxDirection: 0, // 去程：北屯民俗公園發車上山 → 往朝陽科技大學
    operator: '台中客運 · 低地板電動車',
    destination: '往朝陽科技大學 (由北屯民俗公園、臺中車站、大里開進朝陽)',
    direction: 'to_campus',
    directionLabel: '去程 · 開進朝陽 → 往朝陽科大終點',
    stopName: '朝陽科技大學(校門口 / 往宿舍區)',
    areaTag: '校門口',
    firstMinutes: 6 * 60, // 06:00
    lastMinutes: 22 * 60 + 30, // 22:30
    headwayMinutes: 15,
    phaseOffset: 9,
    platePool: ['EAA-621', 'EAA-625', 'EAA-616'],
    approachStops: ['吉峰路口', '霧峰農工', '大里塗城路'],
    isAccessible: true,
    operatingHours: '06:00 - 22:30 · 進站後往宿舍迴轉',
  },
  {
    id: 'bus-132-city',
    route: '132',
    tdxRouteName: '132',
    tdxDirection: 1, // 返程：朝陽發車下山 → 往北屯民俗公園 / 一中商圈
    operator: '台中客運',
    destination: '往北屯國兒運(民俗公園) (經霧峰農工、大里高中、臺中車站、一中商圈)',
    direction: 'to_city',
    directionLabel: '返程 · 朝陽發車下山 → 往北屯 / 臺中車站',
    stopName: '朝陽科技大學(校門口)',
    areaTag: '校門口',
    firstMinutes: 6 * 60 + 15, // 06:15
    lastMinutes: 22 * 60, // 22:00
    headwayMinutes: 18,
    phaseOffset: 5,
    platePool: ['KKA-6329', 'KKA-6331', 'KKA-6312'],
    approachStops: ['朝陽科技大學(宿舍區發車)', '設計大樓旁候車亭', '朝陽科大學生宿舍'],
    isAccessible: true,
    operatingHours: '06:15 - 22:00 · 班距 18 分',
  },
  {
    id: 'bus-132-campus',
    route: '132',
    tdxRouteName: '132',
    tdxDirection: 0, // 去程：北屯民俗公園發車上山 → 往朝陽科技大學
    operator: '台中客運',
    destination: '往朝陽科技大學 (由北屯民俗公園、一中商圈、臺中車站、霧峰開進朝陽)',
    direction: 'to_campus',
    directionLabel: '去程 · 開進朝陽 → 往朝陽科大終點',
    stopName: '朝陽科技大學(校門口 / 吉峰路口)',
    areaTag: '校門口',
    firstMinutes: 6 * 60 + 15, // 06:15
    lastMinutes: 22 * 60 + 10, // 22:10
    headwayMinutes: 18,
    phaseOffset: 12,
    platePool: ['KKA-6315', 'KKA-6322', 'KKA-6335'],
    approachStops: ['吉峰路口', '霧峰郵局', '霧峰農會'],
    isAccessible: true,
    operatingHours: '06:15 - 22:10 · 班距 18 分',
  },
  {
    id: 'bus-151a-city',
    route: '151 副線',
    tdxRouteName: '151',
    tdxDirection: 1, // 返程：朝陽發車下山 → 往高鐵臺中站 / 臺中市議會
    operator: '中台灣客運 · 幹線快線',
    destination: '往高鐵臺中站 / 臺中市議會 (經中投快速道路、新光三越)',
    direction: 'to_city',
    directionLabel: '返程 · 朝陽發車下山 → 往高鐵臺中站 / 市府',
    stopName: '朝陽科技大學(校門口)',
    areaTag: '校門口',
    firstMinutes: 6 * 60, // 06:00
    lastMinutes: 22 * 60 + 30, // 22:30
    headwayMinutes: 20,
    phaseOffset: 4,
    platePool: ['FAD-105', 'FAD-108', 'FAD-112'],
    approachStops: ['朝陽科技大學(宿舍區發車)', '設計大樓旁站位', '吉峰東路'],
    isAccessible: false,
    operatingHours: '06:00 - 22:30 · 中投直達高鐵',
  },
  {
    id: 'bus-151a-campus',
    route: '151 副線',
    tdxRouteName: '151',
    tdxDirection: 0, // 去程：臺中市議會 / 高鐵臺中站發車上山 → 往朝陽科技大學
    operator: '中台灣客運 · 幹線快線',
    destination: '往朝陽科技大學 (由臺中市議會、高鐵臺中站經中投快速道路開進朝陽)',
    direction: 'to_campus',
    directionLabel: '去程 · 開進朝陽 → 往朝陽科大 / 宿舍區',
    stopName: '朝陽科技大學(校門口 / 往宿舍區)',
    areaTag: '宿舍區',
    firstMinutes: 6 * 60 + 20, // 06:20
    lastMinutes: 22 * 60 + 30, // 22:30
    headwayMinutes: 20,
    phaseOffset: 15,
    platePool: ['FAD-109', 'FAD-115', 'FAD-103'],
    approachStops: ['吉峰路口', '霧峰郵局', '中投公路交流道'],
    isAccessible: false,
    operatingHours: '06:20 - 22:30 · 高鐵進校快線',
  },
  {
    id: 'bus-158-city',
    route: '158',
    tdxRouteName: '158',
    tdxDirection: 1, // 返程：竹仔坑/朝陽發車下山 → 往高鐵臺中站 / 臺中車站
    operator: '全航客運',
    destination: '往高鐵臺中站 (經大里兒童藝術館、臺中車站、中山醫)',
    direction: 'to_city',
    directionLabel: '返程 · 朝陽發車下山 → 往高鐵 / 臺中車站',
    stopName: '朝陽科技大學(校門口 / 宿舍區)',
    areaTag: '宿舍區',
    firstMinutes: 6 * 60, // 06:00
    lastMinutes: 21 * 60 + 40, // 21:40
    headwayMinutes: 25,
    phaseOffset: 7,
    platePool: ['KKA-6512', 'KKA-6515', 'KKA-6502'],
    approachStops: ['竹仔坑發車', '健民國小', '仁化工業區'],
    isAccessible: true,
    operatingHours: '06:00 - 21:40 · 班距 25 分',
  },
  {
    id: 'bus-158-campus',
    route: '158',
    tdxRouteName: '158',
    tdxDirection: 0, // 去程：高鐵臺中站發車上山 → 往朝陽科技大學 (竹仔坑)
    operator: '全航客運',
    destination: '往朝陽科技大學(竹仔坑) (由高鐵臺中站、臺中車站、大里開進朝陽)',
    direction: 'to_campus',
    directionLabel: '去程 · 開進朝陽 → 往朝陽科大 / 竹仔坑',
    stopName: '朝陽科技大學(校門口 / 吉峰路口)',
    areaTag: '校門口',
    firstMinutes: 6 * 60, // 06:00
    lastMinutes: 21 * 60 + 40, // 21:40
    headwayMinutes: 25,
    phaseOffset: 19,
    platePool: ['KKA-6508', 'KKA-6519', 'KKA-6521'],
    approachStops: ['吉峰路口', '修平科技大學', '大里兒童藝術館'],
    isAccessible: true,
    operatingHours: '06:00 - 21:40 · 班距 25 分',
  },
  {
    id: 'bus-133-hsr',
    route: '133',
    tdxRouteName: '133',
    tdxDirection: 1, // 返程：朝陽發車下山 → 往高鐵臺中站 / 新烏日車站
    operator: '台中客運',
    destination: '往高鐵臺中站 / 新烏日車站 (經霧峰農會、五光路、烏日)',
    direction: 'to_city',
    directionLabel: '返程 · 朝陽發車下山 → 往高鐵臺中站 / 新烏日',
    stopName: '朝陽科技大學(校門口)',
    areaTag: '校門口',
    firstMinutes: 6 * 60 + 30, // 06:30
    lastMinutes: 21 * 60, // 21:00
    headwayMinutes: 40,
    phaseOffset: 10,
    platePool: ['KKA-6201', 'KKA-6208'],
    approachStops: ['朝陽調度站發車', '朝陽科技大學(宿舍區)'],
    isAccessible: true,
    operatingHours: '06:30 - 21:00 · 固定班距 40 分',
  },
  {
    id: 'bus-133-campus',
    route: '133',
    tdxRouteName: '133',
    tdxDirection: 0, // 去程：高鐵臺中站(新烏日車站)發車上山 → 往朝陽科技大學
    operator: '台中客運',
    destination: '往朝陽科技大學 (由新烏日車站 / 高鐵臺中站經五光路、霧峰開進朝陽)',
    direction: 'to_campus',
    directionLabel: '去程 · 開進朝陽 → 往朝陽科大終點',
    stopName: '朝陽科技大學(校門口 / 校內站)',
    areaTag: '校門口',
    firstMinutes: 6 * 60 + 30, // 06:30
    lastMinutes: 21 * 60, // 21:00
    headwayMinutes: 40,
    phaseOffset: 28,
    platePool: ['KKA-6205', 'KKA-6211'],
    approachStops: ['吉峰路口', '霧峰郵局', '霧峰農會'],
    isAccessible: true,
    operatingHours: '06:30 - 21:00 · 固定班距 40 分',
  },
];

export function evaluateRouteSchedule(
  tpl: TransitRouteTemplate,
  clock: TaiwanClockParts
): BusRouteInfo {
  const firstStr = formatMinutesToHHMM(tpl.firstMinutes);
  const lastStr = formatMinutesToHHMM(tpl.lastMinutes);
  const effectiveLastMinutes = Math.min(tpl.lastMinutes, GLOBAL_SERVICE_END_MINUTES - 1);

  // 1. Strict Global Cutoff: 22:30 - 23:59 OR late night 00:00 - 04:59
  if (clock.totalMinutes >= GLOBAL_SERVICE_END_MINUTES || clock.totalMinutes < OVERNIGHT_CUTOFF_MINUTES) {
    return {
      id: tpl.id,
      route: tpl.route,
      operator: tpl.operator,
      destination: tpl.destination,
      direction: tpl.direction,
      directionLabel: tpl.directionLabel,
      stopName: tpl.stopName,
      areaTag: tpl.areaTag,
      currentStop: `已超過營運時段（末班 ${lastStr}），明日 ${firstStr} 恢復發車`,
      nextBusMinutes: -1,
      status: 'ended',
      crowding: 'low',
      isAccessible: tpl.isAccessible,
      nextDepartureTime: `明日 ${firstStr}`,
      operatingHours: tpl.operatingHours,
      firstDeparture: firstStr,
      lastDeparture: lastStr,
    };
  }

  // 2. Early morning prep window (05:00 up to route firstMinutes)
  if (clock.totalMinutes < tpl.firstMinutes) {
    return {
      id: tpl.id,
      route: tpl.route,
      operator: tpl.operator,
      destination: tpl.destination,
      direction: tpl.direction,
      directionLabel: tpl.directionLabel,
      stopName: tpl.stopName,
      areaTag: tpl.areaTag,
      currentStop: `本日尚未發車，首班車將於 ${firstStr} 發車`,
      nextBusMinutes: -1,
      status: 'unscheduled',
      crowding: 'low',
      isAccessible: tpl.isAccessible,
      nextDepartureTime: `${firstStr} 首班`,
      operatingHours: tpl.operatingHours,
      firstDeparture: firstStr,
      lastDeparture: lastStr,
    };
  }

  // 3. Past individual route's last bus (e.g., 133 after 21:00 or 158 after 21:40)
  if (clock.totalMinutes > effectiveLastMinutes) {
    return {
      id: tpl.id,
      route: tpl.route,
      operator: tpl.operator,
      destination: tpl.destination,
      direction: tpl.direction,
      directionLabel: tpl.directionLabel,
      stopName: tpl.stopName,
      areaTag: tpl.areaTag,
      currentStop: `本路線末班車（${lastStr}）已駛離，明日 ${firstStr} 恢復營運`,
      nextBusMinutes: -1,
      status: 'ended',
      crowding: 'low',
      isAccessible: tpl.isAccessible,
      nextDepartureTime: `明日 ${firstStr}`,
      operatingHours: tpl.operatingHours,
      firstDeparture: firstStr,
      lastDeparture: lastStr,
    };
  }

  // 4. Within active operating window: compute deterministic real-clock ETA
  const elapsedSinceFirst = clock.totalMinutes - tpl.firstMinutes + tpl.phaseOffset;
  const mod = elapsedSinceFirst % tpl.headwayMinutes;
  const etaMinutes = mod === 0 ? 0 : tpl.headwayMinutes - mod;
  const nextArrivalAbs = clock.totalMinutes + etaMinutes;

  // If next computed departure exceeds effective last bus, service has ended for today
  if (nextArrivalAbs > effectiveLastMinutes) {
    return {
      id: tpl.id,
      route: tpl.route,
      operator: tpl.operator,
      destination: tpl.destination,
      direction: tpl.direction,
      directionLabel: tpl.directionLabel,
      stopName: tpl.stopName,
      areaTag: tpl.areaTag,
      currentStop: `本日末班車（${lastStr}）已發車完畢，明日 ${firstStr} 恢復營運`,
      nextBusMinutes: -1,
      status: 'ended',
      crowding: 'low',
      isAccessible: tpl.isAccessible,
      nextDepartureTime: `明日 ${firstStr}`,
      operatingHours: tpl.operatingHours,
      firstDeparture: firstStr,
      lastDeparture: lastStr,
    };
  }

  const cycleNumber = Math.floor(elapsedSinceFirst / tpl.headwayMinutes);
  const plateNumber = tpl.platePool[cycleNumber % tpl.platePool.length];
  const secondArrivalAbs = nextArrivalAbs + tpl.headwayMinutes;
  const secondBusMinutes =
    secondArrivalAbs <= effectiveLastMinutes ? etaMinutes + tpl.headwayMinutes : undefined;

  // Crowding estimation by real Taiwan peak commute hours
  const isPeakCommute =
    (clock.hour >= 7 && clock.hour <= 9) || (clock.hour >= 16 && clock.hour <= 18);
  const crowding: BusRouteInfo['crowding'] = isPeakCommute
    ? tpl.route.includes('151') || tpl.route === '131'
      ? 'high'
      : 'medium'
    : etaMinutes <= 2
    ? 'medium'
    : 'low';

  if (etaMinutes > 20) {
    // Fixed headway waiting at origin terminal
    return {
      id: tpl.id,
      route: tpl.route,
      operator: tpl.operator,
      destination: tpl.destination,
      direction: tpl.direction,
      directionLabel: tpl.directionLabel,
      stopName: tpl.stopName,
      areaTag: tpl.areaTag,
      currentStop: `預計 ${formatMinutesToHHMM(nextArrivalAbs)} 發車（距離約 ${etaMinutes} 分鐘）`,
      nextBusMinutes: -1,
      secondBusMinutes,
      status: 'unscheduled',
      crowding: 'low',
      isAccessible: tpl.isAccessible,
      nextDepartureTime: `${formatMinutesToHHMM(nextArrivalAbs)} 發車`,
      operatingHours: tpl.operatingHours,
      firstDeparture: firstStr,
      lastDeparture: lastStr,
    };
  }

  const status: BusRouteInfo['status'] =
    etaMinutes <= 1 ? 'arriving' : etaMinutes <= 4 ? 'approaching' : 'scheduled';

  const currentStop =
    status === 'arriving'
      ? '車輛正駛入站區，請準備上車'
      : status === 'approaching'
      ? `距離 ${etaMinutes <= 2 ? 1 : 2} 站 · 目前位於「${tpl.approachStops[0]}」`
      : `行駛中 · 目前位於「${tpl.approachStops[Math.min(tpl.approachStops.length - 1, Math.floor(etaMinutes / 6))]}」`;

  return {
    id: tpl.id,
    route: tpl.route,
    operator: tpl.operator,
    destination: tpl.destination,
    direction: tpl.direction,
    directionLabel: tpl.directionLabel,
    stopName: tpl.stopName,
    areaTag: tpl.areaTag,
    currentStop,
    nextBusMinutes: etaMinutes,
    secondBusMinutes,
    status,
    plateNumber,
    crowding,
    isAccessible: tpl.isAccessible,
    operatingHours: tpl.operatingHours,
    firstDeparture: firstStr,
    lastDeparture: lastStr,
  };
}

export function evaluateCyutTransit(now: Date = new Date()): TransitApiResponse {
  const clock = getTaiwanClock(now);
  const routes = CYUT_ROUTE_TEMPLATES.map((tpl) => evaluateRouteSchedule(tpl, clock));
  const allEnded = routes.every((r) => r.status === 'ended');

  // Campus Shuttles operating hours
  const getShuttleStatus = (startMins: number, endMins: number) => {
    const cappedEnd = Math.min(endMins, GLOBAL_SERVICE_END_MINUTES - 1);
    if (clock.totalMinutes >= GLOBAL_SERVICE_END_MINUTES || clock.totalMinutes < OVERNIGHT_CUTOFF_MINUTES) {
      return 'ended' as const;
    }
    if (clock.totalMinutes < startMins) return 'before_hours' as const;
    if (clock.totalMinutes > cappedEnd) return 'ended' as const;
    return 'operating' as const;
  };

  return {
    source: 'schedule',
    taiwanTime: clock.formattedTime,
    taiwanTotalMinutes: clock.totalMinutes,
    allEnded,
    routes,
    shuttleStatuses: {
      'shuttle-campus-loop': getShuttleStatus(7 * 60 + 40, 21 * 60 + 30),
      'shuttle-evening-dorm': getShuttleStatus(18 * 60 + 30, 22 * 60 + 30),
    },
  };
}
