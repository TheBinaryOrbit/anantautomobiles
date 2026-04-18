import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Images, Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Gallery({ showExplore = true, showHeader = true }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Hardcoded gallery items
  const galleryItems = [
    { id: "bike-1", src: "/gallery/1.avif", type: "image", caption: "Hero Splendor - Premium Comfort" },
    { id: "bike-3", src: "/gallery/3.avif", type: "image", caption: "Hero Xtreme 125R - Performance & Style" },
    { id: "bike-4", src: "/gallery/4.avif", type: "image", caption: "Hero Glamour - Sleek Design" },
    { id: "bike-5", src: "/gallery/5.avif", type: "image", caption: "Hero HF Deluxe - Trusted Commuter" },
    { id: "bike-6", src: "/gallery/6.avif", type: "image", caption: "Hero Destini 125 - Urban Classic" },
    { id: "bike-7", src: "/gallery/7.avif", type: "image", caption: "Hero Passion Pro - Value for Money" },
    { id: "bike-8", src: "/gallery/8.webp", type: "image", caption: "Hero Mavrick 440 - Adventure Ready" },
    { id: "bike-9", src: "/gallery/9.webp", type: "image", caption: "Hero Xoom 110 - Efficient Scooter" },
    { id: "bike-10", src: "/gallery/10.avif", type: "image", caption: "Hero Splendor Plus - Ultimate Reliability" },
    { id: "showroom", src: "/gallery/anant-automobiles-ahmedgarh-bulandshahr-motorcycle-dealers-o718x0e9rx.webp", type: "image", caption: "Anant Automobiles - Your Hero Authorized Dealer" }
  ];

  // Load gallery items
  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Set media directly from hardcoded items
      setMedia(galleryItems);
      console.log('Gallery loaded with', galleryItems.length, 'items');
      console.log('Gallery items:', galleryItems);
    } catch (error) {
      console.error('Gallery error:', error);
      setMedia(galleryItems); // Still use fallback on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const navigate = useCallback((dir) => {
    setLightboxIndex(prev => {
      if (prev === null) return null;
      let next = prev + dir;
      if (next < 0) return media.length - 1;
      if (next >= media.length) return 0;
      return next;
    });
  }, [media.length]);

  // Filter data
  const imagesOnly = media.filter(item => item.type === 'image');
  const videosOnly = media.filter(item => item.type === 'video');

  // Infinite Strip Component
  const InfiniteStrip = ({ items, direction = 'right' }) => {
    const stripRef = useRef(null);
    const position = useRef(0);
    const paused = useRef(false);
    const ITEM_WIDTH = 250; // 220px width + 30px gap

    useEffect(() => {
      const animate = () => {
        if (!paused.current && stripRef.current) {
          if (direction === 'right') {
            position.current -= 0.65;
            if (position.current <= -(items.length * ITEM_WIDTH)) position.current = 0;
          } else {
            position.current += 0.65;
            if (position.current >= 0) position.current = -(items.length * ITEM_WIDTH);
          }
          stripRef.current.style.transform = `translateX(${position.current}px)`;
        }
        requestAnimationFrame(animate);
      };
      const raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
    }, [direction, items.length]);

    if (items.length === 0) return null;

    return (
      <div style={{ 
        position: 'relative',
        overflow: 'hidden',
        paddingY: '8px',
        width: '100%'
      }}>
        <div 
          ref={stripRef} 
          style={{ 
            display: 'flex',
            gap: '30px',
            willChange: 'transform',
            padding: '8px 0'
          }}
        >
          {[...items, ...items, ...items].map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              onClick={() => setLightboxIndex(media.findIndex(m => m.id === item.id))}
              style={{ 
                flexShrink: 0,
                width: '220px',
                height: '165px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0'
              }}
              onMouseEnter={(e) => { 
                paused.current = true;
                e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => { 
                paused.current = false;
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              {item.type === 'video' ? (
                <video
                  src={item.src}
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    backgroundColor: '#e0e0e0'
                  }}
                  loading="lazy"
                  onLoad={(e) => {
                    console.log('✓ Image loaded:', item.src);
                  }}
                  onError={(e) => {
                    console.error('✗ Image failed to load - Path:', item.src);
                    console.error('Full URL attempted:', e.target.src);
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.border = '2px solid #ccc';
                  }}
                />
              )}

              {item.type === 'video' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  pointerEvents: 'none'
                }}>
                  <Play size={48} style={{ color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                </div>
              )}

              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
              />

              <p style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                lineHeight: '1.2',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
              >
                {item.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Lightbox
  const Lightbox = () => {
    if (lightboxIndex === null) return null;
    const item = media[lightboxIndex];

    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
        <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-white z-20">
          <X size={32} />
        </button>

        <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-6 top-1/2 -translate-y-1/2 text-white z-20">
          <ChevronLeft size={42} />
        </button>

        <div className="max-w-5xl w-full" onClick={e => e.stopPropagation()}>
          {item.type === 'video' ? (
            <video src={item.src} controls autoPlay className="w-full max-h-[82vh] rounded-2xl bg-black" />
          ) : (
            <img src={item.src} alt={item.caption} className="w-full max-h-[82vh] object-contain rounded-2xl" />
          )}
          <p className="text-white text-center mt-6 text-lg font-medium">{item.caption}</p>
        </div>

        <button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-white z-20">
          <ChevronRight size={42} />
        </button>
      </div>
    );
  };

  if (loading) return <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>Loading gallery...</div>;
  if (media.length === 0) return <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#999' }}>No gallery items found.</div>;

  return (
    <div style={{ padding: '24px 1rem' }}>
      {showHeader && (
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            padding: '8px 20px',
            borderRadius: '9999px',
            marginBottom: '1rem'
          }}>
            <Images size={16} style={{ color: '#dc2626' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626' }}>Our Gallery</span>
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#111', margin: '0 0 0.75rem' }}>Bike Showroom Gallery</h2>
          <p style={{ color: '#666', maxWidth: '720px', margin: '0 auto' }}>
            Explore our collection of bikes and showroom moments.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginLeft: '-1rem', marginRight: '-1rem' }}>
        {/* Row 1: Only Images */}
        {media.filter(item => item.type === 'image').length > 0 && (
          <InfiniteStrip items={media.filter(item => item.type === 'image')} direction="right" />
        )}

        {/* Row 2: Only Videos */}
        {media.filter(item => item.type === 'image').length > 0 && (
          <InfiniteStrip items={media.filter(item => item.type === 'image')} direction="left" />
        )}
      </div>

      {showExplore && media.length > 0 && (
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <Link
            to="/gallery"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              backgroundColor: '#dc2626',
              color: 'white',
              fontWeight: 600,
              borderRadius: '9999px',
              textDecoration: 'none',
              boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Explore Full Gallery
            <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {lightboxIndex !== null && <Lightbox />}
    </div>
  );
}
