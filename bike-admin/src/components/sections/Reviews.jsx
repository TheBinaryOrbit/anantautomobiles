import { useRef, useState, useEffect } from 'react';

const reviews = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    rating: 5,
    avatar: 'https://static.vecteezy.com/system/resources/thumbnails/049/174/246/small/a-smiling-young-indian-man-with-formal-shirts-outdoors-photo.jpg',
    text: 'Excellent experience buying my Hero Splendor Plus! The staff at Anant Automobiles were very knowledgeable and helped me choose the perfect model for daily commuting. Best showroom in the area!',
  },
  {
    id: 2,
    name: 'Priyanshu Sharma',
    rating: 5,
    avatar: 'https://img.freepik.com/free-photo/closeup-young-hispanic-man-casuals-studio_662251-600.jpg',
    text: 'Got my Hero Xtreme 125R from Anant Automobiles and I\'m absolutely thrilled! The finance process was smooth, awesome after-sales service, and genuine spare parts availability. Highly recommended!',
  },
  {
    id: 3,
    name: 'Arjun Singh',
    rating: 5,
    avatar: 'https://img.freepik.com/free-photo/successful-businessman_1098-18155.jpg',
    text: 'Purchased Hero HF Deluxe and couldn\'t have asked for better service. The team explained all features patiently, got me excellent EMI rates in just 10 minutes. True professionals!',
  },
  {
    id: 4,
    name: 'Harshal Patel',
    rating: 5,
    avatar: 'https://thumbs.dreamstime.com/b/attractive-handsome-smart-indian-entrepreneur-27139689.jpg',
    text: 'My Hero Glamour purchase was hassle-free thanks to Anant Automobiles! Transparent pricing, no hidden charges, and they even helped with registration. The after-sales service team is fantastic!',
  },
  {
    id: 5,
    name: 'Vikram Joshi',
    rating: 5,
    avatar: 'https://static.vecteezy.com/system/resources/thumbnails/049/329/467/small/attractive-happy-north-indian-young-man-in-traditional-dress-with-isolated-on-transparent-background-cut-out-free-png.png',
    text: 'Bought Hero Destini 125 last month for my wife. The service here is outstanding - patient staff, best prices in town, and quick delivery. Already recommended to 5 friends!',
  },
  {
    id: 6,
    name: 'Laksh Wagh',
    rating: 5,
    avatar: 'https://png.pngtree.com/png-clipart/20240323/original/pngtree-young-indian-man-png-image_14660491.png',
    text: 'Hero Passion X from Anant Automobiles was a fantastic purchase! Their team is so friendly, explained battery specifications, fuel efficiency, and maintenance perfectly. Will come back!',
  },
  {
    id: 7,
    name: 'Suresh Yadav',
    rating: 5,
    avatar: 'https://t4.ftcdn.net/jpg/03/68/19/97/360_F_368199710_PLnFixaBph9LVYliDIwAIB5aWxGzAoCP.jpg',
    text: 'Amazing experience with Hero Splendor iSmart 110. The showroom staff knew every detail, got me insurance done in 15 minutes, and offered genuine extended warranty. Top class service!',
  },
  {
    id: 8,
    name: 'Karun Nair',
    rating: 5,
    avatar: 'https://i.pinimg.com/736x/46/29/03/4629035e6de4e1be57a9a81025ba742c.jpg',
    text: 'Got my Hero Mavrick 440 test ride yesterday and immediately decided to buy! Anant Automobiles made the whole experience seamless - from test drive to final delivery in 24 hours!',
  },
  {
    id: 9,
    name: 'Rohit Gupta',
    rating: 5,
    avatar: 'https://img.freepik.com/free-photo/cheerful-indian-businessman-smiling-closeup-portrait-jobs-career-campaign_53876-129417.jpg?semt=ais_hybrid&w=740&q=80',
    text: 'Hero Xoom 110cc scooter purchase from Anant Automobiles exceeded my expectations. Great price, genuine parts guarantee, and their service center is very professional. Highly satisfied!',
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