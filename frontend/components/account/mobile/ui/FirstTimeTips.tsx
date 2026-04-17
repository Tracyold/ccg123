import { useState, useEffect } from 'react';

type TipType = 'menu-close' | 'drawer-slide' | 'panel-down';

interface FirstTimeTipsProps {
  type: TipType;
  show: boolean;
}

export default function FirstTimeTips({ type, show }: FirstTimeTipsProps) {
  const [hasSeen, setHasSeen] = useState(true); // Default to true to avoid flash
  
  // Use generic keys for gesture types so seeing ONE panel-down tip marks ALL as seen
  const storageKey = type === 'menu-close' 
    ? 'ccg_tip_seen_menu_close' 
    : type === 'drawer-slide' 
      ? 'ccg_tip_seen_drawer_slide' 
      : 'ccg_tip_seen_panel_down';

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setHasSeen(false);
    }
  }, [storageKey]);

  if (hasSeen || !show) return null;

  const markSeen = () => {
    localStorage.setItem(storageKey, 'true');
    setHasSeen(true);
  };

  return (
    <>
      <style>{`
        @keyframes tipJump {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.4); }
        }
        @keyframes tipSlideLeft {
          0% { transform: translateX(-20px); opacity: 0; }
          50% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-20px); opacity: 0; }
        }
        @keyframes tipBounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        
        .tip-overlay {
          position: fixed;
          inset: 0;
          z-index: 20000;
          pointer-events: none;
        }

        .tip-box {
          position: absolute;
          /* Changed from var(--gold) to a distinct color that pops against gold/dark backgrounds */
          background: #38bdf8; /* Sky blue */
          color: #0c0a09; /* Deep stone */
          padding: 6px 12px;
          border-radius: 20px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          pointer-events: auto;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tip-menu-close {
          top: 60px;
          right: 20px;
          animation: tipJump 1s ease-in-out infinite;
        }

        .tip-drawer-slide {
          top: 50%;
          left: 40px;
          transform: translateY(-50%);
          animation: tipSlideLeft 2s ease-in-out infinite;
        }

        .tip-panel-down {
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          animation: tipBounceDown 1s ease-in-out infinite;
        }

        .tip-arrow-right { border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid #0c0a09; }
        .tip-arrow-left { border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-right: 8px solid #0c0a09; }
        .tip-arrow-down { border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid #0c0a09; }
      `}</style>

      <div className="tip-overlay" onClick={markSeen}>
        {type === 'menu-close' && (
          <div className="tip-box tip-menu-close" onClick={markSeen}>
            Tap to close
          </div>
        )}

        {type === 'drawer-slide' && (
          <div className="tip-box tip-drawer-slide" onClick={markSeen}>
            <div className="tip-arrow-right" /> Slide right to close
          </div>
        )}

        {type === 'panel-down' && (
          <div className="tip-box tip-panel-down" onClick={markSeen}>
            Slide down <div className="tip-arrow-down" />
          </div>
        )}
      </div>
    </>
  );
}
