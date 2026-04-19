import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BuyBikes from '../components/sections/BuyBikes';

export default function PublicBikesPage() {
  return (
    <>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <BuyBikes />
      </main>
      <Footer />
    </>
  );
}
