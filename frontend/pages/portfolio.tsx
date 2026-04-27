import { useState, useEffect } from 'react';
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
  return (
    <div className="portfolio-grid">
      {photos.map((photo) => (
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
      <main style={{ background: 'var(--bg-gradient)', minHeight: '100vh', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 48px 80px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.20em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Gallery
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 6vw, 60px)', fontWeight: 400, color: 'var(--text)', marginBottom: '48px' }}>
            Portfolio
          </h1>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Loading...</p>
            </div>
          ) : photos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>No photos yet</p>
            </div>
          ) : (
            <PortfolioGrid photos={photos} onPhotoClick={setModalPhoto} />
          )}
        </div>
        <Footer />
      </main>

      {modalPhoto && (
        <div
          className="portfolio-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setModalPhoto(null); }}
        >
          <div className="portfolio-modal">
            <button onClick={() => setModalPhoto(null)} className="portfolio-modal-close" aria-label="Close">
              <X size={20} />
            </button>
            <img
              src={modalPhoto.photo_url}
              alt={modalPhoto.caption || 'Portfolio photo'}
              style={{ width: '100%', maxHeight: '60vh', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ padding: '24px' }}>
              {modalPhoto.year && (
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', margin: '0 0 4px' }}>{modalPhoto.year}</p>
              )}
              {modalPhoto.caption && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--gold)', margin: '0 0 12px' }}>{modalPhoto.caption}</p>
              )}
              {modalPhoto.description && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.75, color: 'var(--text-muted)', margin: 0 }}>{modalPhoto.description}</p>
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 767px) {
  .portfolio-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  main > div { padding: 16px 16px 60px !important; }
}
.portfolio-card {
  transition: transform 300ms ease;
}
.portfolio-card:hover {
  transform: translateY(-2px);
}
.portfolio-thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 50%;
  transition: border-radius 400ms ease;
}
.portfolio-thumb:hover {
  border-radius: 1.7px;
}
.portfolio-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.portfolio-card-meta {
  padding: 8px 2px 0;
}
.portfolio-card-year {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: var(--gold);
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
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 18px;
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
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text);
  transition: all 200ms ease;
}
.portfolio-modal-close:hover {
  background: rgba(0,0,0,0.8);
}
`;
