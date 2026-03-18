#!/usr/bin/env python3

# ── 1. feasibility-types.ts — add 'welcome' to IntroPhase ────
path = 'components/feasibility-test/logic/feasibility-types.ts'
with open(path) as f:
    content = f.read()

content = content.replace(
    "export type IntroPhase =\n  | 'line1' | 'line1exit'",
    "export type IntroPhase =\n  | 'welcome'\n  | 'line1' | 'line1exit'"
)

with open(path, 'w') as f:
    f.write(content)
print("feasibility-types done.")

# ── 2. feasibility-check.tsx ──────────────────────────────────
path = 'pages/feasibility-check.tsx'
with open(path) as f:
    content = f.read()

# Start with 'welcome' instead of 'line1'
content = content.replace(
    "const [introPhase, setIntroPhase] = useState<IntroPhase>('line1')",
    "const [introPhase, setIntroPhase] = useState<IntroPhase>('welcome')"
)

# Add welcome timing — after 2s slide to line1
content = content.replace(
    "    if (introPhase === 'line1')     { const t = setTimeout(() => setIntroPhase('line1exit'), 3500); return () => clearTimeout(t) }",
    "    if (introPhase === 'welcome')   { const t = setTimeout(() => setIntroPhase('line1'),     2000); return () => clearTimeout(t) }\n    if (introPhase === 'line1')     { const t = setTimeout(() => setIntroPhase('line1exit'), 3500); return () => clearTimeout(t) }"
)

# Add welcome CSS class — title centered vertically
content = content.replace(
    "        .tool-title.intro-size {\n          font-size: clamp(36px, 8vw, 64px);\n          padding: clamp(80px,14vh,140px) 24px 0;\n          margin: 0 0 16px;\n        }",
    "        .tool-title.welcome-size {\n          font-size: clamp(36px, 8vw, 64px);\n          padding: 0 24px;\n          margin: 0;\n          position: absolute;\n          top: 50%;\n          left: 50%;\n          transform: translate(-50%, -50%);\n          width: 100%;\n          transition: none;\n          animation: titleFadeIn 800ms cubic-bezier(0.16,1,0.3,1) both;\n        }\n        .tool-title.intro-size {\n          font-size: clamp(36px, 8vw, 64px);\n          padding: clamp(80px,14vh,140px) 24px 0;\n          margin: 0 0 16px;\n        }"
)

# Make full-screen relative so absolute title works
content = content.replace(
    ".full-screen {\n          position: fixed; inset: 0; z-index: 100;\n          background: var(--bg);\n          display: flex; flex-direction: column;\n          overflow-y: auto; -webkit-overflow-scrolling: touch;\n        }",
    ".full-screen {\n          position: fixed; inset: 0; z-index: 100;\n          background: var(--bg);\n          display: flex; flex-direction: column;\n          overflow-y: auto; -webkit-overflow-scrolling: touch;\n          position: relative;\n        }"
)

# Apply welcome-size class when in welcome phase
content = content.replace(
    "<p className={`tool-title ${inWizard ? 'wizard-size' : 'intro-size'}`}>",
    "<p className={`tool-title ${inWizard ? 'wizard-size' : introPhase === 'welcome' ? 'welcome-size' : 'intro-size'}`}>"
)

# Hide rule and center-stage during welcome
content = content.replace(
    "<div className={`tool-rule ${inWizard ? 'wizard-rule' : 'intro-rule'}`} />",
    "{introPhase !== 'welcome' && <div className={`tool-rule ${inWizard ? 'wizard-rule' : 'intro-rule'}`} />}"
)

# Show center-stage only after welcome
content = content.replace(
    "        {/* Intro phase */}\n        {!inWizard && (",
    "        {/* Intro phase */}\n        {!inWizard && introPhase !== 'welcome' && ("
)

# Handle start over — go back to welcome
content = content.replace(
    "setResults(null); setIntroPhase('begin'); scrollTop()",
    "setResults(null); setIntroPhase('welcome'); scrollTop()"
)

# Skip during welcome goes to disc1
content = content.replace(
    "onSkip={() => setIntroPhase('disc1')}",
    "onSkip={() => introPhase === 'welcome' ? setIntroPhase('disc1') : setIntroPhase('disc1')}"
)

# Title text — add Welcome to intro only
content = content.replace(
    "          The Cut Feasibility Wizard\n        </p>",
    "          {introPhase === 'welcome' ? 'Welcome to the Cut Feasibility Wizard' : 'The Cut Feasibility Wizard'}\n        </p>"
)

with open(path, 'w') as f:
    f.write(content)
print("feasibility-check done.")
