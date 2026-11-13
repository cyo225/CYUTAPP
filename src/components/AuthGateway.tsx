import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MerchantPlan, MerchantStore, UserRole } from '../types';
import {
  GraduationCap,
  BookOpenCheck,
  Store,
  AlertCircle,
  Terminal,
  X,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  ImagePlus,
  Mail,
} from 'lucide-react';

interface AuthGatewayProps {
  existingMerchants: MerchantStore[];
  onStudentLogin: (studentNo: string, name: string, dept: string) => void;
  onTeacherLogin: (facultyNo: string, name: string, dept: string) => void;
  onMerchantLoginExisting: (merchant: MerchantStore) => void;
  onMerchantRegisterAndPay: (merchant: Omit<MerchantStore, 'id' | 'updatedAt'>) => void;
  onDevBypassLogin: (role: UserRole) => void;
}

const HARDCODED_DEV_CODE = 'tkr1026';

export const AuthGateway: React.FC<AuthGatewayProps> = ({
  existingMerchants,
  onStudentLogin,
  onTeacherLogin,
  onMerchantLoginExisting,
  onMerchantRegisterAndPay,
  onDevBypassLogin,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Student form state
  const [studentNo, setStudentNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentDept, setStudentDept] = useState('資訊工程系');
  const [studentError, setStudentError] = useState<string | null>(null);

  // Teacher form state
  const [facultyNo, setFacultyNo] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [facultyDept, setFacultyDept] = useState('資訊學院 · 資訊工程系');
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Merchant login & onboarding state
  const [merchantEmail, setMerchantEmail] = useState('');
  const [merchantStep, setMerchantStep] = useState<'auth' | 'onboarding' | 'payment'>('auth');
  const [merchantError, setMerchantError] = useState<string | null>(null);

  // Merchant onboarding fields
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('餐飲美食');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storePlan, setStorePlan] = useState<MerchantPlan>('monthly');
  const [storeWebsite, setStoreWebsite] = useState('');
  const [storeHours, setStoreHours] = useState('');
  const [storePromo, setStorePromo] = useState('');
  const [storeCoverImg, setStoreCoverImg] = useState('');
  const [storeMenuImg, setStoreMenuImg] = useState('');

  // Developer test modal state (available on every role's bottom-right corner)
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [devCodeInput, setDevCodeInput] = useState('');
  const [devCodeError, setDevCodeError] = useState<string | null>(null);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentNo.trim();
    if (!/^[sS]/.test(trimmed)) {
      setStudentError('學號開頭必須是英文大小寫 s 或 S（例如：s11007042）');
      return;
    }
    if (trimmed.length < 4) {
      setStudentError('請輸入完整有效的朝陽學生學號');
      return;
    }
    setStudentError(null);
    onStudentLogin(trimmed, studentName.trim() || '朝陽同學', studentDept);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = facultyNo.trim();
    if (!/^[tT]/.test(trimmed)) {
      setTeacherError('教職員代號開頭必須是英文大小寫 t 或 T（例如：t940218）');
      return;
    }
    if (trimmed.length < 4) {
      setTeacherError('請輸入完整有效的教師代號');
      return;
    }
    setTeacherError(null);
    onTeacherLogin(trimmed, facultyName.trim() || '朝陽教師', facultyDept);
  };

  const handleMerchantEmailProceed = (emailToUse: string) => {
    const cleanEmail = emailToUse.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setMerchantError('請輸入有效的商家電子郵件信箱');
      return;
    }
    setMerchantError(null);
    setMerchantEmail(cleanEmail);

    const existing = existingMerchants.find(
      (m) => m.ownerEmail.toLowerCase() === cleanEmail && m.paid
    );
    if (existing) {
      onMerchantLoginExisting(existing);
    } else {
      setMerchantStep('onboarding');
    }
  };

  const handleGoogleMerchantSignIn = () => {
    const demoGoogleEmail = merchantEmail.trim() || 'partner.cafe@gmail.com';
    handleMerchantEmailProceed(demoGoogleEmail);
  };

  const handleOnboardingNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !storeAddress.trim() || !storePhone.trim()) {
      setMerchantError('請完整填寫必填欄位：店名、地址與聯絡電話');
      return;
    }
    setMerchantError(null);
    setMerchantStep('payment');
  };

  const handleCompletePayment = () => {
    onMerchantRegisterAndPay({
      ownerEmail: merchantEmail,
      name: storeName.trim(),
      category: storeCategory,
      address: storeAddress.trim(),
      phone: storePhone.trim(),
      plan: storePlan,
      paid: true,
      coverImage: storeCoverImg || undefined,
      menuImage: storeMenuImg || undefined,
      website: storeWebsite.trim() || undefined,
      businessHours: storeHours.trim() || undefined,
      latestPromo: storePromo.trim() || undefined,
    });
  };

  const handleImageFileRead = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
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

  const handleDevVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (devCodeInput.trim() === HARDCODED_DEV_CODE) {
      setDevCodeError(null);
      setDevModalOpen(false);
      setDevCodeInput('');
      onDevBypassLogin(selectedRole);
    } else {
      setDevCodeError('測試碼錯誤，無法略過驗證');
    }
  };

  const planDetails: Record<MerchantPlan, { label: string; price: string; desc: string }> = {
    monthly: { label: '月繳方案', price: 'NT$ 490 / 月', desc: '彈性按月刊登曝光' },
    quarterly: { label: '季繳方案', price: 'NT$ 1,290 / 季', desc: '平均每月 NT$ 430' },
    yearly: { label: '年繳方案', price: 'NT$ 4,500 / 年', desc: '平均每月 NT$ 375 · 優先置頂' },
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,#1d0b10_0%,#0B0F17_52%,#06090F_100%)] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-x-hidden">
      {/* Subtle Background Ambient Flares */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[560px] h-[280px] bg-[#E50914]/12 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Top Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#191F2E] to-[#0B0F17] border border-[#E50914]/60 shadow-[0_0_20px_rgba(229,9,20,0.4)] flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                <path
                  d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
                  stroke="#E50914"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M25.5 15.2C24.2 13.8 22.3 13 20.1 13C15.9 13 12.8 16 12.8 20C12.8 24 15.9 27 20.1 27C22.4 27 24.3 26.1 25.6 24.7"
                  stroke="#FFFFFF"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle cx="27" cy="20" r="2.2" fill="#E50914" />
              </svg>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              CAMPUS LIFE <span className="text-[#E50914]">CYUT</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            請選擇您的校園身分模式完成驗證登入
          </p>
        </div>

        {/* 3 Role Tabs Switcher */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 max-w-xl mx-auto p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('student');
              setStudentError(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              selectedRole === 'student'
                ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>學生模式</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('teacher');
              setTeacherError(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              selectedRole === 'teacher'
                ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpenCheck className="w-4 h-4 shrink-0" />
            <span>教師模式</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('merchant');
              setMerchantError(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              selectedRole === 'merchant'
                ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span>商家模式</span>
          </button>
        </div>

        {/* Role Login Card Container (with bottom-right Developer Test Button on EVERY mode) */}
        <div className="relative w-full max-w-2xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 pb-16 shadow-2xl backdrop-blur-md">
          <AnimatePresence mode="wait">
            {/* 1. STUDENT MODE */}
            {selectedRole === 'student' && (
              <motion.form
                key="student-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleStudentSubmit}
                className="space-y-4"
              >
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">學生身分登入</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    學號開頭必須為英文大小寫 <span className="font-mono text-white font-bold">s</span>（例如：<span className="font-mono">s11007042</span>）
                  </p>
                </div>

                {studentError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
                    <span>{studentError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      朝陽學號 <span className="text-[#E50914]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentNo}
                      onChange={(e) => {
                        setStudentNo(e.target.value);
                        setStudentError(null);
                      }}
                      placeholder="例如：s11007042"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      登入密碼 <span className="text-[#E50914]">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="請輸入學生入口密碼"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      姓名（選填）
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="例如：林朝陽"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      就讀系所
                    </label>
                    <select
                      value={studentDept}
                      onChange={(e) => setStudentDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    >
                      <option value="資訊工程系">資訊工程系</option>
                      <option value="資訊管理系">資訊管理系</option>
                      <option value="視覺傳達設計系">視覺傳達設計系</option>
                      <option value="建築系">建築系</option>
                      <option value="企業管理系">企業管理系</option>
                      <option value="財務金融系">財務金融系</option>
                      <option value="傳播藝術系">傳播藝術系</option>
                      <option value="航空機械系">航空機械系</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#E50914] hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition active:scale-[0.98]"
                  >
                    <span>進入學生智慧校園</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* 2. TEACHER MODE */}
            {selectedRole === 'teacher' && (
              <motion.form
                key="teacher-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleTeacherSubmit}
                className="space-y-4"
              >
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">教師身分登入</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    教職員代號開頭必須為英文大小寫 <span className="font-mono text-white font-bold">t</span>（例如：<span className="font-mono">t940218</span>），登入後可啟用 AI 自動出題、課綱整理與成績計算工具。
                  </p>
                </div>

                {teacherError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
                    <span>{teacherError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      教職員代號 <span className="text-[#E50914]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={facultyNo}
                      onChange={(e) => {
                        setFacultyNo(e.target.value);
                        setTeacherError(null);
                      }}
                      placeholder="例如：t940218"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      教師密碼 <span className="text-[#E50914]">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={facultyPassword}
                      onChange={(e) => setFacultyPassword(e.target.value)}
                      placeholder="請輸入教職員入口密碼"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      教師姓名（選填）
                    </label>
                    <input
                      type="text"
                      value={facultyName}
                      onChange={(e) => setFacultyName(e.target.value)}
                      placeholder="例如：陳教授"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      所屬學院 / 系所
                    </label>
                    <select
                      value={facultyDept}
                      onChange={(e) => setFacultyDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    >
                      <option value="資訊學院 · 資訊工程系">資訊學院 · 資訊工程系</option>
                      <option value="設計學院 · 視覺傳達設計系">設計學院 · 視覺傳達設計系</option>
                      <option value="管理學院 · 企業管理系">管理學院 · 企業管理系</option>
                      <option value="理工學院 · 工業工程與管理系">理工學院 · 工業工程與管理系</option>
                      <option value="人文暨社會學院 · 傳播藝術系">人文暨社會學院 · 傳播藝術系</option>
                      <option value="航空學院 · 飛行與民航技術系">航空學院 · 飛行與民航技術系</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#E50914] hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition active:scale-[0.98]"
                  >
                    <span>進入教師授課系統</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* 3. MERCHANT MODE */}
            {selectedRole === 'merchant' && (
              <motion.div
                key="merchant-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {merchantStep === 'auth' && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-800 pb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-white">特約商家登入 / 申請上架</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        支援 Email 或 Google 快速驗證，首次登入需完成門市基本資料填寫與合作方案付款後上架至學生市集。
                      </p>
                    </div>

                    {merchantError && (
                      <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
                        <span>{merchantError}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-slate-300">
                        商家登入 Email
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="email"
                          value={merchantEmail}
                          onChange={(e) => {
                            setMerchantEmail(e.target.value);
                            setMerchantError(null);
                          }}
                          placeholder="store@example.com（已合作可輸入 morningtea@cyut-partner.tw）"
                          className="flex-1 px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                        />
                        <button
                          type="button"
                          onClick={() => handleMerchantEmailProceed(merchantEmail)}
                          className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-600 text-white text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center justify-center gap-1.5"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Email 登入 / 註冊</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-800" />
                      <span className="shrink mx-3 text-xs text-slate-500">或使用第三方帳號</span>
                      <div className="flex-grow border-t border-slate-800" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleMerchantSignIn}
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-2.5 transition"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                        />
                      </svg>
                      <span>使用 Google 帳號繼續</span>
                    </button>
                  </div>
                )}

                {merchantStep === 'onboarding' && (
                  <form onSubmit={handleOnboardingNext} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h2 className="text-lg font-bold text-white">首次商家上架資料填寫</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          登入帳號：{merchantEmail} · 選填項目之後可於商家後台隨時修改
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMerchantStep('auth')}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        更換帳號
                      </button>
                    </div>

                    {merchantError && (
                      <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
                        <span>{merchantError}</span>
                      </div>
                    )}

                    {/* Required Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          店名 <span className="text-[#E50914]">*必填</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="例如：朝陽職人早午餐"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          聯絡電話 <span className="text-[#E50914]">*必填</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={storePhone}
                          onChange={(e) => setStorePhone(e.target.value)}
                          placeholder="例如：04-2332-8899"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#E50914]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          門市地址 <span className="text-[#E50914]">*必填</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={storeAddress}
                          onChange={(e) => setStoreAddress(e.target.value)}
                          placeholder="台中市霧峰區吉峰東路..."
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          商家類別
                        </label>
                        <select
                          value={storeCategory}
                          onChange={(e) => setStoreCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                        >
                          <option value="餐飲美食">餐飲美食</option>
                          <option value="手搖飲品">手搖飲品</option>
                          <option value="咖啡輕食">咖啡輕食</option>
                          <option value="生活服務">生活服務</option>
                        </select>
                      </div>
                    </div>

                    {/* Subscription Plan Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        上架方案選擇 <span className="text-[#E50914]">*必填</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['monthly', 'quarterly', 'yearly'] as MerchantPlan[]).map((pKey) => (
                          <button
                            key={pKey}
                            type="button"
                            onClick={() => setStorePlan(pKey)}
                            className={`p-3 rounded-xl border text-left transition ${
                              storePlan === pKey
                                ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-bold">{planDetails[pKey].label}</div>
                            <div className="text-xs font-mono font-extrabold text-amber-400 mt-1">
                              {planDetails[pKey].price}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-3">
                      <div className="text-xs font-semibold text-slate-400">
                        選填項目（若未填寫將於學生市集自動隱藏，日後可隨時編輯）
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={storeHours}
                          onChange={(e) => setStoreHours(e.target.value)}
                          placeholder="營業時間（選填，如 10:00-20:00）"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                        />
                        <input
                          type="url"
                          value={storeWebsite}
                          onChange={(e) => setStoreWebsite(e.target.value)}
                          placeholder="官方網站 URL（選填）"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                        />
                      </div>
                      <input
                        type="text"
                        value={storePromo}
                        onChange={(e) => setStorePromo(e.target.value)}
                        placeholder="最新活動優惠（選填，如：學生證免費加珍珠）"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-slate-500 cursor-pointer text-xs text-slate-300">
                          <ImagePlus className="w-4 h-4 text-[#E50914]" />
                          <span className="truncate">
                            {storeCoverImg ? '已選擇店面照片' : '上傳店面照片（選填）'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileRead(e, setStoreCoverImg)}
                            className="hidden"
                          />
                        </label>
                        <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-slate-500 cursor-pointer text-xs text-slate-300">
                          <ImagePlus className="w-4 h-4 text-amber-400" />
                          <span className="truncate">
                            {storeMenuImg ? '已選擇菜單圖片' : '上傳菜單圖片（選填）'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileRead(e, setStoreMenuImg)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition"
                    >
                      <span>前往方案付款確認</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {merchantStep === 'payment' && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">方案結帳與正式上架</h2>
                        <p className="text-xs text-slate-400 mt-0.5">完成付款後，店家資訊將立即刊登至學生市集</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMerchantStep('onboarding')}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        返回修改資料
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">店家名稱</span>
                        <span className="font-bold text-white">{storeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">地址</span>
                        <span className="text-slate-200">{storeAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">電話</span>
                        <span className="font-mono text-slate-200">{storePhone}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-slate-300 font-semibold">{planDetails[storePlan].label}</span>
                        <span className="text-base font-extrabold text-amber-400 font-mono">
                          {planDetails[storePlan].price}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCompletePayment}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>確認付款並正式上架至學生市集</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom-Right Corner Developer Test Button (Present on ALL 3 Roles) */}
          <button
            type="button"
            onClick={() => {
              setDevCodeInput('');
              setDevCodeError(null);
              setDevModalOpen(true);
            }}
            className="absolute bottom-4 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-400 hover:text-white transition"
          >
            <Terminal className="w-3.5 h-3.5 text-[#E50914]" />
            <span>開發者測試按鈕</span>
          </button>
        </div>
      </div>

      {/* Developer Test Code Modal */}
      {devModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#E50914]" />
                <span>開發者快速驗證通道</span>
              </h3>
              <button
                onClick={() => setDevModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              目前選擇模式：
              <strong className="text-white ml-1">
                {selectedRole === 'student' ? '學生模式' : selectedRole === 'teacher' ? '教師模式' : '商家模式'}
              </strong>
              。輸入開發者測試碼即可略過驗證直接進入體驗。
            </p>

            <form onSubmit={handleDevVerify} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={devCodeInput}
                onChange={(e) => {
                  setDevCodeInput(e.target.value);
                  setDevCodeError(null);
                }}
                placeholder="請輸入開發者測試碼..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#E50914]"
              />

              {devCodeError && (
                <div className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{devCodeError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDevModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#E50914] hover:bg-red-600 text-white rounded-xl transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>驗證登入</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
