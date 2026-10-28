import './globals.css';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Francisco Araújo | Senior Backend Engineer | Java & Payment Systems',
  description:
    'Senior Backend Engineer with 13+ years of experience building mission-critical payment processing, ISO 8583 authorization switches, C++ SoftHSM cryptography, and distributed Java systems.',
  keywords: [
    'Senior Backend Engineer',
    'Java 21',
    'Spring Boot',
    'Payment Systems',
    'ISO 8583',
    'Distributed Systems',
    'Transactional Outbox',
    'RabbitMQ',
    'Kafka',
    'PostgreSQL',
    'C++ SoftHSM',
    'Francisco Araújo',
  ],
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

