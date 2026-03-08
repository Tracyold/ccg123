import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import TopNav from '../components/shared/TopNav';
import Footer from '../components/shared/Footer';
import { supabase } from '../lib/supabase';

interface PortfolioPhoto {
  portfolio_photo_id: string;
  photo_url: string;
  year: string | null;
  caption: string | null;
  description: string | null;
  sort_order: number;
}

function PortfolioGrid({ photos, onPhotoClick }: { photos: PortfolioPhoto[]; onPhotoClick: (p: PortfolioPhoto) => void }) {
  // Split photos into rows of 3
  const rows: PortfolioPhoto[][] = [];
  for (let i = 0; i < photos.length; i += 3) rows.push(photos.slice(i, i + 3));

  // IntersectionObserver — adds 'row-in-view' when row is in viewport
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('row-in-view');
          } else {
            entry.target.classList.remove('row-in-view');
          }
        });
      },
      { threshold: 0.25 }
    );
    rowRefs.current.forEach((el) => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [photos]);

  return (
    <div className="portfolio-rows">
      {rows.map((row, ri) => (
        <div
          key={ri}
          ref={(el) => { rowRefs.current[ri] = el; }}
          className="portfolio-row"
        >
          {row.map((photo) => (
            <div
              key={photo.portfolio_photo_id}
              onClick={() => onPhotoClick(photo)}
              className="portfolio-card"
              style={{ cursor: 'pointer' }}
            >
              <div className="portfolio-thumb">
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Portfolio photo'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
              </div>
              <div className="portfolio-card-meta">
                {photo.year && <p className="portfolio-card-year">{photo.year}</p>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
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
      <main style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 35%, #141414 60%, #0d0d0d 100%)', minHeight: '100vh', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 48px 80px' }}>
          <p
            style={{
              fontFamily: "'Comfortaa', sans-serif",
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
            <PortfolioGrid photos={photos} onPhotoClick={setModalPhoto} />
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
/* ── Row-based scroll layout ── */
.portfolio-rows {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.portfolio-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  /* Out of view: subtle blur + dim */
  filter: blur(1.8px) brightness(0.6);
  opacity: 0.5;
  transform: translateY(6px);
  transition:
    filter 600ms ease,
    opacity 600ms ease,
    transform 600ms ease;
}
.portfolio-row.row-in-view {
  filter: blur(0px) brightness(1);
  opacity: 1;
  transform: translateY(0px);
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .portfolio-row {
    grid-template-columns: 1fr 1fr;
  }
  main > div { padding: 16px 16px 60px !important; }
}

/* ── Card ── */
.portfolio-card {
  transition: transform 300ms ease;
}
.portfolio-card:hover {
  transform: translateY(-2px);
}

/* ── Thumbnail container ── */
.portfolio-thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 1.7px;
}

.portfolio-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* ── Caption overlay ── */

.portfolio-vignette {
  display: none;
}

.portfolio-card-meta {
  padding: 8px 2px 0;
}
.portfolio-card-year {
  font-family: 'Comfortaa', sans-serif;
  font-weight: 600;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: #fac825;
  margin: 0;
  text-align: left;
}
@media (max-width: 767px) {
  .portfolio-card-year { font-size: 10px; }
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
