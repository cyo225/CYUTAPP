/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  NavigationTab,
  StudentProfile,
  Course,
  TodoItem,
  Coupon,
  SocialPost,
  RepairTicket,
  MerchantStore,
  UserRole,
} from './types';
import {
  CHECKIN_CYCLE_REWARDS,
  DEFAULT_AVATAR_URL,
  DEMO_STUDENT,
  DEMO_TEACHER,
  DEMO_MERCHANT_PROFILE,
  DEMO_MERCHANTS,
  DEMO_COURSES,
  DEMO_TODOS,
  DEMO_COUPONS,
  DEMO_MARKETPLACE,
  DEMO_POSTS,
  DEMO_BUS_ROUTES,
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
import { NetflixHeroBillboard } from './components/NetflixHeroBillboard';
import { AcademicHub } from './components/AcademicHub';
import { AITutorView } from './components/AITutorView';
import { RewardsMarketHub } from './components/RewardsMarketHub';
import { MerchantDashboard } from './components/MerchantDashboard';
import { SocialHub } from './components/SocialHub';
import { CampusLifeHub } from './components/CampusLifeHub';
import { Campus3DMap } from './components/Campus3DMap';
import { AuthModal } from './components/AuthModal';
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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [hasCheckedDailyPrompt, setHasCheckedDailyPrompt] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Core Application State persisted locally
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('cyut_profile');
    return saved ? JSON.parse(saved) : EMPTY_PROFILE;
  });

  const [merchants, setMerchants] = useState<MerchantStore[]>(() => {
    const saved = localStorage.getItem('cyut_merchants');
    return saved ? JSON.parse(saved) : DEMO_MERCHANTS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('cyut_courses');
    return saved ? JSON.parse(saved) : [];
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('cyut_todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [userCoupons, setUserCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('cyut_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  const [marketplaceCoupons, setMarketplaceCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('cyut_market');
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

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('cyut_gemini_api_key') || '';
  });

  useEffect(() => {
    localStorage.setItem('cyut_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('cyut_merchants', JSON.stringify(merchants));
  }, [merchants]);

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
    localStorage.setItem('cyut_market', JSON.stringify(marketplaceCoupons));
  }, [marketplaceCoupons]);

  useEffect(() => {
    localStorage.setItem('cyut_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('cyut_repairs', JSON.stringify(repairTickets));
  }, [repairTickets]);

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
    if (profile.isLoggedIn && profile.role === 'merchant' && activeTab !== 'merchant-portal' && activeTab !== 'rewards') {
      setActiveTab('merchant-portal');
    }
  }, [profile.isLoggedIn, profile.role, activeTab]);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Developer Test Bypass ("tkr1026") for Student, Teacher, or Merchant
  const handleDevBypassLogin = (role: UserRole) => {
    setHasCheckedDailyPrompt(false);
    if (role === 'student') {
      setProfile(DEMO_STUDENT);
      setCourses(DEMO_COURSES);
      setTodos(DEMO_TODOS);
      setUserCoupons(DEMO_COUPONS);
      setMarketplaceCoupons(DEMO_MARKETPLACE);
      setPosts(DEMO_POSTS);
      setRepairTickets(DEMO_REPAIR_TICKETS);
      setActiveTab('overview');
      showNotification('已透過開發者測試碼登入「學生模式」');
    } else if (role === 'teacher') {
      setProfile(DEMO_TEACHER);
      setCourses(DEMO_COURSES);
      setTodos(DEMO_TODOS);
      setPosts(DEMO_POSTS);
      setActiveTab('ai-tutor');
      showNotification('已透過開發者測試碼登入「教師模式」');
    } else {
      setProfile(DEMO_MERCHANT_PROFILE);
      if (!merchants.some((m) => m.id === DEMO_MERCHANT_PROFILE.merchantStoreId)) {
        setMerchants((prev) => [...DEMO_MERCHANTS, ...prev]);
      }
      setActiveTab('merchant-portal');
      showNotification('已透過開發者測試碼登入「商家模式」');
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
      points: 0,
      streakDays: 0,
      lastCheckInDate: null,
      lotteryTickets: 0,
      tronclassConnected: false,
      isLoggedIn: true,
    });
    setActiveTab('overview');
    showNotification(`歡迎登入，${name} 同學`);
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
      points: 0,
      streakDays: 0,
      lastCheckInDate: null,
      lotteryTickets: 0,
      tronclassConnected: false,
      isLoggedIn: true,
    });
    setActiveTab('ai-tutor');
    showNotification(`歡迎登入，${name} 老師`);
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
      points: 0,
      streakDays: 0,
      lastCheckInDate: null,
      lotteryTickets: 0,
      tronclassConnected: false,
      isLoggedIn: true,
      merchantStoreId: merchant.id,
    });
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
      points: 0,
      streakDays: 0,
      lastCheckInDate: null,
      lotteryTickets: 0,
      tronclassConnected: false,
      isLoggedIn: true,
      merchantStoreId: storeId,
    });
    setActiveTab('merchant-portal');
    showNotification(`付款成功！${createdStore.name} 已正式上架至學生市集`);
  };

  const handleUpdateMerchantStore = (updated: MerchantStore) => {
    setMerchants((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setProfile((prev) => ({ ...prev, name: updated.name }));
    showNotification('門市資訊已同步更新至學生市集');
  };

  const handleLogout = () => {
    setProfile(EMPTY_PROFILE);
    setCourses([]);
    setTodos([]);
    setUserCoupons([]);
    setMarketplaceCoupons([]);
    setPosts([]);
    setRepairTickets([]);
    setHasCheckedDailyPrompt(false);
    setIsCheckInModalOpen(false);
    localStorage.removeItem('cyut_profile');
    localStorage.removeItem('cyut_courses');
    localStorage.removeItem('cyut_todos');
    localStorage.removeItem('cyut_coupons');
    localStorage.removeItem('cyut_market');
    localStorage.removeItem('cyut_posts');
    localStorage.removeItem('cyut_repairs');
    setActiveTab('overview');
    showNotification('已登出帳號，請選擇身分模式重新登入');
  };

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('cyut_gemini_api_key', key);
    showNotification('已安全儲存 Gemini BYOK API Key');
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

  // Lottery draw threshold: 2000 points
  const handleDrawMysteryBox = (): Coupon => {
    const pool = [
      {
        title: '晨曦手搖飲 全品項折 $20',
        storeName: '晨曦手作黑糖波霸專賣',
        category: 'beverage' as const,
        originalValue: 65,
        discountDescription: '滿 50 元現折 20 元',
      },
      {
        title: '晨光精品拿鐵 買一送一券',
        storeName: '波浪廣場 · 晨光精品咖啡',
        category: 'coffee' as const,
        originalValue: 110,
        discountDescription: '大杯拿鐵/美式享買一送一',
      },
      {
        title: '綠漾健康舒肥餐盒折 $30',
        storeName: '綠漾健康舒肥輕食餐盒',
        category: 'bento' as const,
        originalValue: 130,
        discountDescription: '任選餐盒立折 30 元',
      },
      {
        title: '霧峰老街肉圓 雙人套餐折 $25',
        storeName: '霧峰老街傳承肉圓',
        category: 'snack' as const,
        originalValue: 100,
        discountDescription: '消費滿百現折 25 元',
      },
    ];

    const pick = pool[Math.floor(Math.random() * pool.length)];
    const newCoupon: Coupon = {
      ...pick,
      id: `drawn-${Date.now()}`,
      code: `CYUT-BOX-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: '2026-12-31',
      isUsed: false,
      isListedForSale: false,
    };

    setProfile((p) => ({ ...p, points: Math.max(0, p.points - 2000) }));
    setUserCoupons((prev) => [newCoupon, ...prev]);
    return newCoupon;
  };

  const handleListCouponForSale = (couponId: string, salePrice: number): boolean => {
    const coupon = userCoupons.find((c) => c.id === couponId);
    if (!coupon) return false;

    if (salePrice > Math.floor(coupon.originalValue * 0.95)) {
      return false;
    }

    setUserCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isListedForSale: true, salePrice } : c))
    );

    const marketItem: Coupon = {
      ...coupon,
      isListedForSale: true,
      salePrice,
      sellerId: profile.id,
      sellerName: profile.name || '朝陽同學',
    };
    setMarketplaceCoupons((prev) => [marketItem, ...prev]);
    showNotification(`優惠券已上架至二級市集 (NT$ ${salePrice})`);
    return true;
  };

  const handleBuyMarketCoupon = (coupon: Coupon): boolean => {
    setMarketplaceCoupons((prev) => prev.filter((m) => m.id !== coupon.id));
    const boughtCoupon: Coupon = {
      ...coupon,
      isListedForSale: false,
      sellerId: undefined,
      sellerName: undefined,
    };
    setUserCoupons((prev) => [boughtCoupon, ...prev]);
    showNotification(`已收藏「${coupon.title}」至我的優惠券`);
    return true;
  };

  const handleAddPost = (
    newPost: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'comments'>
  ) => {
    const postItem: SocialPost = {
      ...newPost,
      id: `post-${Date.now()}`,
      timestamp: '剛剛',
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
    };
    setPosts((prev) => [postItem, ...prev]);
    showNotification('貼文已成功發布');
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
        onMerchantLoginExisting={handleMerchantLoginExisting}
        onMerchantRegisterAndPay={handleMerchantRegisterAndPay}
        onDevBypassLogin={handleDevBypassLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col selection:bg-[#E50914] selection:text-white pb-20 lg:pb-12">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
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
                onUpdateStore={handleUpdateMerchantStore}
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
              />

              {/* Row 1: Weekly Classes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#E50914]" />
                    <span>本週課表 · 隨點隨看</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('academic')}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <span>檢視完整課表</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto netflix-scrollbar pb-3">
                  {courses.length === 0 ? (
                    <div className="p-8 text-center w-full rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                      尚無課表資料，可前往「課表與任務」下方連結 Tronclass Token 同步課表。
                    </div>
                  ) : (
                    courses.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setActiveTab('academic')}
                        className="w-72 md:w-80 shrink-0 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1A2234] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-xs font-bold"
                            style={{ color: c.color }}
                          >
                            週{['一', '二', '三', '四', '五'][c.dayOfWeek - 1]}
                          </span>
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            {c.classroom}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-[#E50914] transition truncate">
                          {c.name}
                        </h4>
                        <div className="text-xs text-slate-400 mt-1">
                          {c.professor} · {c.building}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
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
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#E50914]" />
                    <span>3D 校園主要建築</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('campus-3d')}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
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
                      className="w-64 md:w-72 shrink-0 p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-900/60 cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs font-bold font-mono"
                          style={{ color: bldg.color }}
                        >
                          {bldg.code} 大樓
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {bldg.floors} 層
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 truncate">{bldg.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
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
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#E50914]" />
                      <span>朝陽特約合作商家</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('rewards')}
                      className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
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
                          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition shadow-lg"
                        >
                          <div className="text-xs text-slate-400">{m.category}</div>
                          <h4 className="text-sm font-bold text-white mt-0.5">{m.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 truncate">{m.address}</p>
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
                apiKey={geminiApiKey}
                onSaveApiKey={handleSaveApiKey}
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
                userCoupons={userCoupons}
                marketplaceCoupons={marketplaceCoupons}
                repairTickets={repairTickets}
                onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
                onDrawMysteryBox={handleDrawMysteryBox}
                onListCouponForSale={handleListCouponForSale}
                onBuyMarketCoupon={handleBuyMarketCoupon}
                onNavigateToRepair={() => setActiveTab('campus-life')}
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
                busRoutes={DEMO_BUS_ROUTES}
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
              <p className="text-xs text-slate-400 text-center px-2">
                高角度俯視全校 10 棟主要建築配置，點選任一大樓即可展開 3D 樓層透視剖面，自由旋轉縮放檢視各樓層教室與系所空間。
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 grid items-center h-16 px-1 ${
          profile.role === 'merchant' ? 'grid-cols-2' : 'grid-cols-6'
        }`}
      >
        {profile.role === 'merchant' ? (
          <>
            <button
              onClick={() => setActiveTab('merchant-portal')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'merchant-portal' ? 'text-[#E50914]' : 'text-slate-400'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">商家後台</span>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'rewards' ? 'text-[#E50914]' : 'text-slate-400'
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
                activeTab === 'overview' ? 'text-[#E50914]' : 'text-slate-400'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">總覽</span>
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'academic' ? 'text-[#E50914]' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">課表</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-tutor')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'ai-tutor' ? 'text-[#E50914]' : 'text-slate-400'
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
                activeTab === 'rewards' ? 'text-[#E50914]' : 'text-slate-400'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">市集</span>
            </button>
            <button
              onClick={() => setActiveTab('campus-3d')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'campus-3d' ? 'text-[#E50914]' : 'text-slate-400'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="text-[10px] font-medium mt-1">3D地圖</span>
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex flex-col items-center justify-center py-1 transition ${
                activeTab === 'social' ? 'text-[#E50914]' : 'text-slate-400'
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

      <OfflineIndicator />

      {/* Global Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 border border-red-900/80 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
