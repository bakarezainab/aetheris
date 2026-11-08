# Aetheris OmniSense — Next.js Frontend

The modern Next.js 16 (App Router) interface for **Aetheris OmniSense**, built for the **Mozilla.ai Otari Hackathon — Devs Wilding Online!**.

## Routes & Modalities

- `/` — Interactive landing page with feature deep dives, system roadmaps, and architecture benchmarks
- `/voice` — Multilingual voice & text interface with 3D canvas world globe, 8 native-script languages, real-time waveform visualizer, and Kokoro/gTTS audio
- `/vision` — Live webcam vision with YOLOv11 real-time bounding boxes, visual greeting, and creative scene transformations
- `/otari` — Focused Otari AI Studio with 5 segmented workspaces (Open-Weight Chat, 4-Model Council, Web Grounding, Python Sandbox, Governance & MCP)

## Technology Stack

- **Framework**: Next.js 16.1.6 (App Router & Turbopack)
- **Styling**: Tailwind CSS v4 with custom Bio-Luminescent Cyber-Emerald theme (`#00F59B` / `#059669`)
- **Animations**: Framer Motion & custom 3D HTML5 Canvas rendering
- **Icons**: Lucide React & Google Material Symbols Outlined
- **API Proxy**: Seamless rewrites from `/api/*` to FastAPI backend (`http://localhost:8000`)

## Running Locally

```bash
npm run dev    # Starts Next.js development server on port 5173
npm run build  # Compiles optimized production build
npm run start  # Serves production build on port 5173
```
