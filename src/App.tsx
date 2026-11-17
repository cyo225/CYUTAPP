/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  NavigationTab,
  CampusLifeSection,
  StudentProfile,
  Course,
  TodoItem,
  Coupon,
  SocialPost,
  RepairTicket,
  MerchantStore,
  MerchantCouponInventory,
  MerchantRedemptionRecord,
  UserRole,
  AppSettings,
  GoogleAccountBinding,
} from './types';
import {
  SETTINGS_STORAGE_KEY,
  loadAppSettings,
  applySettingsToDocument,
} from './utils/themeSettings';
import {
  CHECKIN_CYCLE_REWARDS,
  DEFAULT_AVATAR_URL,
  DEMO_STUDENT,
  DEMO_TEACHER,
  DEMO_MERCHANT_PROFILE,
  DEMO_MERCHANTS,
  DEMO_MERCHANT_COUPONS,
  DEMO_REDEMPTION_LOGS,
  DEMO_COURSES,
  DEMO_TODOS,
  DEMO_COUPONS,
  DEMO_POSTS,
  DEMO_BUS_ROUTES,
  DEMO_SHUTTLE_SCHEDULES,
  DEMO_TRANSFER_GUIDES,
  DEMO_CAFETERIA,
  DEMO_LOCKERS,
  DEMO_LEAVE_RECORDS,
  DEMO_REPAIR_TICKETS,
  CYUT_BUILDINGS,
} from './utils/demoData';
import { SplashScreen } from './components/SplashScreen';
import { AuthGateway } from './components/AuthGateway';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { Navbar } from './components/Navbar';
import { DrawerMenu } from './components/DrawerMenu';
import { PublicTransitHub } from './components/PublicTransitHub';
import { NetflixHeroBillboard } from './components/NetflixHeroBillboard';
import { AcademicHub } from './components/AcademicHub';
import { AITutorView } from './components/AITutorView';
import {
  RewardsMarketHub,
  LotteryCouponTemplate,
  RewardsSubTab,
} from './components/RewardsMarketHub';
import { MerchantDashboard } from './components/MerchantDashboard';
import { SocialHub } from './components/SocialHub';
import { CampusLifeHub } from './components/CampusLifeHub';
import { Campus3DMap } from './components/Campus3DMap';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Compass,
  Calendar,
  Sparkles,
  Gift,
  Users,
  Home,
  CheckCircle2,
  ArrowRight,
  Store,
} from 'lucide-react';

const EMPTY_PROFILE: StudentProfile = {
  id: '',
  role: 'student',
  studentNo: '',
  name: '',
  department: '',
  semester: '',
  avatar: DEFAULT_AVATAR_URL,
  points: 0,
  streakDays: 0,
  lastCheckInDate: null,
  lotteryTickets: 0,
  tronclassConnected: false,
  isLoggedIn: false,
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [rewardsSubTab, setRewardsSubTab] = useState<RewardsSubTab>('merchants');
  const [campusLifeSection, setCampusLifeSection] = useState<CampusLifeSection>('cafeteria');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [hasCheckedDailyPrompt, setHasCheckedDailyPrompt] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());

  // Core Application State persisted locally
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('cyut_profile');
    return saved ? JSON.parse(saved) : EMPTY_PROFILE;
  });

  const [merchants, setMerchants] = useState<MerchantStore[]>(() => {
    try {
      const saved = localStorage.getItem('cyut_merchants');
      if (!saved) return DEMO_MERCHANTS;
      const parsed = JSON.parse(saved) as MerchantStore[];
      if (!Array.isArray(parsed) || parsed.length === 0) return DEMO_MERCHANTS;
      const existingIds = new Set(parsed.map((m) => m.id));
      const missingDemo = DEMO_MERCHANTS.filter((dm) => !existingIds.has(dm.id));
      return missingDemo.length > 0 ? [...parsed, ...missingDemo] : parsed;
    } catch {
      return DEMO_MERCHANTS;
    }
  });

  const [merchantCoupons, setMerchantCoupons] = useState<MerchantCouponInventory[]>(() => {
    try {
      const saved = localStorage.getItem('cyut_merchant_coupons');
      if (!saved) return DEMO_MERCHANT_COUPONS;
      const parsed = JSON.parse(saved) as MerchantCouponInventory[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_MERCHANT_COUPONS;
    } catch {
      return DEMO_MERCHANT_COUPONS;
    }
  });

  const [redemptionLogs, setRedemptionLogs] = useState<MerchantRedemptionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cyut_redemption_logs');
      if (!saved) return DEMO_REDEMPTION_LOGS;
      const parsed = JSON.parse(saved) as MerchantRedemptionRecord[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_REDEMPTION_LOGS;
    } catch {
      return DEMO_REDEMPTION_LOGS;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('cyut_courses');
    return saved ? JSON.parse(saved) : [];
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('cyut_todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [issuedCouponsPool, setIssuedCouponsPool] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('cyut_issued_coupons_pool');
      if (!saved) return DEMO_COUPONS;
      const parsed = JSON.parse(saved) as Coupon[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_COUPONS;
    } catch {
      return DEMO_COUPONS;
    }
  });

  const [userCoupons, setUserCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('cyut_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  const [posts, setPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('cyut_posts');
    return saved ? JSON.parse(saved) : [];
  });

  const [repairTickets, setRepairTickets] = useState<RepairTicket[]>(() => {
    const saved = localStorage.getItem('cyut_repairs');
    return saved ? JSON.parse(saved) : [];
  });

  const [googleAccount, setGoogleAccount] = useState<GoogleAccountBinding | null>(() => {
    try {
      const saved =
        localStorage.getItem('cyut_google_account') ||
        localStorage.getItem('cyut_google_ai_account');
      return saved ? (JSON.parse(saved) as GoogleAccountBinding) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('cyut_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('cyut_merchants', JSON.stringify(merchants));
  }, [merchants]);

  useEffect(() => {
    localStorage.setItem('cyut_merchant_coupons', JSON.stringify(merchantCoupons));
  }, [merchantCoupons]);

  useEffect(() => {
    localStorage.setItem('cyut_redemption_logs', JSON.stringify(redemptionLogs));
  }, [redemptionLogs]);

  useEffect(() => {
    localStorage.setItem('cyut_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('cyut_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('cyut_coupons', JSON.stringify(userCoupons));
  }, [userCoupons]);

  useEffect(() => {
    localStorage.setItem('cyut_issued_coupons_pool', JSON.stringify(issuedCouponsPool));
  }, [issuedCouponsPool]);

  useEffect(() => {
    localStorage.setItem('cyut_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('cyut_repairs', JSON.stringify(repairTickets));
  }, [repairTickets]);

  useEffect(() => {
    localStorage.removeItem('cyut_gemini_api_key');
    localStorage.removeItem('cyut_google_ai_account');
    if (googleAccount) {
      localStorage.setItem('cyut_google_account', JSON.stringify(googleAccount));
    } else {
      localStorage.removeItem('cyut_google_account');
    }
  }, [googleAccount]);

  // Apply and persist System Settings (Dark/Light mode, Accent Theme, Font Scale, Notifications)
  useEffect(() => {
    applySettingsToDocument(settings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore quota errors
    }
  }, [settings]);

  // Class 15-minute reminder checker
  useEffect(() => {
    if (
      !profile.isLoggedIn ||
      profile.role === 'merchant' ||
      !settings.notifications.masterEnabled ||
      !settings.notifications.classReminder15m ||
      courses.length === 0
    ) {
      return;
    }

    const checkUpcomingClass = () => {
      const now = new Date();
      const jsDay = now.getDay(); // 0 Sun, 1 Mon..5 Fri
      if (jsDay < 1 || jsDay > 5) return;
      const nowMins = now.getHours() * 60 + now.getMinutes();

      for (const course of courses) {
        if (course.dayOfWeek !== jsDay) continue;
        const startMatch = course.timeRange.match(/^(\d{1,2}):(\d{2})/);
        if (!startMatch) continue;
        const startMins = Number(startMatch[1]) * 60 + Number(startMatch[2]);
        const diff = startMins - nowMins;
        if (diff >= 1 && diff <= 15) {
          const storageKey = `cyut_notified_${now.toISOString().split('T')[0]}_${course.id}`;
          if (!sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, '1');
            setToastMsg(
              `⏰ 上課提醒（${diff} 分鐘後）：${course.name} · ${startMatch[0]} @ 教室 ${course.classroom}`
            );
          }
          break;
        }
      }
    };

    checkUpcomingClass();
    const timer = window.setInterval(checkUpcomingClass, 60000);
    return () => window.clearInterval(timer);
  }, [
    profile.isLoggedIn,
    profile.role,
    courses,
    settings.notifications.masterEnabled,
    settings.notifications.classReminder15m,
  ]);

  // Daily Check-in Popup Trigger:
  // Fires once per app session after Splash finishes if student has NOT claimed today's points.
  // If user closes without claiming, lastCheckInDate remains unchanged so it pops up again next time the app opens.
  useEffect(() => {
    if (!showSplash && profile.isLoggedIn && profile.role === 'student' && !hasCheckedDailyPrompt) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (profile.lastCheckInDate !== todayStr) {
        setIsCheckInModalOpen(true);
      }
      setHasCheckedDailyPrompt(true);
    }
  }, [showSplash, profile.isLoggedIn, profile.role, profile.lastCheckInDate, hasCheckedDailyPrompt]);

  // Set default tab based on logged-in role
  useEffect(() => {
    if (
      profile.isLoggedIn &&
      profile.role === 'merchant' &&
      activeTab !== 'merchant-portal' &&
      activeTab !== 'rewards' &&
      activeTab !== 'transit' &&
      activeTab !== 'campus-life'
    ) {
      setActiveTab('merchant-portal');
    }
  }, [profile.isLoggedIn, profile.role, activeTab]);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenCouponLottery = () => {
    setRewardsSubTab('redeem-shop');
    setActiveTab('rewards');
  };

  // Developer Test Bypass ("root") for Student, Teacher, or Merchant
  const handleDevBypassLogin = (role: UserRole) => {
    setHasCheckedDailyPrompt(false);
    const mergedPool = (() => {
      const existingIds = new Set(issuedCouponsPool.map((c) => c.id));
      const missingDemo = DEMO_COUPONS.filter((dc) => !existingIds.has(dc.id));
      return missingDemo.length > 0 ? [...issuedCouponsPool, ...missingDemo] : issuedCouponsPool;
    })();
    setIssuedCouponsPool(mergedPool);

    if (role === 'student') {
      setProfile(DEMO_STUDENT);
      setCourses(DEMO_COURSES);
      setTodos(DEMO_TODOS);
      setUserCoupons(mergedPool);
      setPosts(DEMO_POSTS);
      setRepairTickets(DEMO_REPAIR_TICKETS);
      setActiveTab('overview');
      showNotification('已透過測試碼登入「學生模式」（初始點數 99,999 點）');
    } else if (role === 'teacher') {
      setProfile(DEMO_TEACHER);
      setCourses(DEMO_COURSES);
      setTodos(DEMO_TODOS);
      setUserCoupons(mergedPool);
      setPosts(DEMO_POSTS);
      setActiveTab('ai-tutor');
      showNotification('已透過測試碼登入「教師模式」（初始點數 99,999 點）');
    } else {
      setProfile(DEMO_MERCHANT_PROFILE);
      setUserCoupons(mergedPool);
      setMerchants((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const missingDemo = DEMO_MERCHANTS.filter((dm) => !existingIds.has(dm.id));
        return missingDemo.length > 0 ? [...prev, ...missingDemo] : prev;
      });
      if (!merchantCoupons.some((c) => c.storeId === 'store-jifeng-brunch')) {
        setMerchantCoupons((prev) => [...DEMO_MERCHANT_COUPONS, ...prev]);
      }
      if (!redemptionLogs.some((r) => r.storeId === 'store-jifeng-brunch')) {
        setRedemptionLogs((prev) => [...DEMO_REDEMPTION_LOGS, ...prev]);
      }
      setActiveTab('merchant-portal');
      showNotification('已透過測試碼登入「朝陽後門・吉峰手作早午餐」商家後台');
    }
  };

  const handleStudentLogin = (studentNo: string, name: string, dept: string) => {
    setHasCheckedDailyPrompt(false);
    setProfile({
      id: `std-${Date.now()}`,
      role: 'student',
      studentNo,
      name,
      department: dept,
      semester: '115 學年度第 1 學期',
      avatar: DEFAULT_AVATAR_URL,
      points: 99999,
      streakDays: 0,
      lastCheckInDate: null,
      lotteryTickets: 2,
      tronclassConnected: false,
      isLoggedIn: true,
    });
    setUserCoupons(issuedCouponsPool);
    setActiveTab('overview');
    showNotification(`歡迎登入，${name} 同學（已配發測試點數 99,999 點）`);
  };

  const handleTeacherLogin = (facultyNo: string, name: string, dept: string) => {
    setHasCheckedDailyPrompt(false);
    setProfile({
      id: `prof-${Date.now()}`,
      role: 'teacher',
      studentNo: facultyNo,
      name,
      department: dept,
      semester: '115 學年度第 1 學期',
      avatar: DEFAULT_AVATAR_URL,
      points: 99999,
      streakDays: 0,
      lastCheckInDate: null,
      lotteryTickets: 0,
      tronclassConnected: false,
      isLoggedIn: true,
    });
    setUserCoupons(issuedCouponsPool);
    setActiveTab('ai-tutor');
    showNotification(`歡迎登入，${name} 老師`);
  };

  const handleTeacherGoogleLogin = (email: string, name: string, dept: string) => {
    setHasCheckedDailyPrompt(false);
    const localPrefix = email.split('@')[0] || 't940218';
    const facultyId = /^[tT]/.test(localPrefix) ? localPrefix : `t_${localPrefix}`;
    setProfile({
      id: `prof-${Date.now()}`,
      role: 'teacher',
      studentNo: facultyId,
      name,
      department: dept,
      semester: '115 學年度第 1 學期',
      avatar: DEFAULT_AVATAR_URL,
      points: 99999,
      streakDays: 0,
      lastCheckInDate: null,
      lotteryTickets: 0,
      tronclassConnected: false,
      googleEmail: email,
      isLoggedIn: true,
    });
    setGoogleAccount({
      email,
      name,
      connectedAt: new Date().toLocaleDateString('zh-TW'),
    });
    setCourses(DEMO_COURSES);
    setTodos(DEMO_TODOS);
    setUserCoupons(issuedCouponsPool);
    setPosts(DEMO_POSTS);
    setActiveTab('ai-tutor');
    showNotification(`已透過 Google 帳號登入教師模式（${email}）`);
  };

  const handleMerchantLoginExisting = (merchant: MerchantStore) => {
    setHasCheckedDailyPrompt(false);
    setProfile({
      id: `merch-${Date.now()}`,
      role: 'merchant',
      studentNo: merchant.ownerEmail,
      name: merchant.name,
      department: `特約商家 · ${merchant.category}`,
      semester: merchant.plan,
      avatar: DEFAULT_AVATAR_URL,
      points: 99999,
      streakDays: 0,
      lastCheckInDate: null,
      lotteryTickets: 0,
      tronclassConnected: false,
      isLoggedIn: true,
      merchantStoreId: merchant.id,
    });
    setUserCoupons(issuedCouponsPool);
    setActiveTab('merchant-portal');
    showNotification(`歡迎回到商家後台：${merchant.name}`);
  };

  const handleMerchantRegisterAndPay = (newMerchant: Omit<MerchantStore, 'id' | 'updatedAt'>) => {
    const storeId = `store-${Date.now()}`;
    const createdStore: MerchantStore = {
      ...newMerchant,
      id: storeId,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setMerchants((prev) => [createdStore, ...prev]);
    setProfile({
      id: `merch-${Date.now()}`,
      role: 'merchant',
      studentNo: createdStore.ownerEmail,
      name: createdStore.name,
      department: `特約商家 · ${createdStore.category}`,
      semester: createdStore.plan,
      avatar: DEFAULT_AVATAR_URL,
      points: 99999,
      streakDays: 0,
      lastCheckInDate: null,
      lotteryTickets: 0,
      tronclassConnected: false,
      isLoggedIn: true,
      merchantStoreId: storeId,
    });
    setUserCoupons(issuedCouponsPool);
    setActiveTab('merchant-portal');
    showNotification(`付款成功！${createdStore.name} 已正式上架至學生市集`);
  };

  const handleUpdateMerchantStore = (updated: MerchantStore) => {
    setMerchants((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setProfile((prev) => ({ ...prev, name: updated.name }));
    showNotification('門市資訊已同步更新至學生市集');
  };

  const handleVerifyCouponCode = (
    rawCode: string,
    matchedCouponId?: string,
    channel: 'QR 掃碼核銷' | '券號手動核銷' = '券號手動核銷'
  ): { ok: boolean; message: string } => {
    const code = rawCode.trim().toUpperCase();
    const storeId = activeMerchantStore?.id || 'store-jifeng-brunch';

    if (!code || code.length < 4) {
      return { ok: false, message: '請輸入有效長度的優惠券序號（至少 4 碼）。' };
    }

    if (redemptionLogs.some((r) => r.couponCode.toUpperCase() === code)) {
      return { ok: false, message: `券號 ${code} 今日已核銷過，請勿重複兌換。` };
    }

    const storeCouponsList = merchantCoupons.filter((c) => c.storeId === storeId);
    const matchedInventory =
      (matchedCouponId && storeCouponsList.find((c) => c.id === matchedCouponId)) ||
      storeCouponsList.find((c) => code.startsWith(c.couponCodePrefix.toUpperCase()));

    const matchedUserCoupon =
      userCoupons.find((uc) => uc.code.toUpperCase() === code) ||
      issuedCouponsPool.find((uc) => uc.code.toUpperCase() === code);

    if (matchedInventory && !matchedInventory.isActive) {
      return {
        ok: false,
        message: `優惠券「${matchedInventory.title}」目前已暫停發放，無法核銷。`,
      };
    }

    if (!matchedInventory && !matchedUserCoupon && !/^(JF-|CYUT-|WAVE-|WUFENG-)/.test(code)) {
      return {
        ok: false,
        message: `查無對應本校合作券號「${code}」，請確認是否為 JF- 或 CYUT- 開頭之有效券號。`,
      };
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const sampleDepts = [
      '資工系三年級 · s11007***',
      '傳播系二年級 · s11109***',
      '休閒系四年級 · s10912***',
      '企管系三年級 · s11024***',
      '設計系二年級 · s11118***',
    ];
    const studentDeptMasked = sampleDepts[redemptionLogs.length % sampleDepts.length];
    const resolvedTitle =
      matchedInventory?.title || matchedUserCoupon?.title || '朝陽校園特約優惠券';

    const newLog: MerchantRedemptionRecord = {
      id: `rdm-${Date.now()}`,
      storeId,
      couponTitle: resolvedTitle,
      couponCode: code,
      studentDeptMasked,
      redeemedAt: `今日 ${hh}:${mm}`,
      channel,
    };

    setRedemptionLogs((prev) => [newLog, ...prev]);

    if (matchedInventory) {
      setMerchantCoupons((prev) =>
        prev.map((c) =>
          c.id === matchedInventory.id
            ? {
                ...c,
                redeemedToday: c.redeemedToday + 1,
                claimedCount: Math.max(c.claimedCount, c.redeemedToday + 1),
              }
            : c
        )
      );
    }

    if (matchedUserCoupon) {
      setUserCoupons((prev) =>
        prev.map((uc) => (uc.code.toUpperCase() === code ? { ...uc, isUsed: true } : uc))
      );
      setIssuedCouponsPool((prev) =>
        prev.map((uc) => (uc.code.toUpperCase() === code ? { ...uc, isUsed: true } : uc))
      );
    }

    showNotification(`核銷成功：${resolvedTitle}（${code}）`);
    return {
      ok: true,
      message: `核銷完成！「${resolvedTitle}」（${code}）已立即入帳至今日紀錄。`,
    };
  };

  const handleToggleMerchantCoupon = (couponId: string) => {
    setMerchantCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
    showNotification('已更新優惠券上架狀態');
  };

  const handleAddMerchantCoupon = (
    newCoupon: Omit<MerchantCouponInventory, 'id' | 'claimedCount' | 'redeemedToday'>
  ) => {
    const created: MerchantCouponInventory = {
      ...newCoupon,
      id: `mc-${Date.now()}`,
      claimedCount: 0,
      redeemedToday: 0,
    };
    setMerchantCoupons((prev) => [created, ...prev]);
    showNotification(`已發行新優惠券：${created.title}`);
  };

  const handleLogout = () => {
    setProfile(EMPTY_PROFILE);
    setCourses([]);
    setTodos([]);
    setUserCoupons([]);
    setPosts([]);
    setRepairTickets([]);
    setGoogleAccount(null);
    setHasCheckedDailyPrompt(false);
    setIsCheckInModalOpen(false);
    localStorage.removeItem('cyut_profile');
    localStorage.removeItem('cyut_courses');
    localStorage.removeItem('cyut_todos');
    localStorage.removeItem('cyut_coupons');
    localStorage.removeItem('cyut_posts');
    localStorage.removeItem('cyut_repairs');
    localStorage.removeItem('cyut_google_account');
    localStorage.removeItem('cyut_gemini_api_key');
    setActiveTab('overview');
    showNotification('已登出帳號，請選擇身分模式重新登入');
  };

  const handleGoogleSignIn = (account: GoogleAccountBinding) => {
    setGoogleAccount(account);
    setProfile((prev) => ({ ...prev, googleEmail: account.email }));
    showNotification(`已成功授權綁定 Google 帳號：${account.email}`);
  };

  const handleGoogleSignOut = () => {
    setGoogleAccount(null);
    setProfile((prev) => ({ ...prev, googleEmail: undefined }));
    showNotification('已解除 Google 帳號授權綁定');
  };

  const handleUpdatePassword = (newPassword: string) => {
    localStorage.setItem('cyut_account_password_hash', btoa(unescape(encodeURIComponent(newPassword))));
    showNotification('帳號登入密碼已更新完成');
  };

  const handleTestClassReminder = () => {
    const sample = courses[0] || DEMO_COURSES[0];
    const startTime = sample.timeRange.split('-')[0]?.trim() || '09:10';
    showNotification(
      `⏰ 課前 15 分鐘推播：${sample.name} · ${startTime} @ 教室 ${sample.classroom}`
    );
  };

  // Homework / task completion awards uniformly 5 points
  const handleToggleTodo = (todoId: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            setProfile((p) => ({ ...p, points: p.points + 5 }));
            showNotification('完成任務！獲得 +5 點數獎勵');
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const handleAddTodo = (newTodo: Omit<TodoItem, 'id' | 'completed'>) => {
    const item: TodoItem = {
      ...newTodo,
      pointsReward: 5,
      id: `todo-${Date.now()}`,
      completed: false,
    };
    setTodos((prev) => [item, ...prev]);
    showNotification('已新增任務至待辦清單');
  };

  // 7-day cycle check-in reward
  const handleCheckIn = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (profile.lastCheckInDate === todayStr) return;

    const cycleIndex = profile.streakDays % 7;
    const rewardPoints = CHECKIN_CYCLE_REWARDS[cycleIndex].points;

    setProfile((prev) => ({
      ...prev,
      points: prev.points + rewardPoints,
      streakDays: prev.streakDays + 1,
      lastCheckInDate: todayStr,
    }));
    setIsCheckInModalOpen(false);
    showNotification(`簽到成功！獲得第 ${cycleIndex + 1} 天獎勵 +${rewardPoints} 點`);
  };

  // Direct Coupon Exchange Mall: deduct exact costPoints and issue to wallet + merchant verification pool
  const handleRedeemCoupon = (template: LotteryCouponTemplate, costPoints: number): Coupon | null => {
    if (profile.points < costPoints) {
      showNotification(`點數不足，需要 ${costPoints.toLocaleString()} 點才能兌換`);
      return null;
    }

    const newCoupon: Coupon = {
      ...template,
      id: `redeemed-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: `CYUT-MALL-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: '2026-12-31',
      isUsed: false,
      isListedForSale: false,
    };

    setProfile((p) => ({ ...p, points: Math.max(0, p.points - costPoints) }));
    setUserCoupons((prev) => [newCoupon, ...prev]);
    setIssuedCouponsPool((prev) => [newCoupon, ...prev]);
    showNotification(`兌換成功：${newCoupon.title}（-${costPoints.toLocaleString()} 點）`);
    return newCoupon;
  };

  const handleGrantCoupon = (coupon: Coupon) => {
    setUserCoupons((prev) => [coupon, ...prev]);
    setIssuedCouponsPool((prev) => [coupon, ...prev]);
    showNotification(`領取成功！已將「${coupon.title}」存入我的票券`);
  };

  const handleAddPost = (
    newPost: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'comments'>
  ) => {
    const isTeacher = profile.role === 'teacher';
    const postItem: SocialPost = {
      ...newPost,
      authorId: isTeacher ? profile.id : newPost.authorId,
      authorName: isTeacher ? profile.name : newPost.authorName,
      authorDept: isTeacher ? profile.department : newPost.authorDept,
      isAnonymous: isTeacher ? false : newPost.isAnonymous,
      id: `post-${Date.now()}`,
      timestamp: '剛剛',
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
    };
    setPosts((prev) => [postItem, ...prev]);
    showNotification(isTeacher ? '已以教師實名成功發布貼文' : '貼文已成功發布');
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [
              ...p.comments,
              {
                id: `c-${Date.now()}`,
                author: profile.name || '朝陽同學',
                text,
                time: '剛剛',
              },
            ],
          };
        }
        return p;
      })
    );
    showNotification('留言已送出');
  };

  const handleSubmitRepair = (
    repair: Omit<RepairTicket, 'id' | 'timestamp' | 'status' | 'pointsAwarded'>
  ) => {
    const newTicket: RepairTicket = {
      ...repair,
      id: `rep-${Date.now()}`,
      status: 'processing',
      pointsAwarded: 50,
      timestamp: new Date().toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setRepairTickets((prev) => [newTicket, ...prev]);
    setProfile((p) => ({ ...p, points: p.points + 50 }));
    showNotification('報修通報已受理！獲得 +50 點獎勵');
  };

  const activeMerchantStore =
    merchants.find((m) => m.id === profile.merchantStoreId) ||
    merchants.find((m) => m.ownerEmail.toLowerCase() === profile.studentNo.toLowerCase()) ||
    merchants[0];

  // Show Splash Screen first (< 1.5s)
  if (showSplash) {
    return (
      <AnimatePresence>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </AnimatePresence>
    );
  }

  // Full-Screen 3-Role Auth Gateway before entering the APP
  if (!profile.isLoggedIn) {
    return (
      <AuthGateway
        existingMerchants={merchants}
        onStudentLogin={handleStudentLogin}
        onTeacherLogin={handleTeacherLogin}
        onTeacherGoogleLogin={handleTeacherGoogleLogin}
        onMerchantLoginExisting={handleMerchantLoginExisting}
        onMerchantRegisterAndPay={handleMerchantRegisterAndPay}
        onDevBypassLogin={handleDevBypassLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col pb-20 lg:pb-12 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        profile={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Left Frosted Glass Expansion Drawer Menu */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        activeLifeSection={campusLifeSection}
        onSelectTab={setActiveTab}
        onSelectCampusSystem={(sec) => {
          setCampusLifeSection(sec);
          setActiveTab('campus-life');
        }}
        onOpenCouponLottery={handleOpenCouponLottery}
        onOpenSettings={() => setIsSettingsOpen(true)}
        profile={profile}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'merchant-portal' && activeMerchantStore && (
            <motion.div
              key="merchant-portal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MerchantDashboard
                store={activeMerchantStore}
                coupons={merchantCoupons}
                issuedCoupons={issuedCouponsPool}
                redemptionLogs={redemptionLogs}
                onUpdateStore={handleUpdateMerchantStore}
                onVerifyCouponCode={handleVerifyCouponCode}
                onToggleCouponActive={handleToggleMerchantCoupon}
                onAddCoupon={handleAddMerchantCoupon}
                onPreviewMarketplace={() => setActiveTab('rewards')}
              />
            </motion.div>
          )}

          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              <NetflixHeroBillboard
                profile={profile}
                courses={courses}
                todos={todos}
                onNavigate={setActiveTab}
                onOpenCheckIn={() => setIsCheckInModalOpen(true)}
                onOpenCouponLottery={handleOpenCouponLottery}
              />

              {/* Row 1: Weekly Classes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span>本週課表 · 隨點隨看</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('academic')}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition"
                  >
                    <span>檢視完整課表</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto netflix-scrollbar pb-3">
                  {courses.length === 0 ? (
                    <div className="p-8 text-center w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                      尚無課表資料，可前往「課表與任務」下方連結 Tronclass Token 同步課表。
                    </div>
                  ) : (
                    courses.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setActiveTab('academic')}
                        className="w-72 md:w-80 shrink-0 p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-[#1A2234] border border-slate-200 dark:border-slate-800 hover:border-accent cursor-pointer transition-all hover:scale-[1.02] shadow-sm dark:shadow-lg group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-xs font-bold"
                            style={{ color: c.color }}
                          >
                            週{['一', '二', '三', '四', '五'][c.dayOfWeek - 1]}
                          </span>
                          <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                            {c.classroom}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-accent transition truncate">
                          {c.name}
                        </h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {c.professor} · {c.building}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-mono tabular-nums">{c.timeRange}</span>
                          <span className="text-slate-500">
                            第 {c.startPeriod}-{c.endPeriod} 節
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Row 2: 3D Campus Buildings */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-accent" />
                    <span>3D 校園主要建築</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('campus-3d')}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition"
                  >
                    <span>進入 3D 地圖</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto netflix-scrollbar pb-3">
                  {CYUT_BUILDINGS.map((bldg) => (
                    <div
                      key={bldg.id}
                      onClick={() => setActiveTab('campus-3d')}
                      className="w-64 md:w-72 shrink-0 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-accent cursor-pointer transition-all hover:scale-[1.02] shadow-sm dark:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs font-bold font-mono"
                          style={{ color: bldg.color }}
                        >
                          {bldg.code} 大樓
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {bldg.floors} 層
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                        {bldg.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {bldg.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Partner Merchants Highlight */}
              {profile.role !== 'merchant' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-accent" />
                      <span>朝陽特約合作商家</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('rewards')}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition"
                    >
                      <span>前往學生市集</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {merchants
                      .filter((m) => m.paid)
                      .slice(0, 3)
                      .map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setActiveTab('rewards')}
                          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-accent cursor-pointer transition shadow-sm dark:shadow-lg"
                        >
                          <div className="text-xs text-slate-500 dark:text-slate-400">{m.category}</div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{m.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{m.address}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'academic' && (
            <motion.div
              key="academic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AcademicHub
                courses={courses}
                todos={todos}
                tronclassConnected={profile.tronclassConnected}
                tronclassToken={profile.tronclassToken}
                onUpdateTronclassToken={(token) => {
                  setProfile((p) => ({ ...p, tronclassConnected: true, tronclassToken: token }));
                  showNotification('Tronclass Token 連線成功');
                }}
                onToggleTodo={handleToggleTodo}
                onAddTodo={handleAddTodo}
              />
            </motion.div>
          )}

          {activeTab === 'ai-tutor' && (
            <motion.div
              key="ai-tutor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AITutorView
                role={profile.role}
                profileName={profile.name}
                studentNo={profile.studentNo}
                googleAccount={googleAccount}
                onGoogleSignIn={handleGoogleSignIn}
                onGoogleSignOut={handleGoogleSignOut}
              />
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RewardsMarketHub
                profile={profile}
                merchants={merchants}
                cafeteriaList={DEMO_CAFETERIA}
                userCoupons={userCoupons}
                initialSubTab={rewardsSubTab}
                onSubTabChange={setRewardsSubTab}
                onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
                onRedeemCoupon={handleRedeemCoupon}
                onGrantCoupon={handleGrantCoupon}
              />
            </motion.div>
          )}

          {activeTab === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SocialHub
                profile={profile}
                posts={posts}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
              />
            </motion.div>
          )}

          {activeTab === 'campus-life' && (
            <motion.div
              key="campus-life"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CampusLifeHub
                profile={profile}
                activeSection={campusLifeSection}
                onSelectSection={setCampusLifeSection}
                onBackHome={() =>
                  setActiveTab(profile.role === 'merchant' ? 'merchant-portal' : 'overview')
                }
                onOpenTransit={() => setActiveTab('transit')}
                cafeteriaList={DEMO_CAFETERIA}
                lockers={DEMO_LOCKERS}
                leaveRecords={DEMO_LEAVE_RECORDS}
                repairTickets={repairTickets}
                onSubmitRepair={handleSubmitRepair}
                onOpen3DMap={() => setActiveTab('campus-3d')}
              />
            </motion.div>
          )}

          {/* 3D Map Page: Top Big Title REMOVED, description text placed BELOW canvas */}
          {activeTab === 'campus-3d' && (
            <motion.div
              key="campus-3d"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <Campus3DMap />
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center px-2">
                高角度俯視全校 10 棟主要建築配置，點選任一大樓即可展開 3D 樓層透視剖面，自由旋轉縮放檢視各樓層教室與系所空間。
              </p>
            </motion.div>
          )}

          {/* Public Transit System (Accessible via Top-Left Logo Drawer Menu) */}
          {activeTab === 'transit' && (
            <motion.div
              key="transit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PublicTransitHub
                busRoutes={DEMO_BUS_ROUTES}
                shuttleSchedules={DEMO_SHUTTLE_SCHEDULES}
                transferGuides={DEMO_TRANSFER_GUIDES}
                onBackHome={() =>
                  setActiveTab(profile.role === 'merchant' ? 'merchant-portal' : 'overview')
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid items-center h-16 px-1 ${
          profile.role === 'merchant' ? 'grid-cols-2' : 'grid-cols-6'
        }`}
      >
        {profile.role === 'merchant' ? (
          <>
            <button
              onClick={() => setActiveTab('merchant-portal')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'merchant-portal'
                  ? 'text-accent'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">商家後台</span>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'rewards' ? 'text-accent' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">市集</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'overview' ? 'text-accent' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">總覽</span>
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'academic' ? 'text-accent' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">課表</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-tutor')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'ai-tutor' ? 'text-accent' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">
                {profile.role === 'teacher' ? '教師AI' : 'AI導師'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'rewards' ? 'text-accent' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">市集</span>
            </button>
            <button
              onClick={() => setActiveTab('campus-3d')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'campus-3d' ? 'text-accent' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">3D地圖</span>
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'social' ? 'text-accent' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">社群</span>
            </button>
          </>
        )}
      </nav>

      {/* Daily Check-In Modal (Re-prompts next open if closed without claiming) */}
      <DailyCheckInModal
        isOpen={isCheckInModalOpen}
        profile={profile}
        onClaim={handleCheckIn}
        onCloseWithoutClaim={() => setIsCheckInModalOpen(false)}
      />

      {/* Account Info / Switch Role Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        profile={profile}
        onLogout={handleLogout}
      />

      {/* System Settings Center Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        settings={settings}
        googleAccount={googleAccount}
        onUpdateSettings={setSettings}
        onLogout={handleLogout}
        onUpdatePassword={handleUpdatePassword}
        onUpdateTronclassToken={(token) => {
          setProfile((p) => ({ ...p, tronclassConnected: true, tronclassToken: token }));
          showNotification('Tronclass Token 連線成功');
        }}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onTestClassReminder={handleTestClassReminder}
      />

      <OfflineIndicator />

      {/* Global Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-accent-soft px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
