import { useState, useEffect, useRef, useCallback } from 'react';
import Hero from '../components/sections/Hero';
import OurCollection from '../components/sections/OurCollection';
import OurDealBrands from '../components/sections/OurDealBrands';
import BookYourDreamBike from '../components/sections/BookYourDreamBike';
import WhyChooseUs from '../components/sections/WhyChooseUs';
import Reviews from '../components/sections/Reviews';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Gallery from '../components/Gallery';

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @media (max-width: 940px) {
          .desktop-layout         { display: none !important; }
          .desktop-overlay-side   { display: none !important; }
          .desktop-overlay-bottom { display: none !important; }
          .mobile-layout          { display: flex !important; }
          .mobile-overlay         { display: block !important; }
        }
        @media (min-width: 941px) {
          .desktop-layout         { display: flex !important; }
          .desktop-overlay-side   { display: block !important; }
          .desktop-overlay-bottom { display: block !important; }
          .mobile-layout          { display: none !important; }
          .mobile-overlay         { display: none !important; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flexGrow: 1 }}>
          <Hero />
          <OurDealBrands />
          <WhyChooseUs />
          <BookYourDreamBike />
          <Gallery showExplore={true} showHeader={true} />
          <Reviews />
        </main>
        <Footer />
      </div>
    </>
  );
}