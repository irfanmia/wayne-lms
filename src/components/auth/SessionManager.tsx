'use client';
/**
 * SessionManager — handles JWT token refresh and session expiry UX.
 *
 * Strategy:
 * - Access token lives 1 hour. Refresh token lives 7 days.
 * - We silently refresh the access token every 50 minutes using the refresh token.
 * - If refresh fails (refresh token expired / revoked), show a "Still working?" dialog.
 * - Dialog has a 60s countdown. "Keep me in" re-prompts login inline. "Log out" clears session.
 * - Any user activity (mouse / keyboard / touch) resets the idle timer.
 * - After 25 minutes of inactivity we warn. After 5 more minutes (30 total) we force logout.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';

const ACCESS_REFRESH_INTERVAL_MS = 50 * 60 * 1000;  // refresh every 50min
const IDLE_WARN_MS = 25 * 60 * 1000;                 // warn after 25min idle
const IDLE_LOGOUT_MS = 30 * 60 * 1000;               // force logout after 30min idle
const DIALOG_COUNTDOWN_S = 60;                        // seconds to auto-logout from dialog

type DialogState = 'hidden' | 'idle-warn' | 'session-expired';

export default function SessionManager() {
  const [dialog, setDialog] = useState<DialogState>('hidden');
  const [countdown, setCountdown] = useState(DIALOG_COUNTDOWN_S);
  const [reloginUsername, setReloginUsername] = useState('');
  const [reloginPassword, setReloginPassword] = useState('');
  const [reloginError, setReloginError] = useState('');
  const [reloginLoading, setReloginLoading] = useState(false);
  const [reloginSuccess, setReloginSuccess] = useState(false);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleWarnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef(Date.now());

  // Only run when logged in (token present)
  const isLoggedIn = () =>
    typeof window !== 'undefined' &&
    !!localStorage.getItem('auth_token');

  // ─── Token refresh ───────────────────────────────────────────────
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const rt = localStorage.getItem('refresh_token');
    if (!rt) return false;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/token/refresh/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: rt }),
        }
      );
      if (!res.ok) return false;
      const data = await res.json();
      if (data.access) {
        api.setToken(data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // ─── Force logout ─────────────────────────────────────────────────
  const forceLogout = useCallback(() => {
    clearAllTimers();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    api.clearToken?.();
    window.location.href = `/login?reason=expired&redirect=${encodeURIComponent(window.location.pathname)}`;
  }, []);

  // ─── Start countdown in dialog ────────────────────────────────────
  const startCountdown = useCallback(() => {
    setCountdown(DIALOG_COUNTDOWN_S);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          forceLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [forceLogout]);

  // ─── Clear all timers ─────────────────────────────────────────────
  function clearAllTimers() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (idleWarnTimerRef.current) clearTimeout(idleWarnTimerRef.current);
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }

  // ─── Reset idle timers on activity ────────────────────────────────
  const resetIdleTimers = useCallback(() => {
    if (!isLoggedIn()) return;
    lastActivityRef.current = Date.now();
    if (dialog === 'idle-warn') {
      setDialog('hidden');
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
    if (idleWarnTimerRef.current) clearTimeout(idleWarnTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleWarnTimerRef.current = setTimeout(() => {
      if (!isLoggedIn()) return;
      setDialog('idle-warn');
      startCountdown();
    }, IDLE_WARN_MS);

    idleTimerRef.current = setTimeout(() => {
      if (!isLoggedIn()) return;
      forceLogout();
    }, IDLE_LOGOUT_MS);
  }, [dialog, forceLogout, startCountdown]);

  // ─── Mount / unmount ──────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn()) return;

    // Start access token auto-refresh
    refreshIntervalRef.current = setInterval(async () => {
      if (!isLoggedIn()) return;
      const ok = await refreshToken();
      if (!ok) {
        clearInterval(refreshIntervalRef.current!);
        setDialog('session-expired');
        startCountdown();
      }
    }, ACCESS_REFRESH_INTERVAL_MS);

    // Start idle tracking
    resetIdleTimers();
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const onActivity = () => resetIdleTimers();
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      clearAllTimers();
      events.forEach(e => window.removeEventListener(e, onActivity));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleStillHere = async () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    const ok = await refreshToken();
    if (ok) {
      setDialog('hidden');
      resetIdleTimers();
    } else {
      setDialog('session-expired');
      startCountdown();
    }
  };

  const handleRelogin = async () => {
    if (!reloginUsername || !reloginPassword) return;
    setReloginLoading(true);
    setReloginError('');
    try {
      await api.login({ username: reloginUsername, password: reloginPassword });
      const rt = localStorage.getItem('auth_token'); // updated by api.login
      if (rt) {
        setReloginSuccess(true);
        setTimeout(() => {
          setDialog('hidden');
          setReloginSuccess(false);
          setReloginUsername('');
          setReloginPassword('');
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          resetIdleTimers();
        }, 1200);
      }
    } catch (e) {
      setReloginError(e instanceof Error ? e.message : 'Invalid credentials');
    } finally {
      setReloginLoading(false);
    }
  };

  // ─── Nothing to show ──────────────────────────────────────────────
  if (dialog === 'hidden') return null;

  const isIdleWarn = dialog === 'idle-warn';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-6 pt-6 pb-4 ${isIdleWarn ? 'bg-amber-50' : 'bg-orange-50'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isIdleWarn ? 'bg-amber-100' : 'bg-orange-100'}`}>
              {isIdleWarn ? '⏳' : '🔐'}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {isIdleWarn ? 'Still working?' : 'Session expired'}
              </h2>
              <p className="text-xs text-gray-500">
                {isIdleWarn
                  ? "You've been inactive for a while"
                  : 'Your session has expired due to inactivity'}
              </p>
            </div>
          </div>

          {/* Countdown ring */}
          <div className="flex items-center justify-center py-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke={isIdleWarn ? '#f59e0b' : '#f97316'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - countdown / DIALOG_COUNTDOWN_S)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{countdown}</span>
                <span className="text-[10px] text-gray-400">seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {isIdleWarn ? (
            // ── Idle warning ──
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                You'll be logged out in <strong>{countdown} seconds</strong> to keep your account secure.
                <br />Any unsaved changes will be preserved.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleStillHere}
                  className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition cursor-pointer"
                >
                  ✅ Yes, keep me in
                </button>
                <button
                  onClick={forceLogout}
                  className="px-4 py-2.5 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-100 transition cursor-pointer border border-gray-200"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            // ── Session expired — inline re-login ──
            <div className="space-y-3">
              {reloginSuccess ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm font-semibold text-green-600">Welcome back! Resuming your session…</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 text-center mb-1">
                    Re-enter your password to continue where you left off.
                  </p>
                  <input
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Username or email"
                    value={reloginUsername}
                    onChange={e => setReloginUsername(e.target.value)}
                    autoComplete="username"
                  />
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Password"
                    value={reloginPassword}
                    onChange={e => setReloginPassword(e.target.value)}
                    autoComplete="current-password"
                    onKeyDown={e => e.key === 'Enter' && handleRelogin()}
                  />
                  {reloginError && (
                    <p className="text-xs text-red-500">{reloginError}</p>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleRelogin}
                      disabled={reloginLoading || !reloginUsername || !reloginPassword}
                      className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer"
                    >
                      {reloginLoading ? 'Signing in…' : '🔓 Continue working'}
                    </button>
                    <button
                      onClick={forceLogout}
                      className="px-4 py-2.5 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-100 transition cursor-pointer border border-gray-200"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
