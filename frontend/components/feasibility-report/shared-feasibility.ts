export const precut = {
  id: 'CCG-2024-0317',
  date: 'March 7, 2026',
  analyst: 'M. Reynolds',
  gem: {
    species: 'Corundum',
    variety: 'Sapphire',
    origin: 'Ceylon',
    weight: '4.82 ct',
    measurements: '9.4 x 7.1 x 5.8 mm',
    color: 'Medium Blue — Strong',
    transparency: 'Transparent',
    currentCut: 'Mixed Oval — Poor Make',
  },
  condition: "Stone exhibits moderate surface abrasion across primary facets. Minor chip at girdle edge, 7 o'clock position. No through-fractures detected. Needle inclusions present in pavilion — non-threatening to structural integrity under standard cutting pressure.",
  symbolLegend: [
    { symbol: '○', type: 'Internal', desc: 'Needle inclusion' },
    { symbol: '•', type: 'Internal', desc: 'Crystal inclusion' },
    { symbol: '◇', type: 'Internal', desc: 'Void / negative crystal' },
    { symbol: '╱', type: 'Structural', desc: 'Fracture / feather' },
    { symbol: '≈', type: 'Structural', desc: 'Stress zone' },
    { symbol: '△', type: 'Surface', desc: 'Chip / nick' },
    { symbol: '~', type: 'Surface', desc: 'Abrasion zone' },
  ],
  structuralTable: [
    { feature: 'Needle inclusion cluster', location: "Pavilion, 3 o'clock", severity: 'Low', view: 'Crown + Pavilion' },
    { feature: 'Chip', location: "Girdle, 7 o'clock", severity: 'Low', view: 'Crown' },
    { feature: 'Stress zone', location: "Pavilion, 4-5 o'clock", severity: 'Low', view: 'Pavilion' },
    { feature: 'Surface abrasion', location: 'Table + upper crown', severity: 'Moderate', view: 'Crown' },
  ],
  recovery: { low: 72, high: 84, basis: 'Removal of surface abrasion and girdle chip. Needle inclusions remain below cutting risk threshold.' },
  conditionals: [
    'Color axis must be confirmed prior to orientation — stone shows potential color-change axis at 45° from table normal',
    'Girdle thickness should be maintained at minimum 0.3mm to preserve structural integrity',
    'Critical angle for this material: 34.9° — pavilion angle adjustment required for correct light return',
  ],
  options: [
    { label: 'A — Minimal', desc: 'Repolish only. Remove surface abrasion and re-cut girdle edge chip. No change to cutting style. Estimated yield: 80-84%. Fastest turnaround.' },
    { label: 'B — Corrective', desc: 'Recut to correct make. Improve symmetry, re-establish pavilion angles for correct light return, repolish all facets. Estimated yield: 74-80%. Recommended.' },
    { label: 'C — Full Recut', desc: 'New cut style. Optimize for color axis and critical angle. Oval or cushion recommended. Maximum color expression. Estimated yield: 72-76%. Longest lead time.' },
  ],
  summary: 'Stone presents well for recutting. No structural threats to the cutting process. Primary opportunity is in correcting make to improve optical performance and color expression. Option B recommended as balance of yield and performance improvement.',
};

export const postcut = {
  id: 'CCG-2024-0317',
  date: 'March 21, 2026',
  analyst: 'M. Reynolds',
  before: { weight: '4.82 ct', measurements: '9.4 x 7.1 x 5.8 mm', cut: 'Mixed Oval — Poor Make' },
  after: { weight: '3.94 ct', measurements: '8.6 x 6.8 x 4.9 mm', cut: 'Oval Brilliant — Corrective Recut' },
  yield: { value: 55.3, category: 'High Retention' },
  objectives: [
    'Restore surface polish and remove abrasion',
    'Re-establish correct pavilion angles for total internal reflection',
    "Correct girdle chip at 7 o'clock position",
    'Improve symmetry and meet-point accuracy',
  ],
  changeTable: [
    { feature: 'Surface abrasion (table + crown)', action: 'Full repolish — all crown facets', result: 'Resolved' },
    { feature: "Girdle chip, 7 o'clock", action: 'Recutting and girdle re-establishment', result: 'Resolved' },
    { feature: 'Poor pavilion angle', action: 'Pavilion re-cut to 41.5°', result: 'Resolved' },
    { feature: 'Symmetry deviation', action: 'Meet-point correction across all mains', result: 'Improved' },
    { feature: 'Needle inclusions', action: 'No action — below risk threshold', result: 'Retained — benign' },
  ],
  optical: [
    { aspect: 'Brightness', rating: 'Strong', note: 'High return across all viewing angles' },
    { aspect: 'Symmetry', rating: 'Very Good', note: 'Minor deviation in two star facets — within tolerance' },
    { aspect: 'Windowing', rating: 'None', note: 'Full extinction achieved at standard viewing angles' },
    { aspect: 'Color Expression', rating: 'Excellent', note: 'Deep blue saturation, even distribution' },
    { aspect: 'Color Change', rating: 'Noted', note: 'Subtle shift observed under incandescent — not primary characteristic' },
  ],
  documentation: [
    'Pre-cut photography — 4 images (crown, pavilion, profile x2)',
    'Post-cut photography — 6 images (crown, pavilion, profile x2, face-up, loupe)',
    'Pre-cut structural plot on file',
    'Post-cut structural plot on file',
    'Client communication log — 2 entries',
  ],
};

export const useCases = [
  { title: 'Collectors & Owners', body: 'Understand what you have. Know the condition of your stone, its structural integrity, and whether recutting is a viable option — before you commit to anything.' },
  { title: 'Resale Documentation', body: 'A damaged stone with a formal evaluation report is a more credible listing. Give the next buyer the information they need to make a confident decision.' },
  { title: 'Cutting Houses', body: 'Use the pre-cut report as an intake product to reduce inspection time and establish clear expectations with your clients before work begins.' },
  { title: 'Second Opinions', body: 'When a client wants independent verification of a cutting recommendation, the CCG Cut Feasibility Report provides an objective, documented assessment.' },
];

export const valueProps = [
  { n: '01', title: 'Before We Touch Your Stone', body: "Every cutting service begins with documentation. The pre-cut report records the stone's condition, structural features, and recovery range before any work begins." },
  { n: '02', title: 'Objective. No Estimates.', body: 'Reports are analytical documents only. They never include pricing or estimates. An estimate is provided separately on the work order once the report is complete.' },
  { n: '03', title: 'Standalone or Bundled', body: 'Available as a standalone product for resale documentation, second opinions, or intake diagnostics — or included automatically with any cutting service.' },
];
