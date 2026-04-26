// frontend/components/account/mobile/modals/ChatImageModal.tsx
//
// Full-screen image viewer for chat attachments.
//
// Features:
//   • Pinch-to-zoom on touch devices (via react-zoom-pan-pinch)
//   • Double-tap to toggle between fit and 2x zoom
//   • Single-finger pan when zoomed in
//   • Tap outside the image OR the × button to close
//   • Swipe down to close (iOS photo viewer convention)
//   • Escape key to close (desktop fallback)
//
// Pure presentational — parent controls whether it's open and what image
// to show. No data fetching here.

import { useEffect, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface ChatImageModalProps {
  open:     boolean;
  imageUrl: string | null;
  onClose:  () => void;
}

export default function ChatImageModal({ open, imageUrl, onClose }: ChatImageModalProps) {
  // Swipe-down-to-close tracking (attached to the modal root, not the
  // image — pinch-zoom gestures are consumed by TransformWrapper).
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);

  // Esc to close (desktop / keyboard users)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while the modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || !imageUrl) return null;

  const handleBackdropTouchStart = (e: React.TouchEvent) => {
    // Only track single-finger swipes so we don't fight the pinch gesture.
    if (e.touches.length !== 1) { setTouchStartY(null); return; }
    setTouchStartY(e.touches[0].clientY);
    setTouchDeltaY(0);
  };
  const handleBackdropTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    if (e.touches.length !== 1) return;
    const diff = e.touches[0].clientY - touchStartY;
    // Only react to downward swipes
    if (diff > 0) setTouchDeltaY(diff);
  };
  const handleBackdropTouchEnd = () => {
    if (touchDeltaY > 120) { onClose(); }
    setTouchStartY(null);
    setTouchDeltaY(0);
  };

  return (
    <div
      onClick={onClose}                    // tap background to close
      onTouchStart={handleBackdropTouchStart}
      onTouchMove={handleBackdropTouchMove}
      onTouchEnd={handleBackdropTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.94)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Visual feedback while swiping down to close
        opacity: touchDeltaY > 0 ? Math.max(0.3, 1 - (touchDeltaY / 400)) : 1,
        transform: touchDeltaY > 0 ? `translateY(${touchDeltaY}px)` : undefined,
        transition: touchStartY === null ? 'opacity 200ms, transform 200ms' : undefined,
      }}
    >
      {/* Close button — top-right */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: 'max(env(safe-area-inset-top), 16px)',
          right: 16,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.12)',
          border: 'none',
          color: '#fff',
          fontSize: 1.375rem,
          fontWeight: 400,
          lineHeight: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          WebkitTapHighlightColor: 'transparent',
        }}
      >✕</button>

      {/* Zoomable image */}
      <div
        onClick={(e) => e.stopPropagation()}  // taps on image don't close
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={5}
          doubleClick={{ mode: 'toggle', step: 1 }}
          wheel={{ step: 0.2 }}
          pinch={{ step: 5 }}
          centerOnInit={true}
          limitToBounds={true}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={imageUrl}
              alt="Chat attachment"
              style={{
                maxWidth: '100vw',
                maxHeight: '100vh',
                objectFit: 'contain',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
              draggable={false}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Hint at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 'max(env(safe-area-inset-bottom), 16px)',
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(10px, 2.6vw, 11px)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'rgba(255, 255, 255, 0.5)',
        pointerEvents: 'none',
      }}>
        Pinch to zoom · Double-tap · Swipe down to close
      </div>
    </div>
  );
}
