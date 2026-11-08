'use client';

import { useEffect, useRef } from 'react';

interface MultilingualWorldCanvasProps {
  phase: string;
  activeLanguage?: string;
  audioLevel?: number;
}

interface LangNode {
  code: string;
  script: string;
  greeting: string;
  lat: number;
  lon: number;
  color: string;
}

const MULTILINGUAL_NODES: LangNode[] = [
  { code: 'en', script: 'English', greeting: 'Hello • Otari AI', lat: 0.35, lon: 0.0, color: '#00F59B' },
  { code: 'hi', script: 'हिन्दी', greeting: 'नमस्ते • हिंदी', lat: 0.28, lon: 0.9, color: '#A3E635' },
  { code: 'kn', script: 'ಕನ್ನಡ', greeting: 'ನಮಸ್ಕಾರ • ಕನ್ನಡ', lat: -0.18, lon: 1.75, color: '#00F59B' },
  { code: 'ta', script: 'தமிழ்', greeting: 'வணக்கம் • தமிழ்', lat: -0.35, lon: 2.55, color: '#34D399' },
  { code: 'te', script: 'తెలుగు', greeting: 'నమస్కారం • తెలుగు', lat: 0.12, lon: 3.35, color: '#A3E635' },
  { code: 'es', script: 'Español', greeting: 'Hola • Español', lat: -0.25, lon: 4.15, color: '#00F59B' },
  { code: 'fr', script: 'Français', greeting: 'Bonjour • Français', lat: 0.42, lon: 4.95, color: '#34D399' },
  { code: 'ja', script: '日本語', greeting: 'こんにちは • 日本語', lat: 0.08, lon: 5.65, color: '#A3E635' },
];

export default function MultilingualWorldCanvas({
  phase,
  activeLanguage = 'en',
  audioLevel = 0,
}: MultilingualWorldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    let pulseTick = 0;

    // Precompute sphere surface dots (Fibonacci lattice)
    const numDots = 460;
    const sphereDots: Array<{ lat: number; lon: number; isHighlight: boolean }> = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < numDots; i++) {
      const y = 1 - (i / (numDots - 1)) * 2;
      const lat = Math.asin(y);
      const lon = goldenAngle * i;
      sphereDots.push({ lat, lon, isHighlight: i % 9 === 0 });
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h * 0.44;

      const isActive = phase === 'recording' || phase === 'thinking' || phase === 'speaking' || phase === 'generating_image';
      const speed = isActive ? 0.011 : 0.0042;
      rotation += speed;
      pulseTick += 0.04;

      const baseRadius = Math.min(w, h) * 0.27;
      const dynamicBoost = isActive ? Math.sin(pulseTick * 2) * 8 + audioLevel * 28 : Math.sin(pulseTick) * 3;
      const R = baseRadius + dynamicBoost;

      ctx.clearRect(0, 0, w, h);

      // 1. Ambient bio-luminescent radial backdrop glow
      const bgGrad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 2.1);
      bgGrad.addColorStop(0, isActive ? 'rgba(0, 245, 155, 0.20)' : 'rgba(0, 245, 155, 0.11)');
      bgGrad.addColorStop(0.45, 'rgba(5, 150, 105, 0.06)');
      bgGrad.addColorStop(1, 'rgba(4, 11, 8, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Outer orbital sonic rings (depicting global multilingual transmission)
      for (let ring = 1; ring <= 3; ring++) {
        const ringR = R * (1.14 + ring * 0.16) + (isActive ? Math.sin(pulseTick * 1.8 - ring) * 6 : 0);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((ring % 2 === 0 ? 1 : -1) * rotation * 0.35 + ring * 0.5);
        ctx.scale(1, 0.38 + ring * 0.08);
        ctx.beginPath();
        ctx.arc(0, 0, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = ring === 2 ? 'rgba(163, 230, 53, 0.18)' : 'rgba(0, 245, 155, 0.16)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([8, 12]);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Wireframe latitude & longitude meridians on the 3D globe
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 245, 155, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Latitude parallels
      const latitudes = [-0.6, -0.3, 0, 0.3, 0.6];
      for (const lat of latitudes) {
        const yOff = Math.sin(lat) * R;
        const rLat = Math.cos(lat) * R;
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOff, rLat, rLat * 0.22, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 245, 155, 0.11)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Longitude meridians
      for (let m = 0; m < 6; m++) {
        const lonAngle = rotation + (m * Math.PI) / 6;
        const xScale = Math.abs(Math.cos(lonAngle));
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(2, R * xScale), R, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // 4. 3D Fibonacci world lattice dots
      const tilt = 0.22;
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);

      for (const dot of sphereDots) {
        const lon = dot.lon + rotation;
        const cosLat = Math.cos(dot.lat);
        const sinLat = Math.sin(dot.lat);
        const x3d = cosLat * Math.sin(lon);
        const y3dRaw = sinLat;
        const z3dRaw = cosLat * Math.cos(lon);

        const y3d = y3dRaw * cosTilt - z3dRaw * sinTilt;
        const z3d = y3dRaw * sinTilt + z3dRaw * cosTilt;

        if (z3d < -0.25) continue; // backface culling with soft horizon

        const depthAlpha = Math.max(0.08, (z3d + 0.3) / 1.3);
        const sx = cx + x3d * R;
        const sy = cy + y3d * R;
        const dotRadius = dot.isHighlight ? 2.2 : 1.3;

        ctx.beginPath();
        ctx.arc(sx, sy, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = dot.isHighlight
          ? `rgba(163, 230, 53, ${depthAlpha * 0.85})`
          : `rgba(0, 245, 155, ${depthAlpha * 0.55})`;
        ctx.fill();
      }

      // 5. Project & draw the 8 Orbiting Multilingual Otari Language Nodes + connecting arcs
      const projectedNodes: Array<{
        node: LangNode;
        x: number;
        y: number;
        z: number;
        anchorX: number;
        anchorY: number;
      }> = [];

      for (let i = 0; i < MULTILINGUAL_NODES.length; i++) {
        const n = MULTILINGUAL_NODES[i];
        const lon = n.lon + rotation * 0.85;
        const cosLat = Math.cos(n.lat);
        const sinLat = Math.sin(n.lat);

        const x3d = cosLat * Math.sin(lon);
        const y3dRaw = sinLat;
        const z3dRaw = cosLat * Math.cos(lon);

        const y3d = y3dRaw * cosTilt - z3dRaw * sinTilt;
        const z3d = y3dRaw * sinTilt + z3dRaw * cosTilt;

        const anchorX = cx + x3d * R;
        const anchorY = cy + y3d * R;

        // Orbiting label position slightly outside the globe surface
        const orbitR = R * 1.32;
        const ox = cx + x3d * orbitR;
        const oy = cy + y3d * (R * 1.15);

        projectedNodes.push({
          node: n,
          x: ox,
          y: oy,
          z: z3d,
          anchorX,
          anchorY,
        });
      }

      // Draw neural arcs between visible language nodes on the globe
      for (let i = 0; i < projectedNodes.length; i++) {
        const a = projectedNodes[i];
        const b = projectedNodes[(i + 1) % projectedNodes.length];
        if (a.z > -0.1 && b.z > -0.1) {
          ctx.beginPath();
          ctx.moveTo(a.anchorX, a.anchorY);
          const midX = (a.anchorX + b.anchorX) / 2;
          const midY = (a.anchorY + b.anchorY) / 2 - 28;
          ctx.quadraticCurveTo(midX, midY, b.anchorX, b.anchorY);
          ctx.strokeStyle = 'rgba(0, 245, 155, 0.25)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // Sort back-to-front for crisp pill rendering
      projectedNodes.sort((a, b) => a.z - b.z);

      ctx.font = '600 12px Inter, system-ui, sans-serif';
      for (const item of projectedNodes) {
        if (item.z < -0.35) continue;
        const alpha = Math.max(0.22, Math.min(1, (item.z + 0.5) / 1.3));
        const isCurrentLang = item.node.code === activeLanguage;

        // Anchor pulse on globe surface
        ctx.beginPath();
        ctx.arc(item.anchorX, item.anchorY, isCurrentLang ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentLang ? '#A3E635' : '#00F59B';
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Tether line from globe anchor to floating language pill
        ctx.beginPath();
        ctx.moveTo(item.anchorX, item.anchorY);
        ctx.lineTo(item.x, item.y);
        ctx.strokeStyle = isCurrentLang ? 'rgba(163, 230, 53, 0.65)' : 'rgba(0, 245, 155, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pill badge with native script
        const label = `${item.node.script}`;
        const metrics = ctx.measureText(label);
        const padX = 10;
        const pillW = metrics.width + padX * 2 + 16;
        const pillH = 24;
        const px = item.x - pillW / 2;
        const py = item.y - pillH / 2;

        ctx.beginPath();
        ctx.roundRect(px, py, pillW, pillH, 12);
        ctx.fillStyle = isCurrentLang ? 'rgba(6, 78, 59, 0.92)' : 'rgba(4, 14, 10, 0.82)';
        ctx.fill();
        ctx.strokeStyle = isCurrentLang ? '#A3E635' : 'rgba(0, 245, 155, 0.42)';
        ctx.lineWidth = isCurrentLang ? 1.6 : 1;
        ctx.stroke();

        // Status dot inside pill
        ctx.beginPath();
        ctx.arc(px + 10, item.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = item.node.color;
        ctx.fill();

        // Native script text
        ctx.fillStyle = '#ECFDF5';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, px + 18, item.y + 0.5);
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [phase, activeLanguage, audioLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-label="Otari Multilingual World Globe Animation"
    />
  );
}
