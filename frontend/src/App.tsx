import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import VoiceMode from './components/VoiceMode';
import VisionMode from './components/VisionMode';
import OtariStudioMode from './components/OtariStudioMode';
import LandingPage from './pages/LandingPage';
import type { Mode } from './types';
import { Mic, Eye, Cpu, ShieldCheck, Hexagon, Sparkles } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  // Toggle body class: app-shell-active locks overflow for Voice/Vision/Otari,
  // removing it allows landing page to scroll freely.
  useEffect(() => {
    if (isLanding) {
      document.body.classList.remove('app-shell-active');
    } else {
      document.body.classList.add('app-shell-active');
    }
    return () => {
      document.body.classList.remove('app-shell-active');
    };
  }, [isLanding]);

  // If we are on the landing page, render it independently of the app shell
  if (isLanding) {
    return <LandingPage />;
  }

  // Derive mode from the current URL to keep the header UI in sync
  const mode: Mode = location.pathname.includes('/vision')
    ? 'vision'
    : location.pathname.includes('/otari')
    ? 'otari'
    : 'voice';

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden font-sans selection:bg-[rgba(0,240,255,0.25)]"
      style={{ background: '#03040B' }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(6, 9, 20, 0.92)',
            backdropFilter: 'blur(24px)',
            color: '#F1F5FF',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            borderRadius: '14px',
            padding: '12px 20px',
            boxShadow: '0 14px 40px rgba(0,0,0,0.7), 0 0 24px rgba(0,240,255,0.12)',
          },
        }}
      />

      {/* ── Web3 Sovereign Protocol Floating HUD Header ──────────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 px-4 md:px-6 py-3.5 pointer-events-none">
        <div
          className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2.5 rounded-2xl pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(8, 12, 26, 0.85) 0%, rgba(4, 6, 15, 0.92) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 240, 255, 0.16)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Protocol Brand / Node Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.16), rgba(139,92,246,0.22))',
                border: '1px solid rgba(0,240,255,0.4)',
                boxShadow: '0 0 20px rgba(0,240,255,0.2)',
              }}
            >
              <Hexagon className="w-5 h-5 text-[#00F0FF]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10F981] shadow-[0_0_8px_#10F981]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold tracking-tight leading-none text-white">
                  OTARI <span className="web3-gradient-text">// VOXVISION</span>
                </h1>
                <span className="hidden sm:inline-flex font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/35">
                  V2.0_PROTOCOL
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#10F981]">
                  ● MAINNET // OTARI-GATEWAY
                </span>
                <span className="hidden lg:inline font-mono text-[10px] text-slate-500">
                  | 0x7F...9A4B
                </span>
              </div>
            </div>
          </div>

          {/* Web3 Protocol Node Switcher */}
          <div
            className="flex p-1 rounded-xl"
            style={{
              background: 'rgba(3, 4, 11, 0.85)',
              border: '1px solid rgba(139, 92, 246, 0.22)',
            }}
          >
            {([
              { id: 'voice' as Mode, code: '01', icon: Mic, label: 'VOICE_NODE', path: '/voice' },
              { id: 'vision' as Mode, code: '02', icon: Eye, label: 'VISION_ORACLE', path: '/vision' },
              { id: 'otari' as Mode, code: '03', icon: Cpu, label: 'OTARI_STUDIO', path: '/otari' },
            ]).map(({ id, code, icon: Icon, label, path }) => {
              const isActive = mode === id;
              return (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  className="relative flex items-center gap-2 px-3.5 md:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer"
                  style={{
                    color: isActive ? '#FFFFFF' : 'rgba(148, 163, 184, 0.75)',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-web3-node"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(0, 240, 255, 0.22) 0%, rgba(139, 92, 246, 0.28) 100%)',
                        border: '1px solid rgba(0, 240, 255, 0.5)',
                        boxShadow:
                          '0 0 20px rgba(0, 240, 255, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                    />
                  )}
                  <span
                    className="hidden sm:inline font-mono text-[10px] relative z-10"
                    style={{ color: isActive ? '#00F0FF' : 'rgba(100, 116, 139, 0.8)' }}
                  >
                    [{code}]
                  </span>
                  <Icon
                    className="w-3.5 h-3.5 relative z-10"
                    style={{ color: isActive ? '#00F0FF' : 'currentColor' }}
                  />
                  <span className="font-mono text-[11px] tracking-wider relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Wallet / Grant Pool & Rubric Audit Badge */}
          <div className="hidden xl:flex items-center gap-2.5">
            <button
              onClick={() => navigate('/otari')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-[1.03]"
              style={{
                background: 'rgba(16, 249, 129, 0.08)',
                border: '1px solid rgba(16, 249, 129, 0.3)',
                boxShadow: '0 0 18px rgba(16, 249, 129, 0.08)',
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#10F981]" />
              <span className="font-mono text-[11px] font-semibold text-slate-200">
                AUDIT: <span className="text-[#10F981]">100/100</span>
              </span>
            </button>

            <button
              onClick={() => navigate('/otari')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-[1.03]"
              style={{
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span className="font-mono text-[11px] font-semibold text-slate-200">
                POOL: <span className="text-[#00F0FF]">$20.00</span> <span className="text-slate-400">5_NODES</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Canvas ─────────────────────────────────────────── */}
      <main className="flex-1 w-full h-full relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/voice"
              element={
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.01, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.99, filter: 'blur(8px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <VoiceMode />
                </motion.div>
              }
            />
            <Route
              path="/vision"
              element={
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.01, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.99, filter: 'blur(8px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <VisionMode />
                </motion.div>
              }
            />
            <Route
              path="/otari"
              element={
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.01, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.99, filter: 'blur(8px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <OtariStudioMode />
                </motion.div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
