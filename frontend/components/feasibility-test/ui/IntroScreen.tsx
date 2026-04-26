import type { IntroPhase } from '../logic/feasibility-types'

interface IntroScreenProps {
  introPhase:     IntroPhase
  check1:         boolean
  check2:         boolean
  setCheck1:      (v: boolean) => void
  setCheck2:      (v: boolean) => void
  onConfirmDisc1: (timestamp: string) => void
  onConfirmDisc2: (timestamp: string) => void
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
            position: 'fixed', top: '14px', right: '18px',
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            padding: 0, cursor: 'pointer', opacity: 0.75,
            transition: 'opacity 200ms ease', zIndex: 10,
          }}
        >
          Skip
        </button>
      )}

      {/* Info lines */}
      {(introPhase === 'line1' || introPhase === 'line1exit') && (
        <p key={introPhase} className={`intro-line${introPhase === 'line1exit' ? ' fly-out' : ' fly-in'}`}>
          This tool provides a preliminary assessment for cut gemstones using industry standard metrics. 
        </p>
      )}
      {(introPhase === 'line2' || introPhase === 'line2exit') && (
        <p key={introPhase} className={`intro-line${introPhase === 'line2exit' ? ' fly-out' : ' fly-in'}`}>
          It is designed to assist both cutters and clients in and outside the jewelry industry.
        </p>
      )}

      {/* Disclaimer 1 */}
      {(introPhase === 'disc1' || introPhase === 'disc1exit') && (
        <div key={introPhase} className={`disc-card${introPhase === 'disc1exit' ? ' fly-out' : ' fly-in'}`}>
          <p className="disc-label">Terms of Use &nbsp;·&nbsp; 1 of 2</p>
          <p className="disc-text">
            By choosing to use this tool you acknowledge and understand that a preliminary evaluation is not equalivent
            to an in-person assessment. The tool may or may not provide accurate information for your specific gemstone. 
            Results rely on various combinations of characteristics you select. You hold harmless: Cutting Corners Gems,
            from misinterpretations of results, educational information or misuse of this tool.  
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
          <button className={`disc-btn${check1 ? ' on' : ''}`} onClick={() => onConfirmDisc1(new Date().toISOString())}>
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
            I understand this tool is intended for faceted gemstones only -- with or without damage.
            It does not provide accurate results for rough material, preformed stones or gemstones with
            excessive chemical or heat damage. 
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
          <button className={`disc-btn${check2 ? ' on' : ''}`} onClick={() => onConfirmDisc2(new Date().toISOString())}>
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

