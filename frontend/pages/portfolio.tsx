import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

interface PortfolioPhoto {
  portfolio_photo_id: string;
  photo_url: string;
  year: string | null;
  caption: string | null;
  description: string | null;
  sort_order: number;
}

export default function PortfolioPage() {
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [modalPhoto, setModalPhoto] = useState<PortfolioPhoto | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('portfolio_photos')
        .select('*')
        .eq('published', true)
        .eq('archived', false)
        .order('sort_order', { ascending: true });
      setPhotos(data || []);
      setLoading(false);
    }
    load();
  }, []);

  // Handle tap behavior for mobile
  const handleCardClick = useCallback((photo: PortfolioPhoto) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      if (focusedId === photo.portfolio_photo_id) {
        // Second tap on same focused tile → open modal
        setModalPhoto(photo);
      } else {
        // First tap → focus this tile
        setFocusedId(photo.portfolio_photo_id);
      }
    } else {
      // Desktop → click opens modal
      setModalPhoto(photo);
    }
  }, [focusedId]);

  // Clear focus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-portfolio-card]')) {
        setFocusedId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Lock body scroll when modal open + Escape to close
  useEffect(() => {
    if (!modalPhoto) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalPhoto(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [modalPhoto]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: portfolioCss }} />
      <TopNav />
      <main style={{ background: '#050505', minHeight: '100vh', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 48px 80px' }}>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.20em',
              color: 'rgba(255,255,255,0.52)',
              marginBottom: '8px',
            }}
          >
            Gallery
          </p>
          <h1
            style={{
              fontFamily: "'Oranienbaum', serif",
              fontSize: 'clamp(30px, 6vw, 60px)',
              fontWeight: 400,
              color: '#FAFAFA',
              marginBottom: '48px',
            }}
          >
            Portfolio
          </h1>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.45)' }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Loading...
              </p>
            </div>
          ) : photos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.45)' }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                No photos yet
              </p>
            </div>
          ) : (
            <div className="portfolio-grid">
              {photos.map((photo) => {
                const isFocused = focusedId === photo.portfolio_photo_id;
                return (
                  <div
                    key={photo.portfolio_photo_id}
                    data-portfolio-card
                    onClick={() => handleCardClick(photo)}
                    className={`portfolio-card${isFocused ? ' focused' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="portfolio-thumb">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || 'Portfolio photo'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                      />
                      {/* Permanent vignette */}
                      <div className="portfolio-vignette" />
                      {/* Hover/focus caption overlay */}
                      <div className={`portfolio-caption-overlay${isFocused ? ' visible' : ''}`}>
                        {photo.caption && (
                          <span style={{
                            fontFamily: "'Comfortaa', sans-serif",
                            fontSize: '12px',
                            color: 'rgba(45, 212, 191, 1)',
                          }}>
                            {photo.caption}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Labels below thumbnail */}
                    <div style={{ padding: '10px 4px 0' }}>
                      {photo.year && (
                        <p style={{
                          fontFamily: "'Cormorant', serif",
                          fontSize: '13px',
                          color: '#d4af37',
                          margin: 0,
                        }}>
                          {photo.year}
                        </p>
                      )}
                      {photo.caption && (
                        <p style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.45)',
                          margin: '2px 0 0',
                        }}>
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </main>

      {/* Photo Modal */}
      {modalPhoto && (
        <div
          className="portfolio-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setModalPhoto(null); }}
        >
          <div className="portfolio-modal">
            <button
              onClick={() => setModalPhoto(null)}
              className="portfolio-modal-close"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <img
              src={modalPhoto.photo_url}
              alt={modalPhoto.caption || 'Portfolio photo'}
              style={{
                width: '100%',
                maxHeight: '60vh',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div style={{ padding: '24px' }}>
              {modalPhoto.year && (
                <p style={{
                  fontFamily: "'Cormorant', serif",
                  fontSize: '16px',
                  color: '#d4af37',
                  margin: '0 0 4px',
                }}>
                  {modalPhoto.year}
                </p>
              )}
              {modalPhoto.caption && (
                <p style={{
                  fontFamily: "'Comfortaa', sans-serif",
                  fontSize: '14px',
                  color: '#d4af37',
                  margin: '0 0 12px',
                }}>
                  {modalPhoto.caption}
                </p>
              )}
              {modalPhoto.description && (
                <p style={{
                  fontFamily: "'Comfortaa', sans-serif",
                  fontSize: '13px',
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.55)',
                  margin: 0,
                }}>
                  {modalPhoto.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const portfolioCss = `
.portfolio-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
@media (max-width: 767px) {
  .portfolio-grid { gap: 14px; }
  main > div { padding: 16px 16px 60px !important; }
}
.portfolio-card {
  transition: transform 220ms ease-out, box-shadow 220ms ease-out;
}
.portfolio-card:hover, .portfolio-card.focused {
  transform: translateY(-2px);
}
.portfolio-card:hover .portfolio-caption-overlay,
.portfolio-card.focused .portfolio-caption-overlay {
  opacity: 1;
}
.portfolio-card:hover .portfolio-thumb,
.portfolio-card.focused .portfolio-thumb {
  border-color: rgba(255,255,255,0.16);
  box-shadow: 0 18px 48px rgba(0,0,0,0.65);
}
.portfolio-thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #0A0A0A;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.55);
  transition: border-color 220ms ease-out, box-shadow 220ms ease-out;
}
.portfolio-vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 26px 12px rgba(0,0,0,0.60);
  pointer-events: none;
  z-index: 2;
}
.portfolio-caption-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  opacity: 0;
  transition: opacity 220ms ease-out;
  z-index: 3;
}
.portfolio-caption-overlay.visible {
  opacity: 1;
}
.portfolio-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: modalFadeIn 220ms ease-out;
}
@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.portfolio-modal {
  background: #0A0A0A;
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 18px;
  box-shadow: 0 28px 90px rgba(0,0,0,0.70);
  max-width: 680px;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
  width: 90%;
  animation: modalScaleIn 220ms ease-out;
}
@keyframes modalScaleIn {
  from { opacity: 0; transform: scale(0.985); }
  to { opacity: 1; transform: scale(1); }
}
.portfolio-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #FAFAFA;
  transition: all 200ms ease;
}
.portfolio-modal-close:hover {
  background: rgba(0,0,0,0.8);
  border-color: rgba(255,255,255,0.3);
}
`;
