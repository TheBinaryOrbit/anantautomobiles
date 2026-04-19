import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Blogs from '../components/sections/Blogs';

export default function BlogsPage() {
  return (
    <>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Blogs />
      </main>
      <Footer />
    </>
  );
}
