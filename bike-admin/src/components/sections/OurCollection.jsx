import { useState } from 'react';

const bikes = [
  {
    id: 1,
    model: 'Royal Enfield Meteor 350',
    brand: 'Royal Enfield',
    type: 'new',
    offerTitle: 'Upgrade Your Ride With Our Special Exchange Offer',
    saveLabel: 'Save Upto',
    saveAmount: '₹ 8,000',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
    bg: '#f5f0eb',
  },
  {
    id: 2,
    model: 'Bajaj Pulsar NS200',
    brand: 'Bajaj',
    type: 'new',
    offerTitle: 'Limited Time Exchange Offer',
    saveLabel: 'Save Upto',
    saveAmount: '₹ 7,500',
    image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?q=80&w=800&auto=format&fit=crop',
    bg: '#eef1f5',
  },
  {
    id: 3,
    model: 'Honda CB350',
    brand: 'Honda',
    type: 'new',
    offerTitle: 'Special Festival Discount On Select Models',
    saveLabel: 'Save Upto',
    saveAmount: '₹ 6,000',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=800&auto=format&fit=crop',
    bg: '#f0f5f0',
  },
  {
    id: 4,
    model: 'KTM Duke 390',
    brand: 'KTM',
    type: 'new',
    offerTitle: 'Get Zero Down Payment on Duke 390',
    saveLabel: 'Save Upto',
    saveAmount: '₹ 12,000',
    image: 'https://images.unsplash.com/photo-1558979159-2b18a4070a87?q=80&w=800&auto=format&fit=crop',
    bg: '#f5f0f0',
  },
  {
    id: 5,
    model: 'Hero Splendor Plus',
    brand: 'Hero',
    type: 'used',
    offerTitle: 'Certified Pre-Owned at Unbeatable Price',
    saveLabel: 'Save Upto',
    saveAmount: '₹ 3,500',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop',
    bg: '#f5f5f0',
  },
  {
    id: 6,
    model: 'Yamaha FZ-S V3',
    brand: 'Yamaha',
    type: 'used',
    offerTitle: 'Exchange Your Old Bike & Ride New FZ-S',
    saveLabel: 'Save Upto',
    saveAmount: '₹ 5,000',
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=800&auto=format&fit=crop',
    bg: '#eef0f5',
  },
];

const tabs = ['All', 'New', 'Used'];

export default function OurCollection() {
  const [active, setActive] = useState('All');
  const [hovered, setHovered] = useState(null);

  const filtered = bikes.filter(b =>
    active === 'All' ? true : b.type === active.toLowerCase()
  );

  return (
    <section style={{ background: '#fff', padding: '72px 5vw' }}>

      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 40,
      }}>
        <div>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: '#FF0000',
            textTransform: 'uppercase',
            marginBottom: 6,
            margin: '0 0 6px',
          }}>
            Explore
          </p>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 900,
            color: '#111',
            margin: 0,
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}>
            Our Collection
          </h2>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActive(t)}
              style={{
                padding: '9px 22px',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Barlow', sans-serif",
                borderRadius: 6,
                border: active === t ? 'none' : '1.5px solid #ddd',
                background: active === t ? '#111' : '#fff',
                color: active === t ? '#fff' : '#666',
                cursor: 'pointer',
                letterSpacing: '0.03em',
                transition: 'all 0.18s ease',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))',
        gap: 20,
      }}>
        {filtered.map(bike => (
          <div
            key={bike.id}
            onMouseEnter={() => setHovered(bike.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              borderRadius: 16,
              overflow: 'hidden',
              background: bike.bg,
              border: hovered === bike.id ? '1.5px solid #ddd' : '1.5px solid transparent',
              boxShadow: hovered === bike.id
                ? '0 12px 40px rgba(0,0,0,0.10)'
                : '0 2px 12px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease',
              transform: hovered === bike.id ? 'translateY(-4px)' : 'translateY(0)',
              cursor: 'pointer',
              minHeight: 200,
            }}
          >
            {/* Left — Bike Image */}
            <div style={{
              width: '48%',
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
              background: bike.bg,
            }}>
              <img
                src={bike.image}
                alt={bike.model}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transform: hovered === bike.id ? 'scale(1.06)' : 'scale(1)',
                  transition: 'transform 0.45s ease',
                  display: 'block',
                }}
              />
            </div>

            {/* Right — Content */}
            <div style={{
              flex: 1,
              padding: '24px 22px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: bike.bg,
            }}>
              {/* Top */}
              <div>
                {/* Model name + type badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: '#888',
                    textTransform: 'uppercase',
                  }}>
                    {bike.brand} · {bike.model.split(' ').slice(-2).join(' ')}
                  </span>
                </div>

                {/* Offer title */}
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(18px, 2vw, 22px)',
                  fontWeight: 800,
                  color: '#111',
                  margin: '0 0 16px',
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                }}>
                  {bike.offerTitle}
                </h3>

                {/* Save label + amount */}
                <div>
                  <p style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#777',
                    margin: '0 0 3px',
                    letterSpacing: '0.03em',
                  }}>
                    {bike.saveLabel}
                  </p>
                  <p style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(26px, 3vw, 34px)',
                    fontWeight: 900,
                    color: '#111',
                    margin: 0,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                    {bike.saveAmount}
                    <span style={{ color: '#FF0000', marginLeft: 2 }}>*</span>
                  </p>
                </div>
              </div>

              {/* Bottom — divider + Know More */}
              <div>
                <div style={{
                  height: 1,
                  background: 'rgba(0,0,0,0.08)',
                  margin: '18px 0 14px',
                }} />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#333',
                    letterSpacing: '0.02em',
                  }}>
                    Know More
                  </span>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: hovered === bike.id ? '#FF0000' : 'rgba(0,0,0,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.22s ease, transform 0.22s ease',
                    transform: hovered === bike.id ? 'rotate(-45deg)' : 'rotate(0deg)',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 12L12 2M12 2H5M12 2V9"
                        stroke={hovered === bike.id ? '#fff' : '#333'}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All */}
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <button
          style={{
            padding: '14px 40px',
            background: 'transparent',
            border: '2px solid #111',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "'Barlow', sans-serif",
            color: '#111',
            cursor: 'pointer',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#111';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#111';
          }}
        >
          View All Bikes →
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');

        @media (max-width: 520px) {
          /* Stack image on top for very small screens */
          .collection-card {
            flex-direction: column !important;
          }
          .collection-card-image {
            width: 100% !important;
            height: 200px !important;
          }
        }
      `}</style>
    </section>
  );
}