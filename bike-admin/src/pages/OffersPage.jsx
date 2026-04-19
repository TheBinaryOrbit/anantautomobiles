import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Offers from '../components/sections/Offers';

export default function OffersPage() {
  return (
    <>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Offers />
      </main>
      <Footer />
    </>
  );
}
