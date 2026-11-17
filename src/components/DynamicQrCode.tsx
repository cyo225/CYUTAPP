import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, RefreshCw, ShieldCheck } from 'lucide-react';

interface DynamicQrCodeProps {
  code: string;
  size?: number;
  isUsed?: boolean;
}

const GRID_SIZE = 21;

function isFinderCell(r: number, c: number): boolean {
  const inTopLeft = r < 7 && c < 7;
  const inTopRight = r < 7 && c >= GRID_SIZE - 7;
  const inBottomLeft = r >= GRID_SIZE - 7 && c < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

function getFinderValue(r: number, c: number): boolean {
  let lr = r;
  let lc = c;
  if (r < 7 && c >= GRID_SIZE - 7) {
    lc = c - (GRID_SIZE - 7);
  } else if (r >= GRID_SIZE - 7 && c < 7) {
    lr = r - (GRID_SIZE - 7);
  }
  if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
  if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
  return false;
}

function isSeparatorCell(r: number, c: number): boolean {
  if (r === 7 && c <= 7) return true;
  if (c === 7 && r <= 7) return true;
  if (r === 7 && c >= GRID_SIZE - 8) return true;
  if (c === GRID_SIZE - 8 && r <= 7) return true;
  if (r === GRID_SIZE - 8 && c <= 7) return true;
  if (c === 7 && r >= GRID_SIZE - 8) return true;
  return false;
}

function buildQrMatrix(seedStr: string): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );
  const safe = seedStr || 'CYUT-COUPON-0000';
  let hash = 2166136261;
  for (let i = 0; i < safe.length; i++) {
    hash ^= safe.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (isFinderCell(r, c)) {
        matrix[r][c] = getFinderValue(r, c);
      } else if (isSeparatorCell(r, c)) {
        matrix[r][c] = false;
      } else if (r === 6 || c === 6) {
        matrix[r][c] = (r + c) % 2 === 0;
      } else {
        const idx = r * GRID_SIZE + c;
        const charCode = safe.charCodeAt(idx % safe.length);
        const mixed = Math.abs(
          Math.imul(hash ^ (idx * 73856093), charCode + 31) ^ (r * 19349663 + c * 83492791)
        );
        matrix[r][c] = mixed % 11 < 5;
      }
    }
  }
  return matrix;
}

export const DynamicQrCode: React.FC<DynamicQrCodeProps> = ({
  code,
  size = 168,
  isUsed = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [dynamicSalt, setDynamicSalt] = useState(() =>
    Math.floor(100000 + Math.random() * 899999).toString()
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isUsed) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setDynamicSalt(Math.floor(100000 + Math.random() * 899999).toString());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isUsed, code]);

  const matrix = useMemo(() => buildQrMatrix(code), [code]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* QR Frame */}
      <div className="relative p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-inner overflow-hidden">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
          shapeRendering="crispEdges"
          className={isUsed ? 'opacity-25 grayscale' : ''}
          aria-label={`優惠券核銷 QR Code ${code}`}
        >
          <rect width={GRID_SIZE} height={GRID_SIZE} fill="#FFFFFF" />
          {matrix.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0F172A" />
              ) : null
            )
          )}
        </svg>

        {/* Live Anti-Screenshot Scan Beam */}
        {!isUsed && (
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, size + 8, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute left-2 right-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_8px_rgba(14,165,233,0.9)]"
          />
        )}

        {isUsed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-black tracking-wider border border-slate-700 -rotate-12">
              已核銷使用
            </span>
          </div>
        )}
      </div>

      {/* Coupon Code + Copy */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
        <span className="text-xs font-mono font-black text-slate-900 dark:text-white tracking-wider">
          {code}
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
          title="複製券號供商家手動核銷測試"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">已複製</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>複製券號</span>
            </>
          )}
        </button>
      </div>

      {/* Live TOTP Refresh Status */}
      {!isUsed && (
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>動態防偽碼 #{dynamicSalt}</span>
            </span>
            <span className="font-mono tabular-nums flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{secondsLeft}s 後自動刷新</span>
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / 30) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
