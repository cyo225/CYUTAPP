export type UserRole = 'student' | 'teacher' | 'merchant';

export type NavigationTab =
  | 'overview'
  | 'academic'
  | 'ai-tutor'
  | 'rewards'
  | 'social'
  | 'campus-life'
  | 'campus-3d'
  | 'transit'
  | 'merchant-portal';

export type CampusLifeSection =
  | 'cafeteria'
  | 'repair'
  | 'locker'
  | 'calendar'
  | 'emergency'
  | 'library'
  | 'leave';

export type MerchantPlan = 'monthly' | 'quarterly' | 'yearly';

export interface MerchantCouponInventory {
  id: string;
  storeId: string;
  title: string;
  discountSummary: string;
  couponCodePrefix: string;
  totalQuota: number;
  claimedCount: number;
  redeemedToday: number;
  isActive: boolean;
}

export interface MerchantRedemptionRecord {
  id: string;
  storeId: string;
  couponTitle: string;
  couponCode: string;
  studentDeptMasked: string;
  redeemedAt: string;
  channel: 'QR 掃碼核銷' | '券號手動核銷';
}

export interface MerchantStore {
  id: string;
  ownerEmail: string;
  name: string;
  category: string;
  icon?: string;
  address: string;
  phone: string;
  plan: MerchantPlan;
  paid: boolean;
  coverImage?: string;
  menuImage?: string;
  website?: string;
  businessHours?: string;
  priceRange?: string;
  walkingTimeLabel?: string;
  signatureDishes?: string[];
  cafeteriaId?: string;
  latestPromo?: string;
  dailyLuckyCoupon?: {
    title: string;
    discountDescription: string;
    originalValue: number;
    couponCategory: 'beverage' | 'snack' | 'bento' | 'coffee' | 'dessert';
  };
  updatedAt: string;
}


export interface GoogleAccountBinding {
  email: string;
  name: string;
  connectedAt: string;
}

export interface StudentProfile {
  id: string;
  role: UserRole;
  studentNo: string; // Student ID (s...) or Faculty ID (t...) or Merchant email
  name: string;
  department: string;
  semester: string;
  avatar: string;
  points: number;
  streakDays: number;
  lastCheckInDate: string | null;
  lotteryTickets: number;
  tronclassConnected: boolean;
  tronclassToken?: string;
  googleEmail?: string;
  isLoggedIn: boolean;
  merchantStoreId?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  classroom: string;
  building: string;
  dayOfWeek: number; // 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri
  startPeriod: number; // 1-8
  endPeriod: number;
  timeRange: string;
  color: string;
  credits: number;
  tronclassUrl?: string;
}

export type TodoType = 'assignment' | 'quiz' | 'material' | 'past_exam' | 'announcement';

export interface TodoItem {
  id: string;
  courseName: string;
  courseCode: string;
  title: string;
  type: TodoType;
  dueDate: string;
  urgent: boolean;
  completed: boolean;
  pointsReward?: number;
  detailUrl?: string;
  description?: string;
}

export interface Coupon {
  id: string;
  title: string;
  storeName: string;
  category: 'beverage' | 'snack' | 'bento' | 'coffee' | 'dessert';
  originalValue: number;
  discountDescription: string;
  qrCodeUrl?: string;
  code: string;
  expiryDate: string;
  isUsed: boolean;
  isListedForSale: boolean;
  salePrice?: number;
  sellerId?: string;
  sellerName?: string;
}

export type SocialCategory = 'feed' | 'department' | 'mixer' | 'online_meetup' | 'club' | 'exchange';

export interface SocialAttachment {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  dataUrl?: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorDept: string;
  isAnonymous: boolean;
  avatar?: string;
  category: SocialCategory;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  comments: {
    id: string;
    author: string;
    text: string;
    time: string;
  }[];
  tag?: string;
  price?: number;
  itemCondition?: string;
  images?: string[];
  attachments?: SocialAttachment[];
}

export interface BusRouteInfo {
  id: string;
  route: string;
  operator: string;
  destination: string;
  direction: 'to_city' | 'to_campus';
  directionLabel: string;
  stopName: string;
  areaTag: '校門口' | '宿舍區' | '校內站' | '吉峰路口';
  currentStop: string;
  nextBusMinutes: number; // -1 if unscheduled or ended
  secondBusMinutes?: number;
  status: 'arriving' | 'approaching' | 'scheduled' | 'unscheduled' | 'ended' | 'delayed';
  plateNumber?: string;
  crowding: 'low' | 'medium' | 'high';
  isAccessible?: boolean;
  nextDepartureTime?: string;
  operatingHours: string;
  firstDeparture?: string;
  lastDeparture?: string;
}

export interface ShuttleSchedule {
  id: string;
  name: string;
  routeSummary: string;
  boardingStop: string;
  peakInterval: string;
  offPeakInterval: string;
  firstBus: string;
  lastBus: string;
  note: string;
}

export interface TransferGuide {
  id: string;
  hubName: string;
  recommendedRoutes: string[];
  estimatedTime: string;
  firstLastInfo: string;
  tip: string;
}

export interface FloorRoomInfo {
  roomCode: string;
  name: string;
  type: string;
  floor: number;
  capacity?: number;
  description?: string;
  facilities: string[];
}

export interface FloorData {
  floorNumber: number;
  floorLabel: string;
  floorTitle: string;
  rooms: FloorRoomInfo[];
}

export interface CampusBuilding {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  description: string;
  departments: string[];
  floors: number;
  coordinates: [number, number, number];
  color: string;
  category: 'academic' | 'administrative' | 'sports' | 'dormitory' | 'facility';
  floorsData: FloorData[];
}

export interface RepairTicket {
  id: string;
  building: string;
  classroom: string;
  itemType: 'projector' | 'aircon' | 'lighting' | 'desk_chair' | 'pc_hardware' | 'network';
  description: string;
  status: 'reported' | 'processing' | 'resolved';
  pointsAwarded: number;
  timestamp: string;
  reporterName: string;
}

export interface SmartLockerBooking {
  id: string;
  lockerNumber: string;
  location: string;
  purpose: string;
  pickupPin: string;
  expiresAt: string;
  status: 'active' | 'retrieved' | 'expired';
}

export interface CafeteriaCrowd {
  id: string;
  name: string;
  location: string;
  level: 'low' | 'medium' | 'high' | 'peak';
  percentage: number;
  popularStall: string;
  updatedAt: string;
}

export interface LeaveRecord {
  id: string;
  courseName: string;
  date: string;
  periods: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  warningNote?: string;
}

export type ThemeMode = 'dark' | 'light';

export type ThemeAccent = 'ocean' | 'lavender' | 'forest' | 'gold' | 'crimson';

export type FontSizeScale = 'standard' | 'medium' | 'large';

export interface NotificationSettings {
  masterEnabled: boolean;
  academicAlerts: boolean;
  merchantPromoAlerts: boolean;
  classReminder15m: boolean;
  socialAlerts: boolean;
}

export interface AppSettings {
  colorMode: ThemeMode;
  accentTheme: ThemeAccent;
  fontSize: FontSizeScale;
  notifications: NotificationSettings;
}

