#!/usr/bin/env python3

# ── 1. feasibility-types.ts ───────────────────────────────────
path = 'components/feasibility-test/logic/feasibility-types.ts'
with open(path) as f:
    content = f.read()

content = content.replace(
    "  | { type: 'category-complete'; phase: number; title: string; message: string; nextTitle: string; nextDescription: string; isLastBeforeResults?: boolean }",
    "  | { type: 'category-complete'; phase: number; title: string; sectionName?: string; description?: string; message: string; nextTitle: string; nextDescription: string; isLastBeforeResults?: boolean }"
)

with open(path, 'w') as f:
    f.write(content)
print("1. feasibility-types.ts done.")

# ── 2. feasibility-check.tsx — update step data ───────────────
path2 = 'pages/feasibility-check.tsx'
with open(path2) as f:
    content = f.read()

content = content.replace(
    "s.push({ type: 'category-complete', phase: 1, title: 'Stone details saved.', message: \"Now let's look at what your stone does well.\", nextTitle: 'Positive Characteristics', nextDescription: 'Select everything that currently applies — even if it feels obvious.' })",
    "s.push({ type: 'category-complete', phase: 1, title: 'Category 1', sectionName: 'Positive Characteristics', description: 'Only select the characteristics that your stone currently exhibits — not what it used to exhibit or what it could exhibit. What it does exhibit now. Select ALL that apply, even if it seems redundant.', message: '', nextTitle: 'Positive Characteristics', nextDescription: '' })"
)

content = content.replace(
    "s.push({ type: 'category-complete', phase: 2, title: 'Positives recorded.', message: 'Now we look at what may be holding the stone back.', nextTitle: 'Limiting Characteristics', nextDescription: 'Select everything that currently applies — being accurate here is just as important as the positives.' })",
    "s.push({ type: 'category-complete', phase: 2, title: 'Category 2', sectionName: 'Limiting Characteristics', description: 'Select ALL characteristics that currently limit your stone. These are factors that reduce value or complicate cutting. Accurate limiting selections are just as important as the positive ones.', message: '', nextTitle: 'Limiting Characteristics', nextDescription: '' })"
)

content = content.replace(
    "s.push({ type: 'category-complete', phase: 3, title: 'Limitations noted.', message: 'One more section before the final step.', nextTitle: 'Structural Condition', nextDescription: 'This section looks at physical damage and internal features that affect whether the stone can safely be worked on.' })",
    "s.push({ type: 'category-complete', phase: 3, title: 'Category 3', sectionName: 'Structural Condition', description: 'This section addresses physical damage and internal features. Select anything that currently applies. These factors directly affect whether the stone can safely be worked on.', message: '', nextTitle: 'Structural Condition', nextDescription: '' })"
)

with open(path2, 'w') as f:
    f.write(content)
print("2. feasibility-check.tsx done.")

# ── 3. WizardScreen.tsx — import + replace block ──────────────
path3 = 'components/feasibility-test/ui/WizardScreen.tsx'
with open(path3) as f:
    content = f.read()

# Add import
if 'SectionIntroCard' not in content:
    content = content.replace(
        "import ResultsDisplay from './ResultsDisplay'",
        "import ResultsDisplay from './ResultsDisplay'\nimport SectionIntroCard from './SectionIntroCard'"
    )
    print("3a. Import added.")
else:
    print("3a. Import already present.")

# Find and replace the category-complete block
# Find the start marker
start_marker = "      {/* -- Category complete -- */}"
alt_marker = "      {/* ── Category complete ── */}"

new_block = """      {/* -- Category complete -- */}
      {currentStep.type === 'category-complete' && (
        <SectionIntroCard
          step={currentStep}
          stepIndex={stepIndex}
          onContinue={handleNext}
        />
      )}"""

# Try to find and replace the whole block
import re
pattern = r"\s*\{/\*[^*]*Category complete[^*]*\*/\}.*?currentStep\.type === 'category-complete' &&.*?\}\s*\}\s*\)"
match = re.search(pattern, content, re.DOTALL)
if match:
    content = content[:match.start()] + '\n' + new_block + '\n' + content[match.end():]
    print("3b. Category complete block replaced.")
else:
    print("3b. WARNING: Could not find category-complete block automatically.")
    print("    You will need to manually replace it in WizardScreen.tsx.")

with open(path3, 'w') as f:
    f.write(content)
print("3. WizardScreen.tsx done.")

