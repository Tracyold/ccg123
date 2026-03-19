path = 'pages/admin/users/[id].tsx'
with open(path) as f:
    content = f.read()

# 1. Join wizard_results to service_requests fetch
content = content.replace(
    "supabase.from('service_requests').select('*').eq('account_user_id', uid)",
    "supabase.from('service_requests').select('*, wizard_results(*)').eq('account_user_id', uid)"
)

# 2. Add wizard result panel inside each service request card
old = (
    "                  <div style={{ fontSize: '17px', color: 'var(--gl)', marginBottom: '7px' }}>{sr.service_type}</div>\n"
    "                  <p style={{ fontSize: '17px', color: 'var(--tx)', marginBottom: '7px' }}>{sr.description}</p>\n"
    "                  <span style={{ fontSize: '17px', color: 'var(--d1)' }}>{fmtDate(sr.created_at)}</span>"
)
new = (
    "                  <div style={{ fontSize: '17px', color: 'var(--gl)', marginBottom: '7px' }}>{sr.service_type}</div>\n"
    "                  <p style={{ fontSize: '17px', color: 'var(--tx)', marginBottom: '7px' }}>{sr.description}</p>\n"
    "                  <span style={{ fontSize: '17px', color: 'var(--d1)' }}>{fmtDate(sr.created_at)}</span>\n"
    "                  {sr.wizard_results && (\n"
    "                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,211,105,0.04)', border: '0.5px solid rgba(255,211,105,0.2)', borderRadius: '4px' }}>\n"
    "                      <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gl)', marginBottom: '8px' }}>Linked Wizard Result</div>\n"
    "                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>\n"
    "                        <div>\n"
    "                          <div style={{ fontSize: '10px', color: 'var(--d1)', marginBottom: '2px' }}>Stone</div>\n"
    "                          <div style={{ fontSize: '13px', color: 'var(--tx)' }}>{[sr.wizard_results.stone_variety, sr.wizard_results.stone_species].filter(Boolean).join(' ') || '—'}</div>\n"
    "                        </div>\n"
    "                        <div>\n"
    "                          <div style={{ fontSize: '10px', color: 'var(--d1)', marginBottom: '2px' }}>Score</div>\n"
    "                          <div style={{ fontSize: '13px', color: 'var(--gl)', fontWeight: 600 }}>{Math.round(sr.wizard_results.feasibility_percent)}%</div>\n"
    "                        </div>\n"
    "                        <div>\n"
    "                          <div style={{ fontSize: '10px', color: 'var(--d1)', marginBottom: '2px' }}>Recommendation</div>\n"
    "                          <div style={{ fontSize: '13px', color: 'var(--tx)' }}>{sr.wizard_results.recommendation}</div>\n"
    "                        </div>\n"
    "                        <div>\n"
    "                          <div style={{ fontSize: '10px', color: 'var(--d1)', marginBottom: '2px' }}>Weight Loss Est.</div>\n"
    "                          <div style={{ fontSize: '13px', color: 'var(--tx)' }}>{sr.wizard_results.weight_loss}</div>\n"
    "                        </div>\n"
    "                      </div>\n"
    "                      {sr.wizard_results.disclaimer1_confirmed_at && (\n"
    "                        <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--d1)', fontStyle: 'italic' }}>\n"
    "                          Terms confirmed: {new Date(sr.wizard_results.disclaimer1_confirmed_at).toLocaleString()}\n"
    "                        </div>\n"
    "                      )}\n"
    "                    </div>\n"
    "                  )}"
)

if old in content:
    content = content.replace(old, new)
    print("Wizard result panel added.")
else:
    print("WARNING: Could not find target block. Check line ~292 in [id].tsx")
    print("Looking for: sr.service_type / sr.description / fmtDate(sr.created_at)")

with open(path, 'w') as f:
    f.write(content)
print("Done.")
