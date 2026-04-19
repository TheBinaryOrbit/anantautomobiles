import { useState, useEffect } from 'react';

const allBikes = [
  { id: 1, name: 'Splendor Plus', brand: 'Hero', category: 'Commuter', price: '₹75,000', emi: '₹2,100/mo', img: 'https://mrgmotors.com/wp-content/uploads/2022/01/splendor-plus-ibs-i3s-21-removebg-preview.png', fuel: '65 kmpl', engine: '97.2cc', tag: 'Best Seller' },
  { id: 2, name: 'HF Deluxe', brand: 'Hero', category: 'Commuter', price: '₹60,000', emi: '₹1,700/mo', img: 'https://imgd.aeplcdn.com/370x208/n/cw/ec/212719/hf-deluxe-right-side-view-2.png?isig=0&q=100', fuel: '60 kmpl', engine: '97.2cc', tag: '' },
  { id: 3, name: 'Xtreme 125R', brand: 'Hero', category: 'Sports', price: '₹95,000', emi: '₹2,700/mo', img: 'https://www.heromotocorp.com/content/dam/hero-commerce/in/en/products/performance/xtreme-125r/HXTRSASSCFIBPR/360/2.png', fuel: '55 kmpl', engine: '124.7cc', tag: 'New' },
  { id: 4, name: 'Glamour', brand: 'Hero', category: 'Premium', price: '₹85,000', emi: '₹2,400/mo', img: 'https://bikebazardelhi.com/uploads/vehicle/4545-removebg-preview.png', fuel: '55 kmpl', engine: '124.7cc', tag: '' },
  { id: 5, name: 'Passion X Pro', brand: 'Hero', category: 'Commuter', price: '₹72,000', emi: '₹2,000/mo', img: 'https://imgd.aeplcdn.com/370x208/n/cw/ec/33252/passion-xpro-right-side-view.png?isig=0&q=100', fuel: '62 kmpl', engine: '97.2cc', tag: '' },
  { id: 6, name: 'Destini 125', brand: 'Hero', category: 'Scooter', price: '₹82,000', emi: '₹2,300/mo', img: 'https://imgd.aeplcdn.com/370x208/n/cw/ec/39082/destini-125-right-side-view.png?isig=0&q=100', fuel: '51 kmpl', engine: '124.6cc', tag: 'Popular' },
  { id: 7, name: 'Mavrick 440', brand: 'Hero', category: 'Premium', price: '₹1,98,000', emi: '₹5,600/mo', img: 'https://www.heromotocorp.com/content/dam/hero-commerce/in/en/products/performance/mavrick-440/HMVK440ACSSBR/360/1.png', fuel: '35 kmpl', engine: '440cc', tag: 'New' },
  { id: 8, name: 'Xoom 110', brand: 'Hero', category: 'Scooter', price: '₹78,000', emi: '₹2,200/mo', img: 'https://imgd.aeplcdn.com/370x208/n/cw/ec/200827/xoom-110-right-side-view.png?isig=0&q=100', fuel: '50 kmpl', engine: '110cc', tag: '' },
];

const categories = ['All', 'Commuter', 'Sports', 'Premium', 'Scooter'];

export default function BuyBikes() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hovered, setHovered] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  const scrollToBook = () => {
    const el = document.getElementById('book-your-dream-bike');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = '/#book-your-dream-bike';
  };

  let filtered = allBikes.filter(b => activeCategory === 'All' || b.category === activeCategory);
  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, '')));
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, '')));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Barlow', sans-serif; background: #f5f5f5; }
        .bike-card { transition: transform 0.28s ease, box-shadow 0.28s ease; }
        .bike-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.13) !important; }
        .bike-card:hover .bike-img { transform: scale(1.07); }
        .bike-img { transition: transform 0.4s ease; }
        .cat-btn { transition: all 0.18s ease; }
        .cat-btn:hover { background: #111 !important; color: #fff !important; border-color: #111 !important; }
        .enquire-btn { transition: all 0.22s ease; }
        .enquire-btn:hover { background: #cc0000 !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(230,0,0,0.4) !important; }
        @media (max-width: 480px) {
          .bike-card { margin: 0 !important; }
          .bike-card:hover { transform: translateY(-3px) !important; }
          .hero-h1 { font-size: clamp(28px, 11vw, 45px) !important; }
          .filters-row { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .filters-row select { width: 100% !important; }
          .filters-row > div { width: 100% !important; }
          .filters-row .cat-btn { font-size: 12px !important; padding: 6px 12px !important; }
          .bike-card img { height: 100px !important; }
        }
        @media (max-width: 640px) {
          .bikes-grid { grid-template-columns: 1fr !important; }
          .hero-h1 { font-size: clamp(32px, 12vw, 56px) !important; }
          .filters-row { flex-direction: column !important; align-items: stretch !important; }
          .stats-row { gap: 20px !important; flex-direction: column !important; }
          .stat-item { flex: 1 !important; }
          .hero-bike-img { display: none !important; }
        }
        @media (max-width: 768px) {
          .hero-section { padding: 80px 4vw 60px !important; }
          .stat-label { margin-top: 2px !important; font-size: 12px !important; }
          .stat-value { font-size: 28px !important; }
        }
        @media (max-width: 900px) {
          .bikes-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 1024px) {
          .bikes-grid { gap: 16px !important; }
        }
      `}</style>

      {/* Hero Banner */}
      <section style={{
        background: '#111',
        backgroundImage: 'url(/images/bg1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        padding: 'clamp(60px, 15vw, 120px) 5vw clamp(50px, 12vw, 80px)',
        color: '#fff',
        overflow: 'hidden',
      }} className="hero-section">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(20px, 5vw, 60px)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 auto', minWidth: 300 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(10px, 2vw, 13px)', fontWeight: 700, letterSpacing: '3px', color: '#ff4d4d', textTransform: 'uppercase', marginBottom: 'clamp(12px, 3vw, 18px)' }}>
              ── AUTHORIZED HERO DEALER ──
            </div>
            <h1 className="hero-h1" style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 900, lineHeight: 0.93, letterSpacing: '-1px', marginBottom: 24 }}>
              FIND YOUR<br />
              <span style={{ color: '#FF0000' }}>PERFECT</span> RIDE
            </h1>
            <p style={{ fontSize: 'clamp(14px, 3vw, 17px)', color: 'rgba(255,255,255,0.72)', fontWeight: 500, maxWidth: 480, lineHeight: 1.65, marginBottom: 'clamp(24px, 5vw, 36px)' }}>
              Explore our full range of Hero bikes — commuters, sports, scooters & premium machines. Best prices guaranteed.
            </p>
            <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 14px)', flexWrap: 'wrap' }}>
              <button onClick={scrollToBook} className="enquire-btn" style={{ padding: 'clamp(10px, 2vw, 14px) clamp(20px, 4vw, 36px)', background: '#FF0000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Book Test Ride →
              </button>
              <a href="tel:+918650442200" style={{ padding: 'clamp(10px, 2vw, 14px) clamp(20px, 4vw, 36px)', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 8, fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                📞 Call Us
              </a>
            </div>
          </div>
          <div className="hero-bike-img" style={{ flex: '1 1 auto', minWidth: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="https://bikebazardelhi.com/uploads/vehicle/4545-removebg-preview.png" alt="Glamour Bike" style={{ width: '100%', maxWidth: 'clamp(250px, 22vw, 380px)', height: 'clamp(300px, 50vh, 500px)', objectFit: 'contain', filter: 'drop-shadow(0 10px 40px rgba(255,0,0,0.3))', transform: 'scale(1.7)' }} />
          </div>
        </div>
        {/* Stats bar */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 'clamp(20px, 5vw, 40px)', flexWrap: 'wrap', marginTop: 'clamp(40px, 8vw, 64px)', paddingTop: 'clamp(24px, 5vw, 40px)', borderTop: '1px solid rgba(255,255,255,0.12)' }} className="stats-row">
          {[['500+', 'Bikes Sold'], ['4.9★', 'Google Rating'], ['15+', 'Years Experience'], ['3', 'Showrooms']].map(([val, label]) => (
            <div key={label} className="stat-item">
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(24px, 6vw, 34px)', fontWeight: 900, color: '#FF0000', lineHeight: 1 }} className="stat-value">{val}</div>
              <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginTop: 4, letterSpacing: '0.04em' }} className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section style={{ background: '#fff', borderBottom: '1px solid #eee', padding: 'clamp(12px, 3vw, 20px) 5vw', position: 'sticky', top: 66, zIndex: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="filters-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} className="cat-btn" onClick={() => setActiveCategory(cat)} style={{
                padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                fontFamily: "'Barlow'",
                background: activeCategory === cat ? '#111' : '#fff',
                color: activeCategory === cat ? '#fff' : '#666',
                border: activeCategory === cat ? '1.5px solid #111' : '1.5px solid #ddd',
                cursor: 'pointer',
              }}>{cat}</button>
            ))}
          </div>
          <select onChange={e => setSortBy(e.target.value)} style={{ padding: '9px 14px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#444', background: '#fff', cursor: 'pointer', fontFamily: "'Barlow'" }}>
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </section>

      {/* Bikes Grid */}
      <section style={{ padding: 'clamp(40px, 8vw, 52px) 5vw clamp(60px, 12vw, 80px)', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
            <p style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#999', fontWeight: 600 }}>{filtered.length} bikes found</p>
          </div>
          <div className="bikes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(16px, 3vw, 24px)' }}>
            {filtered.map((bike, i) => (
              <div key={bike.id} className="bike-card" style={{
                background: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                border: '1.5px solid #eee',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms, box-shadow 0.28s ease`,
              }}>
                {/* Image */}
                <div style={{ background: '#f8f8f8', padding: 'clamp(20px, 4vw, 28px) clamp(16px, 3vw, 20px) clamp(16px, 3vw, 20px)', position: 'relative', overflow: 'hidden' }}>
                  {bike.tag && (
                    <span style={{ position: 'absolute', top: 'clamp(8px, 2vw, 14px)', left: 'clamp(8px, 2vw, 14px)', background: bike.tag === 'New' ? '#FF0000' : bike.tag === 'Best Seller' ? '#111' : '#FF6B00', color: '#fff', fontSize: 'clamp(9px, 1.5vw, 10px)', fontWeight: 800, letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                      {bike.tag}
                    </span>
                  )}
                  <img className="bike-img" src={bike.img} alt={bike.name} style={{ width: '100%', height: 'clamp(100px, 20vw, 160px)', objectFit: 'contain', display: 'block' }} />
                </div>
                {/* Info */}
                <div style={{ padding: 'clamp(16px, 3vw, 20px) clamp(14px, 3vw, 20px) clamp(16px, 3vw, 22px)' }}>
                  <div style={{ fontSize: 'clamp(9px, 1.5vw, 11px)', fontWeight: 700, color: '#FF0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'clamp(4px, 1vw, 6px)' }}>{bike.brand} · {bike.category}</div>
                  <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: '#111', marginBottom: 'clamp(8px, 2vw, 12px)', letterSpacing: '-0.02em' }}>{bike.name}</h3>
                  {/* Specs row */}
                  <div style={{ display: 'flex', gap: 0, marginBottom: 'clamp(12px, 2vw, 16px)', background: '#f5f5f5', borderRadius: 8, overflow: 'hidden' }}>
                    {[['⚡', bike.engine, 'Engine'], ['🛢', bike.fuel, 'Mileage']].map(([icon, val, label]) => (
                      <div key={label} style={{ flex: 1, padding: 'clamp(8px, 2vw, 10px) clamp(8px, 1.5vw, 12px)', textAlign: 'center', borderRight: '1px solid #eee' }}>
                        <div style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#aaa', fontWeight: 600, marginBottom: 'clamp(1px, 0.5vw, 2px)' }}>{icon} {label}</div>
                        <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 800, color: '#111' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(14px, 3vw, 18px)' }}>
                    <div>
                      <div style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#aaa', fontWeight: 600, marginBottom: 'clamp(1px, 0.5vw, 2px)' }}>Ex-showroom price</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: '#111', lineHeight: 1 }}>{bike.price}<span style={{ color: '#FF0000', fontSize: 'clamp(14px, 3vw, 18px)' }}>*</span></div>
                    </div>
                    
                  </div>
                  <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#aaa', fontWeight: 600, marginBottom: 'clamp(1px, 0.5vw, 2px)' }}>EMI from</div>
                      <div style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', fontWeight: 800, color: '#333' }}>{bike.emi}</div>
                    </div>
                  <button onClick={scrollToBook} className="enquire-btn" style={{ width: '100%', padding: 'clamp(10px, 2vw, 13px)', background: '#FF0000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 'clamp(12px, 2vw, 13px)', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: "'Barlow'" }}>
                    Enquire Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Finance Banner */}
      <section style={{ background: '#111', padding: '64px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, letterSpacing: '5px', color: '#FF0000', textTransform: 'uppercase', marginBottom: 14 }}>Easy Finance</div>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px', marginBottom: 14 }}>
              0% Down Payment<br /><span style={{ color: '#FF0000' }}>Available*</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: 500, maxWidth: 420, lineHeight: 1.65 }}>
              Get instant loan approval in 10 minutes. Low EMIs, flexible tenure. All major banks supported.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[['10 Min', 'Loan Approval'], ['0%', 'Down Payment*'], ['₹1,700', 'EMI Starts at'], ['5 yr', 'Max Tenure']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 40, fontWeight: 900, color: '#FF0000', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: 6, letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}