import './globals.css';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  metadataBase: new URL('https://franciscoaraujoprofile.vercel.app'),
  title: {
    default: 'Francisco Araújo | Engenheiro de Software Especialista | Backend Java & C++',
    template: '%s | Francisco Araújo',
  },
  description:
    'Engenheiro de Software com 13 anos em desenvolvimento backend (Java e C++). Atuação no setor financeiro desde 2019 e especialização em sistemas de pagamento de missão crítica desde 2023: autorização, criptografia, compensação e liquidação.',
  keywords: [
    'Engenheiro de Software Especialista',
    'Senior Backend Engineer',
    'Specialist Software Engineer',
    'Java 21 C++',
    'Payment Systems Engineer',
    'Distributed Systems Engineer',
    'Rabobank Brasil',
    'B3 Stock Exchange',
    'Serasa Experian',
    'ISO 8583 Switch',
    'Transactional Outbox',
    'C++ SoftHSM',
    'Clearing Base II',
    'Spring Batch',
    'Francisco Araújo',
  ],
  authors: [{ name: 'Francisco José Oliveira Araújo', url: 'https://github.com/orgs/Orion-Payments/repositories' }],
  creator: 'Francisco Araújo',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['pt_BR'],
    url: 'https://franciscoaraujoprofile.vercel.app',
    title: 'Francisco Araújo | Specialist Software Engineer | Backend Java & C++',
    description:
      'Software Engineer with 13 years in backend development (Java and C++). Working in the financial sector since 2019 and specialized in mission-critical payment systems since 2023: authorization, cryptography, clearing and settlement.',
    siteName: 'Francisco Araújo Portfolio',
    images: [
      {
        url: '/assets/profile.jpg',
        width: 800,
        height: 800,
        alt: 'Francisco Araújo - Specialist Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Francisco Araújo | Specialist Software Engineer',
    description:
      'Software Engineer with 13 years in backend development (Java and C++). Working in the financial sector since 2019 and specialized in mission-critical payment systems since 2023.',
    images: ['/assets/profile.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="bg-[#040711] text-slate-200 font-sans antialiased selection:bg-[#00D47E]/30 selection:text-[#00D47E] overflow-x-hidden min-h-screen flex flex-col">
        <AppProvider>
          <Navbar />
          <main id="main-content" className="relative fintech-grid radial-mesh overflow-hidden flex-1">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}

