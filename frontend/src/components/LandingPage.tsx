'use client';

import { useEffect, useState, type FC } from 'react';
import Link from 'next/link';

const LandingPage: FC = () => {
  const [themeMode, setThemeMode] = useState<string>('system');
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, obs) => {
      const intersecting = entries.filter((entry) => entry.isIntersecting);
      intersecting.forEach((entry, index) => {
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, index * 120);
        obs.unobserve(entry.target);
      });
    }, observerOptions);

    document.querySelectorAll('.glass-card, .highway-lane').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Theme Logic
  useEffect(() => {
    const currentMode = localStorage.getItem('Aetheris-omnisense_theme') || 'system';
    setThemeMode(currentMode);
    applyTheme(currentMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (
        localStorage.getItem('Aetheris-omnisense_theme') === 'system' ||
        !localStorage.getItem('Aetheris-omnisense_theme')
      ) {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const applyTheme = (mode: string) => {
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const modes = ['system', 'dark', 'light'];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeMode(nextMode);
    localStorage.setItem('Aetheris-omnisense_theme', nextMode);
    applyTheme(nextMode);
  };

  // Scroll spy logic
  useEffect(() => {
    const handleScroll = () => {
      const navLinks = document.querySelectorAll('.nav-scroll-link');
      const sections = Array.from(navLinks).map((link) =>
        document.querySelector(link.getAttribute('href') || '')
      );
      let currentActive: string | null = null;
      const scrollY = window.scrollY;

      sections.forEach((section) => {
        if (!section) return;
        const sectionTop = (section as HTMLElement).offsetTop - 150;
        if (scrollY >= sectionTop) {
          currentActive = section.getAttribute('id');
        }
      });
      if (currentActive) setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getThemeIconProps = () => {
    switch (themeMode) {
      case 'system':
        return { icon: 'brightness_auto', class: 'text-slate-400' };
      case 'dark':
        return { icon: 'dark_mode', class: 'text-purple-400' };
      case 'light':
        return { icon: 'light_mode', class: 'text-amber-500' };
      default:
        return { icon: 'brightness_auto', class: 'text-slate-400' };
    }
  };

  return (
    <div className="relative bg-surface text-text-primary min-h-screen">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TOP NAV BAR                                                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <nav
        id="top-nav"
        className="fixed top-0 w-full z-50 flex justify-between items-center h-16 px-6 md:px-8 mx-auto"
        style={{
          background: 'rgba(7,5,16,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(168,85,247,0.1)',
        }}
      >
        <div className="flex items-center gap-8">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <img
              src="/logo-icon.png"
              alt="Aetheris-OmniSense.ai Logo"
              className="h-9 w-auto logo-glow transition-all duration-300 group-hover:scale-110"
            />
            <div>
              <span className="text-lg font-bold leading-tight text-text-primary">
                <span className="text-accent">Aetheris-OmniSense.ai</span>
              </span>
            </div>
          </a>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { href: '#features', label: 'Features', id: 'features' },
              { href: '#how-it-works', label: 'How It Works', id: 'how-it-works' },
              { href: '#models', label: 'Models', id: 'models' },
              { href: '#use-cases', label: 'Use Cases', id: 'use-cases' },
            ].map(({ href, label, id }) => (
              <a
                key={id}
                className={`nav-scroll-link text-sm transition-colors duration-200 cursor-pointer ${
                  activeSection === id
                    ? 'text-accent font-semibold'
                    : 'text-slate-400 hover:text-accent'
                }`}
                href={href}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden lg:inline text-[10px] font-medium uppercase tracking-widest text-slate-500">
            Built for{' '}
            <a
              href="https://otari.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent/70 hover:text-accent transition-colors"
            >
              Mozilla.ai Otari Hackathon
            </a>
          </span>

          {/* GitHub Nav Icon */}
          <a
            href="https://github.com/bakarezainab"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-slate-500 hover:text-accent transition-colors"
            style={{
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.1)',
            }}
            title="GitHub"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle"
            className="flex w-9 h-9 rounded-lg items-center justify-center overflow-hidden text-slate-400 hover:text-accent transition-colors shrink-0"
            style={{
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.1)',
            }}
            title={`Theme: ${themeMode}`}
            onClick={toggleTheme}
          >
            <span
              id="theme-icon"
              className={`material-symbols-outlined ${getThemeIconProps().class}`}
              style={{ fontSize: '20px' }}
            >
              {getThemeIconProps().icon}
            </span>
          </button>

          <Link
            href="/voice"
            className="bg-accent text-white px-5 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_25px_rgba(0,245,155,0.4)] transition-all active:scale-95"
          >
            Launch App
          </Link>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-btn"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-accent transition-colors"
            style={{
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.1)',
            }}
            onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        id="mobile-menu"
        className="hidden fixed top-16 left-0 right-0 z-40 px-6 py-4 md:hidden"
        style={{
          background: 'rgba(7,5,16,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(168,85,247,0.12)',
        }}
      >
        <div className="flex flex-col gap-4">
          <a
            className="text-sm font-semibold text-accent py-2"
            href="#features"
            onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
          >
            Features
          </a>
          <a
            className="text-sm text-slate-400 hover:text-accent py-2"
            href="#how-it-works"
            onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
          >
            How It Works
          </a>
          <a
            className="text-sm text-slate-400 hover:text-accent py-2"
            href="#models"
            onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
          >
            Models
          </a>
          <a
            className="text-sm text-slate-400 hover:text-accent py-2"
            href="#use-cases"
            onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
          >
            Use Cases
          </a>
          <a
            href="https://otari.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-accent py-2 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">api</span>
            Otari.ai Platform
          </a>
        </div>
      </div>

      <main className="pt-16 relative z-10">
        {/* ════════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION                                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="relative min-h-[100vh] flex items-center justify-center overflow-hidden px-6 md:px-8"
        >
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_50%_40%,_rgba(168,85,247,0.22)_0%,_transparent_65%)]" />
            <img
              className="w-full h-full object-cover mix-blend-screen opacity-20 brand-hue"
              src="/hero-bg.png"
              alt="Neural network hero background"
            />
          </div>

          {/* Floating Particles (decorative) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-2 h-2 rounded-full bg-accent/30 top-[20%] left-[15%] animate-float"
              style={{ animationDelay: '0s' }}
            />
            <div
              className="absolute w-1.5 h-1.5 rounded-full bg-teal/30 top-[60%] left-[80%] animate-float"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute w-1 h-1 rounded-full bg-accent/20 top-[40%] left-[70%] animate-float"
              style={{ animationDelay: '2s' }}
            />
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-accent/20 top-[75%] left-[25%] animate-float"
              style={{ animationDelay: '1.5s' }}
            />
            <div
              className="absolute w-1 h-1 rounded-full bg-teal/25 top-[30%] left-[55%] animate-float"
              style={{ animationDelay: '0.5s' }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-5xl text-center">
            {/* Status Badge */}
            <a
              href="https://otari.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 animate-fade-in-up hover:border-accent/30 transition-colors"
              style={{
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.18)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-text-secondary">
                Mozilla.ai Otari Hackathon Project
              </span>
            </a>

            {/* Logo Float with Blink Animation */}
            <div className="flex justify-center mb-8 animate-fade-in-up delay-100">
              <div className="relative inline-block">
                <img
                  src="/logo-icon.png"
                  alt="Aetheris OmniSense Logo"
                  className="h-24 md:h-32 w-auto animate-eye-blink"
                />
                <div className="eye-blink-line" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-text-primary mb-6 leading-[1.08] animate-fade-in-up delay-200">
              See. Hear. Speak.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-teal">
                Generate.
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up delay-300">
              Aetheris-OmniSense.ai merges real-time computer vision, multilingual voice &amp; text
              interaction, and AI image generation into a single multimodal assistant, powered by
              the{' '}
              <a
                href="https://otari.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent/80 font-semibold hover:text-accent transition-colors"
              >
                Otari.ai open-weight API
              </a>
              .
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-400">
              <Link
                href="/voice"
                className="btn-pill btn-pill-primary text-white px-10 py-4 text-lg font-bold w-full sm:w-auto text-center"
              >
                Try Aetheris-OmniSense.ai
              </Link>
              <a
                href="#features"
                className="btn-pill btn-pill-secondary px-10 py-4 text-lg font-semibold w-full sm:w-auto text-center"
              >
                Explore Features
              </a>
            </div>

            {/* Model Chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-12 animate-fade-in-up delay-500">
              <span className="model-chip">Qwen 3.5 35B</span>
              <span className="model-chip">Qwen 3 32B</span>
              <span className="model-chip">DeepSeek R1 70B</span>
              <span className="model-chip">Llama 4 Maverick</span>
              <span className="model-chip">Qwen 2.5 Coder 32B</span>
              <span className="model-chip">Ministral 14B</span>
              <span className="model-chip">Kokoro 82M</span>
              <span className="model-chip">YOLOv11</span>
              <span className="model-chip">FLUX.1 Schnell</span>
              <span className="model-chip">Sarvam Saaras v3</span>
              <span className="model-chip">Groq Whisper</span>
              <span className="model-chip">gTTS</span>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* LANGUAGE SUPPORT STRIP                                           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section
          className="py-12 overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid rgba(236,72,153,0.08)',
            borderBottom: '1px solid rgba(236,72,153,0.08)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="material-symbols-outlined text-teal/60 text-lg">translate</span>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-center text-slate-500">
                Multilingual Support · 8 Languages · Native Script Output
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <span className="lang-pill">🇬🇧 English</span>
              <span className="lang-pill">🇮🇳 हिन्दी</span>
              <span className="lang-pill">🇮🇳 ಕನ್ನಡ</span>
              <span className="lang-pill">🇮🇳 தமிழ்</span>
              <span className="lang-pill">🇮🇳 తెలుగు</span>
              <span className="lang-pill">🇪🇸 Español</span>
              <span className="lang-pill">🇫🇷 Français</span>
              <span className="lang-pill">🇯🇵 日本語</span>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FEATURES BENTO GRID                                              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section id="features" className="py-24 md:py-32 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-accent font-bold tracking-widest text-xs uppercase mb-4 block">
                Core Capabilities
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
                Four Modalities.
                <br />
                One Interface.
              </h2>
            </div>
            <div className="text-slate-400 text-sm font-medium border-l border-accent/20 pl-6 max-w-xs leading-relaxed">
              Voice, vision, text prompts, and image generation, unified through a single Otari.ai
              API key with an OpenAI-compatible endpoint.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* ── Voice & Text Mode Card (Large) ──────────────────────────── */}
            <div className="md:col-span-8 glass-card rounded-2xl overflow-hidden group">
              <div className="p-8 md:p-10 flex flex-col h-full">
                <div className="mb-auto">
                  <div className="w-12 h-12 rounded-xl feature-icon flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-accent text-2xl">mic</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-text-primary">
                    Voice &amp; Text Mode
                  </h3>
                  <p className="text-slate-400 leading-relaxed max-w-lg text-sm">
                    Full-duplex voice &amp; text assistant with hold-to-speak recording, direct text
                    prompting, dual-engine STT (Sarvam AI + Groq Whisper), anti-hallucination
                    open-weight LLM responses via Otari, compound image generation, and
                    language-aware TTS routing.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(236,72,153,0.1)', color: 'rgba(244,114,182,0.9)' }}
                    >
                      Text &amp; Voice Prompts
                    </span>
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(168,85,247,0.1)', color: 'rgba(216,180,254,0.9)' }}
                    >
                      Anti-Hallucination
                    </span>
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(168,85,247,0.1)', color: 'rgba(216,180,254,0.9)' }}
                    >
                      Compound Requests
                    </span>
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(236,72,153,0.1)', color: 'rgba(244,114,182,0.9)' }}
                    >
                      🎨 Image Generation
                    </span>
                  </div>
                </div>

                {/* Voice Waveform Visualization */}
                <div
                  className="mt-10 p-6 rounded-xl"
                  style={{
                    background: 'rgba(168,85,247,0.04)',
                    border: '1px solid rgba(168,85,247,0.1)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-accent text-lg">
                        graphic_eq
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-accent/70 uppercase tracking-wider">
                      Live Pipeline
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-slate-500 w-8">STT</span>
                      <div className="h-1.5 bg-surface-mid rounded-full overflow-hidden flex-1">
                        <div className="h-full bg-gradient-to-r from-accent to-teal rounded-full wave-bar" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-slate-500 w-8">LLM</span>
                      <div className="h-1.5 bg-surface-mid rounded-full overflow-hidden flex-1">
                        <div className="h-full bg-gradient-to-r from-accent to-teal rounded-full wave-bar" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-pink-500/70 w-8">IMG</span>
                      <div className="h-1.5 bg-surface-mid rounded-full overflow-hidden flex-1">
                        <div className="h-full bg-gradient-to-r from-teal to-accent rounded-full wave-bar" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-slate-500 w-8">TTS</span>
                      <div className="h-1.5 bg-surface-mid rounded-full overflow-hidden flex-1">
                        <div className="h-full bg-gradient-to-r from-teal to-accent rounded-full wave-bar" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Vision Mode Card ────────────────────────────────── */}
            <div className="md:col-span-4 glass-card rounded-2xl p-8 md:p-10 flex flex-col">
              <div className="w-12 h-12 rounded-xl feature-icon flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-accent text-2xl">visibility</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-text-primary">Vision Mode</h3>
              <p className="text-slate-400 leading-relaxed text-sm mb-6">
                Live webcam AI that greets you by appearance, answers visual questions, generates
                images from your camera, and intelligently routes between vision, image gen, and
                text chat.
              </p>
              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-teal text-base">
                    check_circle
                  </span>
                  Personalized visual greeting
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-teal text-base">
                    check_circle
                  </span>
                  Smart Intent Router (Vision / Image / Voice)
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-teal text-base">
                    check_circle
                  </span>
                  🎨 Image Generation (anime, cartoon, styles)
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-teal text-base">
                    check_circle
                  </span>
                  YOLOv11 object detection
                </div>
              </div>
            </div>

            {/* ── Creative Features + Image Gen Card ──────────────────────────── */}
            <div className="md:col-span-4 glass-card rounded-2xl p-8 md:p-10 flex flex-col">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))',
                  border: '1px solid rgba(236,72,153,0.18)',
                }}
              >
                <span className="material-symbols-outlined text-teal text-2xl">auto_awesome</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-text-primary">
                Creative Vision
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm mb-8">
                Four AI-powered creative features that transform your camera into a creative studio.
              </p>
              <div className="space-y-4 mt-auto">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: 'rgba(168,85,247,0.05)',
                    border: '1px solid rgba(168,85,247,0.1)',
                  }}
                >
                  <span className="text-xs font-bold text-accent/90">🎨 Image Generation</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    "Make me anime" — detects your face, generates styled portrait
                  </p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: 'rgba(236,72,153,0.04)',
                    border: '1px solid rgba(236,72,153,0.1)',
                  }}
                >
                  <span className="text-xs font-bold text-teal/90">🌊 What If</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Reimagine any scene: "What if this was underwater?"
                  </p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: 'rgba(236,72,153,0.04)',
                    border: '1px solid rgba(236,72,153,0.1)',
                  }}
                >
                  <span className="text-xs font-bold text-teal/90">📖 Biographies</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    AI-written origin stories for any detected object
                  </p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: 'rgba(236,72,153,0.04)',
                    border: '1px solid rgba(236,72,153,0.1)',
                  }}
                >
                  <span className="text-xs font-bold text-teal/90">🎬 Director</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Turns your camera view into a movie poster
                  </p>
                </div>
              </div>
            </div>

            {/* ── Architecture Card (Wide) ────────────────────────── */}
            <div className="md:col-span-8 glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row items-stretch">
              <div className="p-8 md:p-10 md:w-1/2 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-text-primary">
                  One API. All Models.
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm mb-6">
                  The entire system (Qwen 3.5 35B, DeepSeek R1 70B, Llama 4 Maverick, Qwen 2.5
                  Coder, Kokoro 82M, YOLOv11, and FLUX.1 Schnell) runs through a single{' '}
                  <a
                    href="https://otari.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent/80 font-semibold hover:text-accent transition-colors"
                  >
                    Otari.ai API key
                  </a>{' '}
                  with an OpenAI-compatible endpoint, guardrails, and smart budgets.
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-accent text-base">bolt</span>
                    Parallel async processing &amp; 4-Model Council
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-accent text-base">sync</span>
                    Rate-limit aware open-weight model fallback
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-accent text-base">shield</span>
                    PII Guardrails, Web Search, Python Sandbox &amp; MCP
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 min-h-[280px] relative">
                <img
                  className="w-full h-full object-cover brand-hue"
                  src="/architecture-globe.png"
                  alt="Global AI infrastructure network"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-surface-dim via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* HOW IT WORKS                                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section
          id="how-it-works"
          className="py-24 md:py-32 px-6 md:px-8"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)' }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-accent font-bold tracking-widest text-xs uppercase mb-4 block">
                Pipeline Architecture
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
                How It Works
              </h2>
            </div>

            {/* Voice & Text Pipeline Steps */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent text-xl">mic</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">Voice &amp; Text Pipeline</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="glass-card rounded-xl p-6">
                  <div className="text-accent/40 text-4xl font-black mb-3">01</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">Voice or Text Input</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Type a text prompt directly or hold-to-speak to record WebM audio in the
                    browser.
                  </p>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <div className="text-accent/40 text-4xl font-black mb-3">02</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">Dual-Engine STT</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sarvam Saaras v3 primary (Indic-optimized) + Groq Whisper fallback with quality
                    arbitration.
                  </p>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <div className="text-accent/40 text-4xl font-black mb-3">03</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">
                    Otari LLM + Guardrails
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Qwen 3.5 35B / DeepSeek R1 70B generates response with PII redaction and
                    automatic retry.
                  </p>
                </div>
                <div
                  className="glass-card rounded-xl p-6"
                  style={{
                    border: '1px solid rgba(236,72,153,0.18)',
                    background: 'rgba(236,72,153,0.03)',
                  }}
                >
                  <div className="text-teal/40 text-4xl font-black mb-3">04</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">Image Generation</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    For compound requests, FLUX.1 Schnell generates an image in parallel with
                    structured text.
                  </p>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <div className="text-accent/40 text-4xl font-black mb-3">05</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">TTS Playback</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kokoro 82M for English, gTTS for Indic. Language-aware routing ensures native
                    pronunciation.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision Pipeline Steps */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent text-xl">visibility</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">Vision Pipeline</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="glass-card rounded-xl p-6">
                  <div className="text-teal/40 text-4xl font-black mb-3">01</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">Camera Opens</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Browser requests webcam, 1.5s warm-up, then auto-captures the first frame for
                    greeting analysis.
                  </p>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <div className="text-teal/40 text-4xl font-black mb-3">02</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">AI Greeting</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Vision LLM analyzes your appearance (clothing, expression, environment) and
                    speaks a personalized greeting.
                  </p>
                </div>
                <div
                  className="glass-card rounded-xl p-6"
                  style={{
                    border: '1px solid rgba(168,85,247,0.18)',
                    background: 'rgba(168,85,247,0.03)',
                  }}
                >
                  <div className="text-accent/40 text-4xl font-black mb-3">03</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">Intent Router</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hybrid keyword+regex router classifies intent into:{' '}
                    <span className="text-accent font-semibold">Vision</span>,{' '}
                    <span className="text-accent font-semibold">Image Gen</span>, or{' '}
                    <span className="text-accent font-semibold">Text Chat</span>.
                  </p>
                </div>
                <div
                  className="glass-card rounded-xl p-6"
                  style={{
                    border: '1px solid rgba(236,72,153,0.18)',
                    background: 'rgba(236,72,153,0.03)',
                  }}
                >
                  <div className="text-teal/40 text-4xl font-black mb-3">04</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">
                    🎨 Image Generation
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Camera frame transforms via img2img (<code className="text-[10px]">/v1/images/edits</code>) with 17 style presets and FLUX.1 Schnell fallback.
                  </p>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <div className="text-teal/40 text-4xl font-black mb-3">05</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">Render + Speak</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Generated image renders in chat with download/regenerate actions. YOLOv11
                    detections overlay on the live feed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODELS & TECH STACK                                              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section id="models" className="py-24 md:py-32 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-accent font-bold tracking-widest text-xs uppercase mb-4 block">
              Architecture &amp; Workflows
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
              System AI Roadmaps
            </h2>
            <p className="text-slate-400 text-sm mt-4 max-w-xl mx-auto">
              Discover how multimodal inputs move through specialized open-weight AI engines in
              real-time, routed efficiently via Otari.ai.
            </p>
          </div>

          {/* 1. VOICE & TEXT ASSISTANT ROADMAP */}
          <div className="mb-24">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <span className="material-symbols-outlined text-sm">record_voice_over</span>
              </span>
              Voice &amp; Text Assistant Pipeline
            </h3>

            <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-4 justify-between w-full relative">
              <div className="glass-card rounded-xl p-5 w-full lg:w-48 text-center flex flex-col items-center justify-center z-10 shrink-0">
                <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">mic</span>
                <div className="text-sm font-bold text-white">Voice / Text Input</div>
                <div className="text-[10px] text-slate-500 mt-1">Speech or Prompt</div>
              </div>

              <div className="hidden lg:flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-3xl">arrow_right_alt</span>
              </div>

              <div className="glass-card rounded-xl p-5 w-full lg:w-56 flex flex-col justify-center z-10 shrink-0 border border-slate-800">
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-3 text-center">
                  Speech to Text
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5">
                  <div className="text-xs font-bold text-white mb-0.5">Sarvam Saaras v3</div>
                  <div className="text-[9px] text-slate-400">Primary Indic STT</div>
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5 mt-2 opacity-60">
                  <div className="text-xs font-bold text-white mb-0.5">Groq Whisper</div>
                  <div className="text-[9px] text-slate-400">Fallback English STT</div>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center text-accent">
                <span className="material-symbols-outlined text-3xl">arrow_right_alt</span>
              </div>

              <div className="glass-card rounded-xl p-5 w-full lg:w-60 flex flex-col justify-center z-10 shrink-0 border border-accent/20">
                <div className="text-[9px] uppercase tracking-wider text-accent font-bold mb-3 text-center">
                  Otari Open-Weight Router
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5">
                  <div className="text-xs font-bold text-white mb-0.5">Qwen 3.5 35B / Qwen 3</div>
                  <div className="text-[9px] text-slate-400">Primary Conversational LLM</div>
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5 mt-2">
                  <div className="text-xs font-bold text-teal mb-0.5">DeepSeek R1 70B</div>
                  <div className="text-[9px] text-slate-400">Reasoning &amp; Verification</div>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center text-teal">
                <span className="material-symbols-outlined text-3xl">arrow_right_alt</span>
              </div>

              <div className="glass-card rounded-xl p-5 w-full lg:w-52 flex flex-col justify-center z-10 shrink-0 border border-slate-800">
                <div className="text-[9px] uppercase tracking-wider text-teal font-bold mb-3 text-center">
                  Speech &amp; Visual Output
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5">
                  <div className="text-xs font-bold text-white mb-0.5">Kokoro 82M + gTTS</div>
                  <div className="text-[9px] text-slate-400">8-Language Neural TTS</div>
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5 mt-2">
                  <div className="text-xs font-bold text-white mb-0.5">FLUX.1 Schnell</div>
                  <div className="text-[9px] text-slate-400">Parallel Image Gen</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. VISION & OTARI STUDIO ROADMAP */}
          <div>
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal">
                <span className="material-symbols-outlined text-sm">visibility</span>
              </span>
              Vision &amp; Otari Multi-Model Pipeline
            </h3>

            <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-4 justify-between w-full relative">
              <div className="glass-card rounded-xl p-5 w-full lg:w-48 text-center flex flex-col items-center justify-center z-10 shrink-0">
                <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">
                  videocam
                </span>
                <div className="text-sm font-bold text-white">Webcam / Query</div>
                <div className="text-[10px] text-slate-500 mt-1">Live Video &amp; Prompt</div>
              </div>

              <div className="hidden lg:flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-3xl">arrow_right_alt</span>
              </div>

              <div className="glass-card rounded-xl p-5 w-full lg:w-56 flex flex-col justify-center z-10 shrink-0 border border-slate-800">
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-3 text-center">
                  Visual Perception
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5">
                  <div className="text-xs font-bold text-white mb-0.5">Llama 4 Maverick 17B</div>
                  <div className="text-[9px] text-slate-400">Multimodal Vision LLM</div>
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5 mt-2">
                  <div className="text-xs font-bold text-white mb-0.5">YOLOv11</div>
                  <div className="text-[9px] text-slate-400">Real-Time Object Boxes</div>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center text-accent">
                <span className="material-symbols-outlined text-3xl">arrow_right_alt</span>
              </div>

              <div className="glass-card rounded-xl p-5 w-full lg:w-60 flex flex-col justify-center z-10 shrink-0 border border-accent/20">
                <div className="text-[9px] uppercase tracking-wider text-accent font-bold mb-3 text-center">
                  Otari Gateway Capabilities
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5">
                  <div className="text-xs font-bold text-white mb-0.5">Qwen 2.5 Coder 32B</div>
                  <div className="text-[9px] text-slate-400">Code Sandbox &amp; MCP Tools</div>
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5 mt-2">
                  <div className="text-xs font-bold text-teal mb-0.5">Guardrails &amp; Budgets</div>
                  <div className="text-[9px] text-slate-400">PII Shield &amp; Cost Cap</div>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center text-teal">
                <span className="material-symbols-outlined text-3xl">arrow_right_alt</span>
              </div>

              <div className="glass-card rounded-xl p-5 w-full lg:w-52 flex flex-col justify-center z-10 shrink-0 border border-slate-800">
                <div className="text-[9px] uppercase tracking-wider text-teal font-bold mb-3 text-center">
                  Creative Studio
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5">
                  <div className="text-xs font-bold text-white mb-0.5">17 Style Presets</div>
                  <div className="text-[9px] text-slate-400">Camera Portrait Synthesis</div>
                </div>
                <div className="bg-[#0A0D15] rounded-lg p-3 text-center border border-white/5 mt-2">
                  <div className="text-xs font-bold text-white mb-0.5">Scene Director</div>
                  <div className="text-[9px] text-slate-400">What-If &amp; Biographies</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* USE CASES                                                        */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section id="use-cases" className="py-24 md:py-32 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-bold tracking-widest text-xs uppercase mb-4 block">
              Real-World Applications
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
              Use Cases
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-2xl p-7">
              <div className="w-11 h-11 rounded-xl feature-icon flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-accent text-xl">
                  accessibility_new
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Visual Accessibility</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Real-time scene narration, object detection, and spoken descriptions across 8
                languages for visually impaired users.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7">
              <div className="w-11 h-11 rounded-xl feature-icon flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-teal text-xl">translate</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Multilingual Tutor</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Practice speaking or typing in Hindi, Kannada, Tamil, Telugu, Spanish, French,
                Japanese, or English with native script answers.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7">
              <div className="w-11 h-11 rounded-xl feature-icon flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-accent text-xl">palette</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Creative Camera Studio</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Turn live webcam frames into anime portraits, cinematic movie posters, or alternate
                realities with a single voice or text command.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7">
              <div className="w-11 h-11 rounded-xl feature-icon flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-teal text-xl">hub</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Open-Weight AI Workbench</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Orchestrate 5 open-weight models through Mozilla.ai Otari with PII guardrails,
                token budgets, web search, and Python verification.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FOOTER                                                           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <footer
          className="py-12 px-6 md:px-8"
          style={{
            background: 'rgba(7,5,16,0.9)',
            borderTop: '1px solid rgba(168,85,247,0.1)',
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo-icon.png"
                alt="Aetheris-OmniSense.ai"
                className="h-8 w-auto logo-glow"
              />
              <div>
                <div className="text-sm font-bold text-text-primary">
                  <span className="text-accent">Aetheris-OmniSense.ai</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Built for Mozilla.ai Otari Hackathon · Powered by Open-Weight Models
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <Link href="/voice" className="hover:text-accent transition-colors">
                Voice &amp; Text
              </Link>
              <Link href="/vision" className="hover:text-accent transition-colors">
                Vision
              </Link>
              <Link href="/otari" className="hover:text-accent transition-colors">
                Otari AI
              </Link>
              <a
                href="https://github.com/bakarezainab"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
