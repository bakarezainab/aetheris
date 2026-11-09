#!/usr/bin/env python3
"""
generate_omnisense_assets.py
Generates high-resolution, futuristic 'OmniSense Eye' logo assets:
- logo-icon.png (512x512)
- logo-header.png (800x220)
- logo-banner.png (1200x630)
"""

import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Color Palette ─────────────────────────────────────────────────────────────
DARK_BG     = (4, 11, 8, 255)         # Deep cyber emerald-black
DARK_SURF   = (7, 24, 17, 255)        # Subtle dark emerald surface
CYBER_EMERALD = (0, 245, 155, 255)    # #00F59B
NEON_LIME   = (163, 230, 53, 255)     # #A3E635
DEEP_GREEN  = (5, 150, 105, 255)      # #059669
GLOW_CYBER  = (0, 245, 155, 60)
GLOW_LIME   = (163, 230, 53, 50)
WHITE       = (236, 253, 245, 255)


def draw_omnisense_eye(draw: ImageDraw.ImageDraw, cx: float, cy: float, size: float, glow: bool = True):
    """
    Draws a cybernetic, omniscient eye at (cx, cy) with diameter ~ size.
    Features:
    - Glowing outer orbital ellipse (soundwaves/celestial horizon)
    - Sleek upper & lower cybernetic eyelid curves
    - Segmented aperture ring
    - High-tech circular iris with concentric radar reticle
    - Central pulsing cyber-pupil with reflective highlight
    """
    r_eye = size * 0.46
    
    # 1. Orbital soundwave rings (Multimodal perception horizon)
    orbit_w = r_eye * 1.35
    orbit_h = r_eye * 0.52
    draw.ellipse(
        [cx - orbit_w, cy - orbit_h, cx + orbit_w, cy + orbit_h],
        outline=(0, 245, 155, 110),
        width=int(max(2, size * 0.015))
    )
    
    # Counter-orbital tilted ring
    orbit_w2 = r_eye * 1.15
    orbit_h2 = r_eye * 0.42
    draw.ellipse(
        [cx - orbit_w2, cy - orbit_h2, cx + orbit_w2, cy + orbit_h2],
        outline=(163, 230, 53, 90),
        width=int(max(1, size * 0.01))
    )

    # 2. Outer Eye Silhouette (Futuristic pointed ellipse)
    # Upper lid curve
    pts_upper = []
    steps = 40
    for i in range(steps + 1):
        t = i / steps
        x = cx - r_eye + 2 * r_eye * t
        # Arc with smooth curve
        normalized_x = (x - cx) / r_eye
        if abs(normalized_x) <= 1:
            y = cy - math.sqrt(max(0, 1 - normalized_x**2)) * (r_eye * 0.65)
            pts_upper.append((x, y))

    # Lower lid curve
    pts_lower = []
    for i in range(steps + 1):
        t = i / steps
        x = cx + r_eye - 2 * r_eye * t
        normalized_x = (x - cx) / r_eye
        if abs(normalized_x) <= 1:
            y = cy + math.sqrt(max(0, 1 - normalized_x**2)) * (r_eye * 0.65)
            pts_lower.append((x, y))

    full_eye_pts = pts_upper + pts_lower

    # Fill eye socket with deep dark emerald gradient
    draw.polygon(full_eye_pts, fill=(5, 18, 13, 230), outline=(0, 245, 155, 230))
    # Double stroke upper lid for bold high-tech appearance
    draw.line(pts_upper, fill=CYBER_EMERALD, width=int(max(3, size * 0.024)))
    draw.line(pts_lower, fill=NEON_LIME, width=int(max(2, size * 0.018)))

    # 3. Cybernetic Eyelid accents (corner sensory pins)
    pin_r = size * 0.025
    draw.ellipse([cx - r_eye - pin_r, cy - pin_r, cx - r_eye + pin_r, cy + pin_r], fill=CYBER_EMERALD)
    draw.ellipse([cx + r_eye - pin_r, cy - pin_r, cx + r_eye + pin_r, cy + pin_r], fill=NEON_LIME)

    # 4. Aperture / Reticle Ring (Segmented ticks around iris)
    r_aperture = r_eye * 0.52
    draw.ellipse(
        [cx - r_aperture, cy - r_aperture, cx + r_aperture, cy + r_aperture],
        outline=(0, 245, 155, 160),
        width=int(max(2, size * 0.012))
    )
    # Ticks
    for deg in range(0, 360, 30):
        rad = math.radians(deg)
        x1 = cx + math.cos(rad) * (r_aperture - size * 0.015)
        y1 = cy + math.sin(rad) * (r_aperture - size * 0.015)
        x2 = cx + math.cos(rad) * (r_aperture + size * 0.015)
        y2 = cy + math.sin(rad) * (r_aperture + size * 0.015)
        col = NEON_LIME if deg % 60 == 0 else CYBER_EMERALD
        draw.line([(x1, y1), (x2, y2)], fill=col, width=int(max(2, size * 0.01)))

    # 5. Iris Core (Multi-layered omniscient lens)
    r_iris = r_eye * 0.36
    draw.ellipse(
        [cx - r_iris, cy - r_iris, cx + r_iris, cy + r_iris],
        fill=(8, 30, 22, 255),
        outline=CYBER_EMERALD,
        width=int(max(3, size * 0.02))
    )

    # Concentric scan line
    r_scan = r_iris * 0.72
    draw.ellipse(
        [cx - r_scan, cy - r_scan, cx + r_scan, cy + r_scan],
        outline=NEON_LIME,
        width=int(max(1, size * 0.009))
    )

    # 6. Central Pupil (Pulsing black void with neon center)
    r_pupil = r_iris * 0.44
    draw.ellipse(
        [cx - r_pupil, cy - r_pupil, cx + r_pupil, cy + r_pupil],
        fill=(2, 6, 4, 255),
        outline=CYBER_EMERALD,
        width=int(max(2, size * 0.012))
    )

    # Pupil core dot
    r_core = r_pupil * 0.38
    draw.ellipse(
        [cx - r_core, cy - r_core, cx + r_core, cy + r_core],
        fill=CYBER_EMERALD
    )

    # Specular catchlight (gives the omniscient eye an active, alive feel)
    draw.ellipse(
        [cx - r_iris * 0.35, cy - r_iris * 0.38, cx - r_iris * 0.15, cy - r_iris * 0.18],
        fill=(255, 255, 255, 240)
    )
    draw.ellipse(
        [cx + r_iris * 0.18, cy + r_iris * 0.22, cx + r_iris * 0.30, cy + r_iris * 0.34],
        fill=(163, 230, 53, 200)
    )


def create_logo_icon():
    """Generates 512x512 logo-icon.png with rich glow effect."""
    W, H = 512, 512
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    # Background rounded container
    bg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    margin = 16
    bg_draw.rounded_rectangle([margin, margin, W - margin, H - margin], radius=110, fill=DARK_BG)
    bg_draw.rounded_rectangle([margin, margin, W - margin, H - margin], radius=110, outline=DEEP_GREEN, width=4)

    # Radial ambient glow behind eye
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for r in range(180, 20, -10):
        alpha = int(35 * (1 - r / 180))
        glow_draw.ellipse([256 - r, 256 - r, 256 + r, 256 + r], fill=(0, 245, 155, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(25))

    # Eye layer
    eye_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    eye_draw = ImageDraw.Draw(eye_layer)
    draw_omnisense_eye(eye_draw, 256, 256, size=400)

    # Composite
    final = Image.alpha_composite(bg, glow)
    final = Image.alpha_composite(final, eye_layer)
    final.save("/home/idealz/My-Project/Otari-VoxVision/frontend/public/logo-icon.png", "PNG")
    print("Saved logo-icon.png (512x512)")


def create_logo_header():
    """Generates 800x220 logo-header.png with typography."""
    W, H = 800, 220
    img = Image.new("RGBA", (W, H), DARK_BG)
    draw = ImageDraw.Draw(img)

    # Subtle background gradient
    for y in range(H):
        t = y / H
        r = int(4 + t * 4)
        g = int(11 + t * 10)
        b = int(8 + t * 6)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # Glow under icon
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse([40, 30, 220, 190], fill=(0, 245, 155, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # Draw eye on left
    draw_omnisense_eye(draw, 125, 110, size=180)

    # Typography on right
    # Try default sans font
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
        font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    # Brand Title: AETHERIS
    draw.text((250, 48), "AETHERIS", font=font_large, fill=CYBER_EMERALD)
    # Brand Subtitle: OMNISENSE
    draw.text((545, 52), "OMNISENSE", font=font_sub, fill=NEON_LIME)

    # Baseline tagline
    draw.text((252, 114), "Multimodal Voice & Vision • Powered by Mozilla.ai Otari", font=font_sub, fill=(200, 240, 225, 230))

    # Subtle badge
    badge_x, badge_y, badge_w, badge_h = 252, 148, 260, 28
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=14, fill=(5, 30, 20, 255), outline=CYBER_EMERALD, width=1)
    draw.text((badge_x + 14, badge_y + 6), "⚡ 100/100 OTARI AI CONTROL PLANE", font=font_badge, fill=CYBER_EMERALD)

    img.save("/home/idealz/My-Project/Otari-VoxVision/frontend/public/logo-header.png", "PNG")
    print("Saved logo-header.png (800x220)")


def create_logo_banner():
    """Generates 1200x630 OpenGraph / Social banner."""
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), DARK_BG)
    draw = ImageDraw.Draw(img)

    # Ambient radial glows
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse([600 - 320, 315 - 320, 600 + 320, 315 + 320], fill=(0, 245, 155, 30))
    g_draw.ellipse([200, 100, 500, 400], fill=(163, 230, 53, 20))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # Border
    draw.rectangle([0, 0, W - 1, H - 1], outline=(0, 245, 155, 90), width=3)

    # Giant OmniSense Eye in center-left
    draw_omnisense_eye(draw, 340, 315, size=460)

    # Typography on right
    try:
        font_hero = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 68)
        font_omni = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
        font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        font_pill = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    except:
        font_hero = font_omni = font_body = font_pill = ImageFont.load_default()

    # Pill
    draw.rounded_rectangle([660, 130, 1110, 172], radius=21, fill=(8, 32, 22, 255), outline=CYBER_EMERALD, width=2)
    draw.text((680, 140), "🌐 MOZILLA DEVS WILDING HACKATHON", font=font_pill, fill=CYBER_EMERALD)

    # Title
    draw.text((660, 195), "AETHERIS", font=font_hero, fill=WHITE)
    draw.text((660, 275), "OMNISENSE AI", font=font_omni, fill=NEON_LIME)

    # Description
    desc_lines = [
        "All-Seeing Multimodal Assistant",
        "• Real-Time Multilingual Voice (8 Languages)",
        "• Live Webcam Scene & Object Intelligence",
        "• 5 Open-Weight Models on Mozilla.ai Otari",
        "• Autonomous Budgets ($20 Cap) & PII Guardrails",
    ]
    y_pos = 345
    for line in desc_lines:
        color = CYBER_EMERALD if line.startswith("•") else (200, 245, 225, 240)
        draw.text((660, y_pos), line, font=font_body, fill=color)
        y_pos += 42

    img.save("/home/idealz/My-Project/Otari-VoxVision/frontend/public/logo-banner.png", "PNG")
    print("Saved logo-banner.png (1200x630)")


if __name__ == "__main__":
    create_logo_icon()
    create_logo_header()
    create_logo_banner()
    print("All OmniSense logo assets successfully created!")
