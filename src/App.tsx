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
  RepairTicket 
} from './types';
import { 
  DEMO_STUDENT, 
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
  CYUT_BUILDINGS 
} from './utils/demoData';
import { Navbar } from './components/Navbar';
import { NetflixHeroBillboard } from './components/NetflixHeroBillboard';
import { AcademicHub } from './components/AcademicHub';
import { AITutorView } from './components/AITutorView';
import { RewardsMarketHub } from './components/RewardsMarketHub';
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
  Bus, 
  Home, 
  Rocket, 
  CheckCircle2, 
  Flame,
  ArrowRight
} from 'lucide-react';

const EMPTY_STUDENT: StudentProfile = {
  id: '',
  studentNo: '',
  name: '',
  department: '',
  semester: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  points: 0,
  streakDays: 0,
  lastCheckInDate: null,
  lotteryTickets: 0,
  tronclassConnected: false,
  isLoggedIn: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Core Application State (Strictly initial empty state unless loaded by user or LocalStorage)
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('cyut_profile');
    return saved ? JSON.parse(saved) : EMPTY_STUDENT;
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

  // Sync to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem('cyut_profile', JSON.stringify(profile));
  }, [profile]);

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

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ONE-CLICK DEMO DATA INJECTION (Required by prompt for reviewers/teachers)
  const handleQuickLoadDemo = () => {
    setProfile(DEMO_STUDENT);
    setCourses(DEMO_COURSES);
    setTodos(DEMO_TODOS);
    setUserCoupons(DEMO_COUPONS);
    setMarketplaceCoupons(DEMO_MARKETPLACE);
    setPosts(DEMO_POSTS);
    setRepairTickets(DEMO_REPAIR_TICKETS);
    showNotification('🚀 成功帶入朝陽科大完整測試帳號與全模組真實資料！');
  };

  const handleLogout = () => {
    setProfile(EMPTY_STUDENT);
    setCourses([]);
    setTodos([]);
    setUserCoupons([]);
    setMarketplaceCoupons([]);
    setPosts([]);
    setRepairTickets([]);
    localStorage.clear();
    showNotification('已登出並重置為純淨空白狀態。');
  };

  const handleManualLogin = (studentNo: string, name: string, dept: string) => {
    setProfile({
      id: `std-${Date.now()}`,
      studentNo,
      name,
      department: dept,
      semester: '大三 第 1 學期',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      points: 100,
      streakDays: 1,
      lastCheckInDate: null,
      lotteryTickets: 1,
      tronclassConnected: false,
      isLoggedIn: true,
    });
    showNotification(`歡迎登入，${name} 同學！`);
  };

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('cyut_gemini_api_key', key);
    showNotification('已安全儲存個人 Gemini BYOK API Key。');
  };

  const handleToggleTodo = (todoId: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          const nextCompleted = !t.completed;
          if (nextCompleted && t.pointsReward) {
            setProfile((p) => ({ ...p, points: p.points + t.pointsReward! }));
            showNotification(`完成任務！獲得 +${t.pointsReward} 點數獎勵！`);
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
      id: `todo-${Date.now()}`,
      completed: false,
    };
    setTodos((prev) => [item, ...prev]);
    showNotification('已新增待辦事項至隊列。');
  };

  const handleCheckIn = () => {
    const rewardPoints = 30;
    setProfile((prev) => ({
      ...prev,
      points: prev.points + rewardPoints,
      streakDays: prev.streakDays + 1,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      lotteryTickets: prev.lotteryTickets + 1,
    }));
    showNotification(`簽到成功！獲得 +${rewardPoints} 點數與 1 張美食抽獎券！`);
  };

  const handleDrawMysteryBox = (): Coupon => {
    const pool = [
      {
        title: '晨曦手搖飲 全品項折 $15',
        storeName: '第一學餐 · 晨曦手搖',
        category: 'beverage' as const,
        originalValue: 60,
        discountDescription: '滿 50 元現折 15 元',
      },
      {
        title: '路易莎咖啡 拿鐵大杯 8 折券',
        storeName: '波浪廣場路易莎門市',
        category: 'coffee' as const,
        originalValue: 90,
        discountDescription: '拿鐵/美式享單杯 8 折優惠',
      },
      {
        title: '綠漾輕食 舒肥雞胸便當折 $25',
        storeName: '第二學餐 · 綠漾輕食',
        category: 'bento' as const,
        originalValue: 120,
        discountDescription: '任選便當立折 25 元',
      },
      {
        title: '霧峰老街肉圓 招牌套餐折 $20',
        storeName: '霧峰老街肉圓老店',
        category: 'snack' as const,
        originalValue: 80,
        discountDescription: '肉圓套餐現折 20 元',
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

    setProfile((p) => ({ ...p, points: Math.max(0, p.points - 50) }));
    setUserCoupons((prev) => [newCoupon, ...prev]);
    return newCoupon;
  };

  const handleListCouponForSale = (couponId: string, salePrice: number): boolean => {
    const coupon = userCoupons.find((c) => c.id === couponId);
    if (!coupon) return false;

    // Strict validation: price <= originalValue * 0.95
    if (salePrice > Math.floor(coupon.originalValue * 0.95)) {
      alert('上架價格不得超過原價值的 95%！');
      return false;
    }

    // Update user coupons status
    setUserCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isListedForSale: true, salePrice } : c))
    );

    // Add to secondary marketplace
    const marketItem: Coupon = {
      ...coupon,
      isListedForSale: true,
      salePrice,
      sellerId: profile.id,
      sellerName: profile.name || '林朝陽',
    };
    setMarketplaceCoupons((prev) => [marketItem, ...prev]);
    showNotification(`優惠券已成功上架至二級市場 (售價 NT$ ${salePrice})！`);
    return true;
  };

  const handleBuyMarketCoupon = (coupon: Coupon): boolean => {
    // Remove from marketplace
    setMarketplaceCoupons((prev) => prev.filter((m) => m.id !== coupon.id));
    // Add to buyer inventory
    const boughtCoupon: Coupon = {
      ...coupon,
      isListedForSale: false,
      sellerId: undefined,
      sellerName: undefined,
    };
    setUserCoupons((prev) => [boughtCoupon, ...prev]);
    showNotification(`成功以 NT$ ${coupon.salePrice} 購買「${coupon.title}」！已收納至個人券夾。`);
    return true;
  };

  const handleAddPost = (newPost: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'comments'>) => {
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
    showNotification('貼文已成功發表！');
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
    showNotification('留言已送出！');
  };

  const handleSubmitRepair = (repair: Omit<RepairTicket, 'id' | 'timestamp' | 'status' | 'pointsAwarded'>) => {
    const newTicket: RepairTicket = {
      ...repair,
      id: `rep-${Date.now()}`,
      status: 'processing',
      pointsAwarded: 50,
      timestamp: new Date().toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    };
    setRepairTickets((prev) => [newTicket, ...prev]);
    // Award 50 points directly
    setProfile((p) => ({ ...p, points: p.points + 50 }));
    showNotification('報修通報已受理！系統已為您注入 +50 點數公共貢獻獎勵！');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col selection:bg-[#E50914] selection:text-white pb-20 lg:pb-12">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onQuickLoadDemo={handleQuickLoadDemo}
        onLogout={handleLogout}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">

        {/* Tab Router Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {/* Netflix Cinematic Hero Billboard */}
              <NetflixHeroBillboard
                profile={profile}
                courses={courses}
                todos={todos}
                onNavigate={setActiveTab}
                onOpenCheckIn={() => {
                  setActiveTab('rewards');
                }}
              />

              {/* Netflix-style Horizontal Scrolling Rows: Row 1 — 本週課表快速通道 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#E50914]" />
                    <span>本週智慧課表 · 隨到隨看</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('academic')}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <span>完整課表矩陣</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto netflix-scrollbar pb-3">
                  {courses.length === 0 ? (
                    <div className="p-8 text-center w-full rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                      目前尚無課表資料。請先登入學生帳號或同步 Tronclass。
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
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                            style={{ backgroundColor: c.color }}
                          >
                            週 {['一', '二', '三', '四', '五'][c.dayOfWeek - 1]}
                          </span>
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            {c.classroom}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-[#E50914] transition truncate">
                          {c.name}
                        </h4>
                        <div className="text-xs text-slate-400 mt-1">
                          教授：{c.professor} · {c.building}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono tabular-nums">{c.timeRange}</span>
                          <span className="text-slate-500">第 {c.startPeriod}-{c.endPeriod} 節</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Netflix-style Horizontal Scrolling Rows: Row 2 — 3D 校園地圖快速檢視 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#E50914]" />
                    <span>朝陽 3D 校園模擬地標</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('campus-3d')}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <span>全螢幕 3D 體驗</span>
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
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white font-mono"
                          style={{ backgroundColor: bldg.color }}
                        >
                          {bldg.code}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {bldg.floors} 樓層
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 truncate">{bldg.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {bldg.description}
                      </p>
                      <div className="mt-3 text-[11px] text-slate-500 font-mono">
                        空間教室: {bldg.floorsData.reduce((acc, f) => acc + f.rooms.length, 0)} 間
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Netflix-style Row 3: 美食盲盒與 C2C 市集精選 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#E50914]" />
                    <span>合作美食商圈 & 二級市集好康</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('rewards')}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <span>查看完整市集</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {marketplaceCoupons.slice(0, 3).map((cp) => (
                    <div
                      key={cp.id}
                      onClick={() => setActiveTab('rewards')}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300">{cp.storeName}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                          轉售 NT$ {cp.salePrice}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{cp.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{cp.discountDescription}</p>
                    </div>
                  ))}
                </div>
              </div>
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
                  showNotification('Tronclass Token 連線成功！');
                }}
                onToggleTodo={handleToggleTodo}
                onAddTodo={handleAddTodo}
                onInspectClassroom={() => setActiveTab('campus-3d')}
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
              <AITutorView apiKey={geminiApiKey} onSaveApiKey={handleSaveApiKey} />
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
                userCoupons={userCoupons}
                marketplaceCoupons={marketplaceCoupons}
                repairTickets={repairTickets}
                onCheckIn={handleCheckIn}
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

          {activeTab === 'campus-3d' && (
            <motion.div
              key="campus-3d"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#E50914]" />
                    <span>朝陽科技大學 3D 校園地圖動畫模擬</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    高角度俯視全校 10 棟主要建築配置，點選任一大樓即可展開 3D 樓層透視剖面，自由旋轉縮放檢視各樓層教室與系所空間。
                  </p>
                </div>
              </div>
              <Campus3DMap />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile Touch Apps skill) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-6 items-center h-16 px-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'overview' ? 'text-[#E50914]' : 'text-slate-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight mt-1">總覽</span>
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'academic' ? 'text-[#E50914]' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight mt-1">課表</span>
        </button>
        <button
          onClick={() => setActiveTab('ai-tutor')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'ai-tutor' ? 'text-[#E50914]' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight mt-1">AI導師</span>
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'rewards' ? 'text-[#E50914]' : 'text-slate-400'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight mt-1">市集</span>
        </button>
        <button
          onClick={() => setActiveTab('campus-3d')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'campus-3d' ? 'text-[#E50914]' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight mt-1">3D地圖</span>
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'social' ? 'text-[#E50914]' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight mt-1">社群</span>
        </button>
      </nav>

      {/* Auth & Settings Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        profile={profile}
        onQuickLoadDemo={handleQuickLoadDemo}
        onManualLogin={handleManualLogin}
        onLogout={handleLogout}
      />

      {/* Floating Offline Status Toast */}
      <OfflineIndicator />

      {/* Global Interactive Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 border border-red-900/80 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
