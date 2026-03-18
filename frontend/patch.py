#!/usr/bin/env python3
import re, os

files = [
    'pages/feasibility-check.tsx',
    'components/feasibility-test/ui/WizardScreen.tsx',
    'components/feasibility-test/ui/CheckItem.tsx',
    'components/feasibility-test/ui/CorrectableRow.tsx',
    'components/feasibility-test/ui/ResultsDisplay.tsx',
    'components/feasibility-test/ui/ScoreBox.tsx',
    'components/feasibility-test/ui/EstimateDisplay.tsx',
    'components/feasibility-test/ui/InfoDrawer.tsx',
    'components/feasibility-test/ui/IntroScreen.tsx',
]

for path in files:
    if not os.path.exists(path):
        print(f'skipped: {path}')
        continue
    with open(path) as f:
        content = f.read()

    # Remove textTransform uppercase and letterSpacing everywhere
    content = re.sub(r",?\s*textTransform:\s*'uppercase'(\s*as\s*const)?", '', content)
    content = re.sub(r",?\s*textTransform:\s*\"uppercase\"", '', content)
    content = re.sub(r",?\s*letterSpacing:\s*'[^']+'", '', content)
    content = re.sub(r",?\s*letterSpacing:\s*\"[^\"]+\"", '', content)
    content = re.sub(r",?\s*text-transform:\s*uppercase;?", '', content)
    content = re.sub(r",?\s*letter-spacing:\s*[^;]+;?", '', content)

    # Change fontFamily from font-ui to font-body everywhere except title
    # Keep font-display for titles, use font-body for everything else
    content = content.replace("var(--font-ui)", "var(--font-body)")

    # Now restore uppercase + tracking ONLY for:
    # 1. Phase bar label (PHASES[currentPhase])
    # 2. Buttons (.wiz-btn-primary, .wiz-btn-secondary, .disc-btn, .begin-btn, .btn-*)
    # 3. .tool-title stays as display font

    # Restore button text-transform in CSS classes
    content = content.replace(
        '.wiz-btn-primary {',
        '.wiz-btn-primary { text-transform: uppercase; letter-spacing: 0.12em;'
    )
    content = content.replace(
        '.wiz-btn-secondary {',
        '.wiz-btn-secondary { text-transform: uppercase; letter-spacing: 0.12em;'
    )
    content = content.replace(
        '.disc-btn {',
        '.disc-btn { text-transform: uppercase; letter-spacing: 0.12em;'
    )
    content = content.replace(
        '.begin-btn {',
        '.begin-btn { text-transform: uppercase; letter-spacing: 0.08em;'
    )
    content = content.replace(
        '.btn-export {',
        '.btn-export { text-transform: uppercase; letter-spacing: 0.1em;'
    )
    content = content.replace(
        '.btn-quote {',
        '.btn-quote { text-transform: uppercase; letter-spacing: 0.1em;'
    )
    content = content.replace(
        '.btn-restart {',
        '.btn-restart { text-transform: uppercase; letter-spacing: 0.1em;'
    )

    # Restore uppercase for phase label span only
    content = content.replace(
        '<span style={T.label}>{PHASES[currentPhase]',
        '<span style={{ ...T.label, textTransform: "uppercase", letterSpacing: "0.18em" }}>{PHASES[currentPhase]'
    )

    with open(path, 'w') as f:
        f.write(content)
    print(f'fixed: {path}')

print('Done.')
