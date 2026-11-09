'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Mic, Eye, Sparkles } from 'lucide-react';
import type { Mode } from '../types';
import OmniEyeLogo from './OmniEyeLogo';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const mode: Mode = pathname?.includes('/vision')
    ? 'vision'
    : pathname?.includes('/otari')
    ? 'otari'
    : 'voice';

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden font-sans selection:bg-[rgba(0,245,155,0.25)]"
      style={{ background: '#040B08' }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(4, 11, 8, 0.92)',
            backdropFilter: 'blur(20px)',
            color: '#ECFDF5',
            border: '1px solid rgba(0, 245, 155, 0.25)',
            fontSize: '13px',
            borderRadius: '999px',
            padding: '12px 24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(0,245,155,0.15)',
          },
        }}
      />

      {/* ── Floating Header ─────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-5 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
            <OmniEyeLogo size={42} glow={true} />
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ color: '#ECFDF5' }}>
                Aetheris <span style={{ color: '#00F59B' }}>OmniSense</span>
                <span className="text-xs font-normal" style={{ color: 'rgba(0,245,155,0.65)' }}>
                  .ai
                </span>
              </h1>
              <p
                className="text-[10px] font-medium uppercase"
                style={{ color: 'rgba(163, 230, 53, 0.85)', letterSpacing: '0.04em' }}
              >
                Omniscient Voice &amp; Vision
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div
            className="flex p-1 rounded-full shadow-xl"
            style={{
              background: 'rgba(4, 11, 8, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 245, 155, 0.2)',
            }}
          >
            {(
              [
                { id: 'voice' as Mode, icon: Mic, label: 'Voice', path: '/voice' },
                { id: 'vision' as Mode, icon: Eye, label: 'Vision', path: '/vision' },
                { id: 'otari' as Mode, icon: Sparkles, label: 'Otari AI', path: '/otari' },
              ] as const
            ).map(({ id, icon: Icon, label, path }) => {
              const isActive = mode === id;
              return (
                <button
                  key={id}
                  onClick={() => router.push(path)}
                  className="relative flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer"
                  style={{
                    color: isActive ? '#040B08' : 'rgba(0, 245, 155, 0.6)',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-mode-bubble"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #00F59B, #059669)',
                        border: '1px solid rgba(0, 245, 155, 0.8)',
                        boxShadow: '0 0 20px rgba(0, 245, 155, 0.4)',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Badges */}
          <div className="hidden md:flex items-center opacity-70">
            <span
              className="text-[10px] font-medium uppercase tracking-widest text-slate-400"
              style={{ letterSpacing: '0.06em' }}
            >
              Powered by:{' '}
              <span style={{ color: '#00F59B' }}>
                Mozilla Otari • Qwen • Kokoro • YOLOv11
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Canvas ─────────────────────────────────────────── */}
      <main className="flex-1 w-full h-full relative">
        {children}
      </main>
    </div>
  );
}
