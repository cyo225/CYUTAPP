import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { Rocket, User, Lock, Key, CheckCircle, X, Shield, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onQuickLoadDemo: () => void;
  onManualLogin: (studentNo: string, name: string, dept: string) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  onQuickLoadDemo,
  onManualLogin,
  onLogout,
}) => {
  const [studentNo, setStudentNo] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState('資訊工程系');

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNo.trim()) return;
    onManualLogin(
      studentNo.trim(),
      studentName.trim() || '朝陽同學',
      department
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle red accent glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E50914]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center font-bold text-white shadow-md shadow-red-950/50">
              C
            </div>
            <h3 className="text-lg font-bold text-white">學生帳號與授權中心</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {profile.isLoggedIn ? (
          /* Logged In Status View */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-white">{profile.name}</div>
                  <div className="text-xs text-slate-400">
                    {profile.studentNo} · {profile.department}
                  </div>
                  <div className="text-xs text-[#E50914] font-bold font-mono mt-0.5">
                    累積點數：{profile.points} PTS · 抽獎券：{profile.lotteryTickets} 張
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              登出此帳號 (恢復空白狀態)
            </button>
          </div>
        ) : (
          /* Manual Login Form */
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>或手動輸入學生學號登入：</span>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  朝陽學號 (例如：B11007042)
                </label>
                <input
                  type="text"
                  required
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                  placeholder="請輸入學號..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  學生姓名
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="例如：王小明"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  就讀系所
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="資訊工程系">資訊學院 · 資訊工程系</option>
                  <option value="資訊管理系">資訊學院 · 資訊管理系</option>
                  <option value="視覺傳達設計系">設計學院 · 視覺傳達設計系</option>
                  <option value="建築系">設計學院 · 建築系</option>
                  <option value="企業管理系">管理學院 · 企業管理系</option>
                  <option value="財務金融系">管理學院 · 財務金融系</option>
                  <option value="傳播藝術系">人文學院 · 傳播藝術系</option>
                </select>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onQuickLoadDemo();
                    onClose();
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition flex items-center gap-1.5 focus:outline-none"
                  title="評審/測試快速體驗"
                >
                  <Rocket className="w-3 h-3 text-[#E50914]" />
                  <span>🚀 一鍵帶入測試帳號</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition"
                  >
                    登入
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
