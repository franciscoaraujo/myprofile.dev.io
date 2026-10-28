import './globals.css';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  metadataBase: new URL('https://franciscoaraujoprofile.vercel.app'),
  title: {
    default: 'Francisco Araújo | Senior Backend Engineer (Java & Payment Systems)',
    template: '%s | Francisco Araújo',
  },
  description:
    'Senior Backend Engineer (13+ years) specializing in card acquiring gateways, ISO 8583 authorization switches, C++ SoftHSM cryptography, Transactional Outbox, and high-throughput distributed Java systems.',
  keywords: [
    'Senior Backend Engineer',
    'Senior Java Developer',
    'Payment Systems Engineer',
    'Distributed Systems Engineer',
    'Java 21',
    'Spring Boot 3',
    'ISO 8583',
    'Transactional Outbox',
    'RabbitMQ',
    'PostgreSQL',
    'C++17 SoftHSM',
    'EMV NFC',
    'Spring Batch',
    'Francisco Araújo',
    'Canada Tech Recruitment',
  ],
  authors: [{ name: 'Francisco José Oliveira Araújo', url: 'https://github.com/franciscoaraujo' }],
  creator: 'Francisco Araújo',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['pt_BR'],
    url: 'https://franciscoaraujoprofile.vercel.app',
    title: 'Francisco Araújo | Senior Backend Engineer (Java & Payment Systems)',
    description:
      'Senior Backend Engineer portfolio: 13+ years building card acquiring architectures, ISO 8583 switches, C++ SoftHSM crypto simulators, and distributed Outbox pipelines.',
    siteName: 'Francisco Araújo Portfolio',
    images: [
      {
        url: '/assets/profile.jpg',
        width: 800,
        height: 800,
        alt: 'Francisco Araújo - Senior Backend Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Francisco Araújo | Senior Backend Engineer',
    description:
      'Card acquiring infrastructure, ISO 8583 switches, C++ SoftHSM cryptography, and distributed Java systems.',
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

