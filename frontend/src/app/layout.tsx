import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://aetheris.ai'),
  title: 'Aetheris OmniSense — Multimodal Voice, Vision & Otari AI Studio',
  description:
    'Real-time multilingual voice, live webcam vision, and multi-model open-weight routing powered by Mozilla.ai Otari Gateway.',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo-icon.png',
  },
  openGraph: {
    title: 'Aetheris OmniSense — Multimodal Voice, Vision & Otari AI Studio',
    description:
      '5 Open-Weight Models, Voice + Vision + Chat, Web Search, Code Execution, MCP Servers & Smart Budget Governance.',
    url: 'https://github.com/bakarezainab/aetheris',
    images: ['/logo-banner.png'],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#040B08] text-[#ECFDF5] antialiased">
        {children}
      </body>
    </html>
  );
}
