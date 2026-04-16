import { useRef, useState, useEffect } from 'react';

const reviews = [
  {
    id: 1,
    name: 'Rahul Sharma',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'Buying my Royal Enfield Meteor 350 from here was an absolute breeze! The seamless process coupled with their excellent service made my bike buying journey truly delightful.',
  },
  {
    id: 2,
    name: 'Priya Mehta',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: "Choosing the Honda CB350 was a decision I'll never regret. From their extensive selection to impeccable service, they made my bike buying journey smooth and satisfying.",
  },
  {
    id: 3,
    name: 'Arjun Singh',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    text: "Getting my KTM Duke 390 from here was a fantastic choice! Their knowledgeable staff made purchasing my dream bike a breeze. I'm thrilled and couldn't be happier!",
  },
  {
    id: 4,
    name: 'Sneha Patel',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: 'Selecting the Bajaj Pulsar NS200 here was the best decision. The staff were professional and genuinely caring. They helped me find the perfect bike. Highly recommend!',
  },
  {
    id: 5,
    name: 'Vikram Joshi',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/74.jpg',
    text: 'Picked up my Yamaha FZ-S V3 last month and the experience was outstanding. Zero pressure sales, transparent pricing, and super fast loan approval. Best showroom!',
  },
  {
    id: 6,
    name: 'Anjali Verma',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
    text: 'The team at Anant Automobiles made my TVS Apache purchase so easy. They explained every detail patiently and got me the best EMI deal. Absolutely loved the experience!',
  },
  {
    id: 7,
    name: 'Suresh Kumar',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    text: 'Bought a Hero Splendor Plus for my daily commute. Great value, great service. The staff helped me choose the right model within my budget. Very happy with the purchase!',
  },
  {
    id: 8,
    name: 'Meera Nair',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/36.jpg',
    text: 'Got my Royal Enfield Himalayan here and the whole process was seamless. From test ride to finance approval to delivery — everything was on time. Outstanding showroom!',
  },
  {
    id: 9,
    name: 'Rohit Gupta',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/88.jpg',
    text: 'Purchased the Suzuki Gixxer SF 250 after much research and Anant Automobiles gave me the best price in the city. Their after-sales support is equally impressive!',
  },
];

// Desktop: 3 per page → 3 pages | Mobile: 1 per page → 9 pages
const DESKTOP_PER_PAGE = 3;
const MOBILE_PER_PAGE = 1;
const AUTO_INTERVAL = 4500;

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 17, color: i <= rating ? '#f59e0b' : '#e0e0e0', lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

function ReviewCard({ r }) {
  return (
    <div style={{
      flex: '1 1 0',
      minWidth: 0,
      background: '#fff',
      borderRadius: 18,
      border: '1px solid #e8e8e8',
      boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      marginTop: 28,
    }}>
      {/* Quote circle */}
      <div style={{
        width: 52, height: 52,
        background: '#111',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'absolute',
        top: -26, left: '50%',
        transform: 'translateX(-50%)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
        zIndex: 2, flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Body */}
      <div style={{ padding: '42px 26px 28px' }}>
        {/* Avatar + name + stars */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 18,
          paddingBottom: 16,
          borderBottom: '1px solid #f0f0f0',
        }}>
          <img
            src={r.avatar}
            alt={r.name}
            style={{
              width: 52, height: 52,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2.5px solid #eee',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 16, fontWeight: 800,
              color: '#111', margin: '0 0 5px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{r.name}</p>
            <Stars rating={r.rating} />
          </div>
        </div>

        {/* Review text */}
        <p style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 14.5,
          color: '#555',
          lineHeight: 1.8,
          margin: 0,
        }}>{r.text}</p>
      </div>
    </div>
  );
}

export default function Reviews() {
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(1);
  const [displayPage, setDisplayPage] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Reset page when switching between mobile/desktop
  useEffect(() => {
    setPage(0);
    setDisplayPage(0);
  }, [isMobile]);

  const perPage = isMobile ? MOBILE_PER_PAGE : DESKTOP_PER_PAGE;
  const totalPages = Math.ceil(reviews.length / perPage);

  const goTo = (nextPage, dir = 1) => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setDisplayPage(nextPage);
      setPage(nextPage);
      setAnimating(false);
    }, 340);
  };

  const next = () => goTo((page + 1) % totalPages, 1);
  const prev = () => goTo((page - 1 + totalPages) % totalPages, -1);

  useEffect(() => {
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [page, isMobile]);

  const pageReviews = reviews.slice(displayPage * perPage, displayPage * perPage + perPage);

  return (
    <section style={{ background: '#f2f2f2', padding: '64px 0 72px', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');

        @keyframes slideInRight  { from { opacity: 0; transform: translateX(52px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft   { from { opacity: 0; transform: translateX(-52px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideOutRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(52px);  } }
        @keyframes slideOutLeft  { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-52px); } }

        .reviews-inner {
          max-width: 1060px;
          margin: 0 auto;
          padding: 0 5vw;
        }

        .reviews-cards-wrap {
          display: flex;
          gap: 22px;
          align-items: stretch;
        }

        @media (max-width: 700px) {
          .reviews-cards-wrap {
            gap: 0;
          }
        }

        .nav-arrow {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid #ddd;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.09);
          flex-shrink: 0;
          transition: background 0.18s, border-color 0.18s;
        }
        .nav-arrow:hover {
          background: #111;
          border-color: #111;
        }
        .nav-arrow:hover svg path {
          stroke: #fff;
        }
      `}</style>

      <div className="reviews-inner">

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 12, marginBottom: 14,
          }}>
            <div style={{ width: 36, height: 1.5, background: '#aaa' }} />
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 13, fontWeight: 700,
              color: '#FF0000',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>Customer Reviews</span>
            <div style={{ width: 36, height: 1.5, background: '#aaa' }} />
          </div>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(30px,4.5vw,52px)',
            fontWeight: 900, color: '#111',
            margin: '0 0 10px',
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
          }}>
            What Our Customers Say
          </h2>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 16, fontWeight: 500,
            color: '#888', margin: 0,
          }}>
            Real stories from real riders
          </p>
        </div>

        {/* ── Cards ── */}
        <div
          className="reviews-cards-wrap"
          style={{
            animation: animating
              ? `${direction === 1 ? 'slideOutLeft' : 'slideOutRight'} 0.30s ease forwards`
              : `${direction === 1 ? 'slideInRight' : 'slideInLeft'} 0.36s ease both`,
            minHeight: 260,
          }}
        >
          {pageReviews.map(r => (
            <ReviewCard key={r.id} r={r} />
          ))}
        </div>

        {/* ── Dots + Arrows ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 14,
          marginTop: 38,
        }}>
          <button className="nav-arrow" onClick={prev} aria-label="Previous">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="#333" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > page ? 1 : -1)}
                style={{
                  width: page === i ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: page === i ? '#FF0000' : '#bbb',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          <button className="nav-arrow" onClick={next} aria-label="Next">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="#333" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}