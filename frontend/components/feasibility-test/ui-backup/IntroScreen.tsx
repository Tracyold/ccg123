import type { IntroPhase } from '../logic/feasibility-types'

interface IntroScreenProps {
  introPhase:    IntroPhase
  check1:        boolean
  check2:        boolean
  setCheck1:     (v: boolean) => void
  setCheck2:     (v: boolean) => void
  onConfirmDisc1: () => void
  onConfirmDisc2: () => void
  onBegin:        () => void
  onSkip:         () => void
}

export default function IntroScreen({
  introPhase, check1, check2,
  setCheck1, setCheck2,
  onConfirmDisc1, onConfirmDisc2,
  onBegin, onSkip,
}: IntroScreenProps) {
  return (
    <div className="center-stage">

      {/* Skip button */}
      {introPhase !== 'begin' && (
        <button
          onClick={onSkip}
          style={{
            position: 'absolute',
            top: 'clamp(18px, 3vh, 26px)',
            right: 'clamp(18px, 3vw, 30px)',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            padding: '8px 16px',
            cursor: 'pointer',
            borderRadius: 8,
            transition: 'all 180ms ease',
            zIndex: 10,
          }}
        >
          Skip
        </button>
      )}

      {/* Info lines */}
      {(introPhase === 'line1' || introPhase === 'line1exit') && (
        <p key={introPhase} className={`intro-line${introPhase === 'line1exit' ? ' fly-out' : ' fly-in'}`}>
          This guide is an immersive journey into stone evaluation from a gemstone cutter&#39;s perspective.
        </p>
      )}
      {(introPhase === 'line2' || introPhase === 'line2exit') && (
        <p key={introPhase} className={`intro-line${introPhase === 'line2exit' ? ' fly-out' : ' fly-in'}`}>
          It is designed with you in mind to bridge the gap between cutter and client communication.
        </p>
      )}
      {(introPhase === 'line3' || introPhase === 'line3exit') && (
        <p key={introPhase} className={`intro-line${introPhase === 'line3exit' ? ' fly-out' : ' fly-in'}`}>
          For clarity, each selection includes educational context accessed by clicking the information icon.
        </p>
      )}

      {/* Disclaimer 1 */}
      {(introPhase === 'disc1' || introPhase === 'disc1exit') && (
        <div key={introPhase} className={`disc-card${introPhase === 'disc1exit' ? ' fly-out' : ' fly-in'}`}>
          <p className="disc-label">Terms of Use &nbsp;·&nbsp; 1 of 2</p>
          <p className="disc-text">
            By choosing to use this tool you confirm and understand that this evaluation acts as a preliminary
            assessment that may or may not provide accurate information for your specific gemstone. Results are
            highly reliant on your selections. You hold harmless Cutting Corners Gems from any misinterpretation
            of results or otherwise educational information. Gemstones are a very nuanced field and depend on
            each individual situation.
          </p>
          <div className="disc-check-row" onClick={() => setCheck1(!check1)}>
            <div className={`disc-checkbox${check1 ? ' on' : ''}`}>
              {check1 && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <p className="disc-check-label">I understand and agree to these terms</p>
          </div>
          <button className={`disc-btn${check1 ? ' on' : ''}`} onClick={onConfirmDisc1}>
            Next
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Disclaimer 2 */}
      {(introPhase === 'disc2' || introPhase === 'disc2exit') && (
        <div key={introPhase} className={`disc-card${introPhase === 'disc2exit' ? ' fly-out' : ' fly-in'}`}>
          <p className="disc-label">Scope of Evaluation &nbsp;·&nbsp; 2 of 2</p>
          <p className="disc-text">
            I understand this evaluation is intended for faceted gemstones with or without damage.
            It does not provide evaluation for rough material, preformed stones, or gemstones with
            excessive chemical or heat damage. Those situations require an in-person assessment.
          </p>
          <div className="disc-check-row" onClick={() => setCheck2(!check2)}>
            <div className={`disc-checkbox${check2 ? ' on' : ''}`}>
              {check2 && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <p className="disc-check-label">I understand the scope of this evaluation</p>
          </div>
          <button className={`disc-btn${check2 ? ' on' : ''}`} onClick={onConfirmDisc2}>
            Confirm
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Begin */}
      {introPhase === 'begin' && (
        <button className="begin-btn" onClick={onBegin}>
          Begin
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

    </div>
  )
}
