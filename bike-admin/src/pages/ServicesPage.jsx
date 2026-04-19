import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Services from '../components/sections/Services';

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Services />
      </main>
      <Footer />
    </>
  );
}
