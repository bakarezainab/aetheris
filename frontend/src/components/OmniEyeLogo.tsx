'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface OmniEyeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
  glow?: boolean;
}

export default function OmniEyeLogo({
  size = 'md',
  showText = false,
  className = '',
  glow = true,
}: OmniEyeLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Compute pixel dimensions
  const dim =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 32
      : size === 'md'
      ? 42
      : size === 'lg'
      ? 64
      : 96;

  return (
    <div
      className={`inline-flex items-center gap-3 select-none cursor-pointer group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── The Omniscient Eye Graphic ── */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: dim, height: dim }}
      >
        {/* Ambient Neon Backlight Glow */}
        {glow && (
          <motion.div
            className="absolute inset-0 rounded-full blur-md pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,245,155,0.45) 0%, rgba(163,230,53,0.18) 55%, transparent 75%)',
            }}
            animate={{
              scale: isHovered ? [1, 1.35, 1.2] : [1, 1.15, 1],
              opacity: isHovered ? [0.7, 1, 0.85] : [0.5, 0.75, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
        )}

        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <radialGradient id="omniEyeBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00F59B" stop-opacity="0.32" />
              <stop offset="60%" stop-color="#059669" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#040B08" stop-opacity="1" />
            </radialGradient>
            <linearGradient id="omniLidGrad" x1="10" y1="60" x2="110" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#00F59B" />
              <stop offset="50%" stop-color="#10B981" />
              <stop offset="100%" stop-color="#A3E635" />
            </linearGradient>
            <linearGradient id="omniIrisGrad" x1="38" y1="38" x2="82" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#A3E635" />
              <stop offset="50%" stop-color="#00F59B" />
              <stop offset="100%" stop-color="#059669" />
            </linearGradient>
            <filter id="omniGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Hexagonal Outer Neural Sensor Frame */}
          <polygon
            points="60,12 102,36 102,84 60,108 18,84 18,36"
            stroke="url(#omniLidGrad)"
            strokeWidth="1.8"
            fill="none"
            strokeLinejoin="round"
            opacity="0.5"
          />

          {/* Orbital Multimodal Wave Rings */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: isHovered ? 10 : 22, ease: 'linear' }}
            style={{ originX: '60px', originY: '60px' }}
          >
            <ellipse
              cx="60"
              cy="60"
              rx="48"
              ry="20"
              transform="rotate(-25 60 60)"
              stroke="#00F59B"
              strokeWidth="1.4"
              strokeDasharray="4 4"
              opacity="0.75"
            />
          </motion.g>

          <motion.g
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: isHovered ? 12 : 28, ease: 'linear' }}
            style={{ originX: '60px', originY: '60px' }}
          >
            <ellipse
              cx="60"
              cy="60"
              rx="44"
              ry="18"
              transform="rotate(30 60 60)"
              stroke="#A3E635"
              strokeWidth="1.2"
              strokeDasharray="3 5"
              opacity="0.65"
            />
          </motion.g>

          {/* Outer Cybernetic Eyelid Curves (Sleek pointed eye) */}
          <path
            d="M 14 60 C 34 26, 86 26, 106 60"
            fill="none"
            stroke="url(#omniLidGrad)"
            strokeWidth="3.6"
            strokeLinecap="round"
            filter="url(#omniGlow)"
          />
          <path
            d="M 14 60 C 34 94, 86 94, 106 60"
            fill="none"
            stroke="url(#omniLidGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#omniGlow)"
          />

          {/* Corner Sensory Anchors */}
          <circle cx="14" cy="60" r="3.2" fill="#00F59B" />
          <circle cx="106" cy="60" r="3.2" fill="#A3E635" />

          {/* Rotating Aperture Reticle */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: isHovered ? 6 : 14, ease: 'linear' }}
            style={{ originX: '60px', originY: '60px' }}
          >
            <circle
              cx="60"
              cy="60"
              r="24"
              fill="#040B08"
              stroke="#00F59B"
              strokeWidth="1.6"
              strokeDasharray="3 3"
              opacity="0.9"
            />
            {/* Aperture Radar Ticks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1={60 + 21 * Math.cos((deg * Math.PI) / 180)}
                y1={60 + 21 * Math.sin((deg * Math.PI) / 180)}
                x2={60 + 26 * Math.cos((deg * Math.PI) / 180)}
                y2={60 + 26 * Math.sin((deg * Math.PI) / 180)}
                stroke={deg % 90 === 0 ? '#A3E635' : '#00F59B'}
                strokeWidth="1.5"
              />
            ))}
          </motion.g>

          {/* Glowing Omniscient Iris */}
          <motion.circle
            cx="60"
            cy="60"
            r="16"
            fill="url(#omniIrisGrad)"
            stroke="#ECFDF5"
            strokeWidth="1.4"
            filter="url(#omniGlow)"
            animate={{
              scale: isHovered ? [1, 1.14, 1.08] : [1, 1.05, 1],
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            style={{ originX: '60px', originY: '60px' }}
          />

          {/* Inner Circular Scanner Track */}
          <circle cx="60" cy="60" r="10.5" fill="none" stroke="#040B08" strokeWidth="2" opacity="0.8" />

          {/* Central Cyber Pupil (Dilating on Hover) */}
          <motion.circle
            cx="60"
            cy="60"
            r={isHovered ? 6 : 7}
            fill="#040B08"
            animate={{
              scale: isHovered ? [0.85, 1.15, 0.95] : [1, 0.9, 1],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ originX: '60px', originY: '60px' }}
          />

          {/* Glowing Core Micro-Dot */}
          <circle cx="60" cy="60" r="2.8" fill="#00F59B" />

          {/* Specular Catchlights */}
          <circle cx="55" cy="55" r="2.4" fill="#FFFFFF" opacity="0.95" />
          <circle cx="65" cy="65" r="1.2" fill="#A3E635" opacity="0.85" />
        </svg>
      </div>

      {/* ── Brand Typography (Optional) ── */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className="text-lg font-bold tracking-tight"
              style={{
                color: '#ECFDF5',
                letterSpacing: '-0.02em',
                textShadow: '0 0 16px rgba(0,245,155,0.3)',
              }}
            >
              AETHERIS
            </span>
            <span
              className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider"
              style={{
                background: 'rgba(0,245,155,0.14)',
                border: '1px solid rgba(0,245,155,0.35)',
                color: '#00F59B',
              }}
            >
              OMNISENSE
            </span>
          </div>
          <span
            className="text-[10px] font-medium tracking-wide flex items-center gap-1 opacity-70"
            style={{ color: '#A3E635' }}
          >
            <span>Powered by Mozilla.ai Otari</span>
          </span>
        </div>
      )}
    </div>
  );
}
