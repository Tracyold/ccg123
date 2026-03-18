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

# Replace ALL clamp() font sizes with clean values
# Rule: min never below 17, sensible max
REPLACEMENTS = [
    # tiny labels → 17px minimum
    (r'clamp\(9px[^)]+\)',    'clamp(17px, 2vw, 17px)'),
    (r'clamp\(10px[^)]+\)',   'clamp(17px, 2vw, 17px)'),
    (r'clamp\(11px[^)]+\)',   'clamp(17px, 2vw, 17px)'),
    (r'clamp\(12px[^)]+\)',   'clamp(17px, 2vw, 17px)'),
    (r'clamp\(13px[^)]+\)',   'clamp(17px, 2vw, 19px)'),
    (r'clamp\(14px[^)]+\)',   'clamp(17px, 2vw, 19px)'),
    (r'clamp\(15px[^)]+\)',   'clamp(17px, 2vw, 19px)'),
    (r'clamp\(16px[^)]+\)',   'clamp(17px, 2vw, 19px)'),
    # body text → 19px
    (r'clamp\(17px[^)]+\)',   'clamp(19px, 2.2vw, 21px)'),
    # section titles keep larger
    (r'clamp\(24px[^)]+\)',   'clamp(26px, 4vw, 30px)'),
    (r'clamp\(26px[^)]+\)',   'clamp(28px, 4.5vw, 34px)'),
]

# Also fix raw font-size: Npx where N < 17
def fix_raw_px(m):
    n = int(m.group(1))
    if n < 17:
        return f'font-size: 17px'
    return m.group(0)

def fix_fontsize_num(m):
    n = int(m.group(1))
    if n < 17:
        return 'fontSize: 17,'
    return m.group(0)

for path in files:
    if not os.path.exists(path):
        print(f'skipped: {path}')
        continue
    with open(path) as f:
        content = f.read()
    for pattern, replacement in REPLACEMENTS:
        content = re.sub(pattern, replacement, content)
    content = re.sub(r'font-size:\s*(\d+)px', fix_raw_px, content)
    content = re.sub(r'fontSize:\s*(\d+),', fix_fontsize_num, content)
    with open(path, 'w') as f:
        f.write(content)
    print(f'fixed: {path}')

print('Done.')
